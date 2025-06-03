const {
    S3Client,
    ListBucketsCommand,
    // HeadBucketCommand,
    GetBucketLocationCommand,
    GetBucketTaggingCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
    RestoreObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    CompleteMultipartUploadCommandOutput
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const { env } = require("process");

const paginationService = require("./pagination.service");

const AWS_REGION = env.AWS_REGION ? env.AWS_REGION : "us-east-2";
const AWS_ACCESS_KEY = env.AWS_ACCESS_KEY ? env.AWS_ACCESS_KEY : "us-east-1";
const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY ? env.AWS_SECRET_ACCESS_KEY : "us-east-1";

const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});

// ToDo: Save region on the supplier

const getBucketLocation = async (supplier, bucketName) => {
    try {
        const res = await (await getS3Client(supplier)).send(new GetBucketLocationCommand({ Bucket: bucketName }));

        return res.LocationConstraint || "us-east-1";
    } catch {
        return "unavailable";
    }
};

const getBucketCreationDate = async (supplier, bucketName) => {
    try {
        const res = await (await getS3Client(supplier)).send(new ListBucketsCommand({}));
        const bucket = res.Buckets.find((b) => b.Name === bucketName);

        return bucket.CreationDate || "1857-04-18T01:00:00.000Z";
    } catch {
        return "unavailable";
    }
};

const getBucketTags = async (supplier, bucketName) => {
    try {
        const res = await (await getS3Client(supplier)).send(new GetBucketTaggingCommand({ Bucket: bucketName }));

        return (res.TagSet || []).map((tag) => ({
            key: tag.Key,
            value: tag.Value
        }));
    } catch {
        return [];
    }
};

const translateRestoreMessage = (message) => {
    if (!message) {
        return {
            status: "UNAVAILABLE",
            is_restoring: false,
            is_restored: false,
            available_until: null
        };
    }

    const isOngoing = /ongoing-request="true"/.test(message);
    const isComplete = /ongoing-request="false"/.test(message);

    const expiryMatch = message.match(/expiry-date="([^"]+)"/);
    const expiresAt = expiryMatch ? new Date(expiryMatch[1]).toISOString() : null;

    return {
        status: isOngoing ? "RESTORING" : isComplete ? "RESTORED" : "UNKNOWN",
        is_restoring: isOngoing,
        is_restored: isComplete,
        available_until: expiresAt
    };
};
const getS3Client = async (supplier) => {
    return new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: supplier.account_key,
            secretAccessKey: supplier.account_secret
        }
    });
};

module.exports = {
    async listBuckets(supplier, filter, pagination) {
        try {
            const hasToDownloadDetails = !!filter?.details;

            //

            //ToDo: Isso aqui não existe, mas depois eu removo
            const limit = pagination?.limit || 0;

            const command = new ListBucketsCommand({});
            const response = await (await getS3Client(supplier)).send(command);

            const buckets = [];
            if (response["$metadata"].httpStatusCode === 200) {
                let bucketCount = 1;
                for (const i in response.Buckets) {
                    if (!hasToDownloadDetails)
                        buckets.push({
                            name: response.Buckets[i].Name,
                            created_at: response.Buckets[i].CreationDate
                        });
                    else {
                        const bucket = await module.exports.getBucketInfo(supplier, response.Buckets[i].Name);

                        buckets.push(bucket);
                    }
                    if (bucketCount++ === limit && limit !== 0) break;
                }
            }

            return paginationService.parseListToPagination(pagination, { elements: buckets });
        } catch (error) {
            return { error };
        }
    },

    async getBucketInfo(supplier, bucketName) {
        // const exists = await doesBucketExists(bucketName);
        // if (exists?.error) return exists;

        const bucket = {
            name: bucketName,
            exists: true,
            region: await getBucketLocation(supplier, bucketName),
            tags: await getBucketTags(supplier, bucketName),
            created_at: await getBucketCreationDate(supplier, bucketName)
            // ToDo: inserir mais informações úteis aqui
        };

        return bucket;
    },

    async listBucketObjects(supplier, bucketName, pagination, filter = {}) {
        // const exists = await doesBucketExists(bucketName);
        // if (exists?.error) return exists;

        try {
            const s3Client = await getS3Client(supplier);

            const pgnatiion = paginationService.parsePagination(pagination);

            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: filter.prefix,
                Delimiter:
                    Object.prototype.hasOwnProperty.call(filter, "tree") && filter.tree !== "" && filter.tree
                        ? "/"
                        : undefined,
                MaxKeys: pgnatiion.limit === 0 ? undefined : pgnatiion.limit,
                ContinuationToken: Object.hasOwn(filter, "page") && filter.page !== "" ? filter.page : undefined
            });

            const response = await s3Client.send(command);

            const dirs =
                response.CommonPrefixes?.map((p) => {
                    return {
                        kind: "dir",
                        bucket: bucketName,
                        name: p.Prefix,
                        key: Buffer.from(p.Prefix).toString("base64").replace(/=/g, ""),
                        _token: response.IsTruncated ? response.NextContinuationToken : null
                    };
                }) || [];

            const files = response.Contents
                ? await Promise.all(
                      response.Contents?.map(async (obj) => {
                          const headCommand = new HeadObjectCommand({
                              Bucket: bucketName,
                              Key: obj.Key
                          });
                          const resp = await s3Client.send(headCommand);
                          return {
                              kind: "file",
                              bucket: bucketName,
                              key: Buffer.from(obj.Key).toString("base64").replace(/=/g, ""),
                              name: obj.Key,
                              size: obj.Size,
                              tier: obj.StorageClass,
                              updated_at: obj.LastModified,
                              _token: response.IsTruncated ? response.NextContinuationToken : null,
                              restore: translateRestoreMessage(resp.Restore || null)
                              // eTag: obj.ETag
                          };
                      })
                  )
                : [];

            // return paginationService.parseListToPagination(pgnatiion, { elements: dirs.concat(files) });
            const dirsReady = paginationService.parseListToScrollPagination(pgnatiion, {
                elements: dirs.concat(files)
            });

            return dirsReady;
        } catch (error) {
            return { error };
        }
    },

    // ToDo: IMplementar o uso do suplier dinâmico
    async getObjectInfo({ supplier, bucketName, objectKey }) {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: objectKey
            });

            const result = await (await getS3Client(supplier)).send(command);
            return {
                bucket: bucketName,
                name: objectKey,
                key: Buffer.from(objectKey).toString("base64").replace(/=/g, ""),
                size: result.ContentLength,
                contentType: result.ContentType,
                updated_at: result.LastModified,
                metadata: result.Metadata || {},
                tier: result.StorageClass || null,
                restore: translateRestoreMessage(result.Restore || null)
            };
        } catch (error) {
            return { error };
        }
    },

    // ToDo: IMplementar o uso do suplier dinâmico
    async deleteObject({ supplier, bucketName, objectKey }) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: objectKey
            });

            return (await getS3Client(supplier)).send(command);
        } catch (error) {
            return { error };
        }
    },

    // ToDo: IMplementar o uso do suplier dinâmico
    async restoreObject({ supplier, bucketName, objectKey, days, tier }) {
        try {
            const command = new RestoreObjectCommand({
                Bucket: bucketName,
                Key: objectKey,

                RestoreRequest: {
                    Days: days,
                    GlacierJobParameters: {
                        Tier: tier
                    }
                }
            });

            await (await getS3Client(supplier)).send(command);

            return module.exports.getObjectInfo({ supplier, bucketName, objectKey });
        } catch (error) {
            if (error.name === "RestoreAlreadyInProgress") {
                return { error: new Error("Solicitação já está em andamento") };
            } else {
                return { error };
            }
        }
    },

    // ToDo: IMplementar o uso do suplier dinâmico
    async downloadObject({ bucketName, objectKey, expiresInSeconds, supplier }) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey
            });

            const url = await getSignedUrl(await getS3Client(supplier), command, {
                expiresIn: expiresInSeconds
            });

            return {
                url
            };
        } catch (error) {
            if (error.name === "RestoreAlreadyInProgress") {
                return { error: new Error("Solicitação já está em andamento") };
            } else {
                return { error };
            }
        }
    },

    async uploadObject({ supplier, bucketName, objectKey, file, storage }) {
        try {
            const fileStream = fs.createReadStream(file.path);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: fileStream,
                ContentType: file.mimetype,
                StorageClass: storage
            });
            await (await getS3Client(supplier)).send(command);

            return module.exports.getObjectInfo({ supplier, bucketName, objectKey });
        } catch (error) {
            return { error };
        }
    },

    async uploadObjectMultiPart({ supplier, bucketName, objectKey, file, storage }) {
        try {
            const fileStream = fs.createReadStream(file.path);

            const upload = new Upload({
                client: await getS3Client(supplier),
                params: {
                    Bucket: bucketName,
                    Key: objectKey,
                    Body: fileStream,
                    ContentType: file.mimetype,
                    StorageClass: storage
                },
                queueSize: 4,
                partSize: 5 * 1024 * 1024,
                leavePartsOnError: false
            });

            // const counter = 1;

            // upload.on("httpUploadProgress", (progress) => {
            //     const percent = ((progress.loaded / file.Size) * 100).toFixed(2);
            // });

            await upload.done();

            return module.exports.getObjectInfo({ supplier, bucketName, objectKey });
        } catch (error) {
            return { error };
        }
    }
};
