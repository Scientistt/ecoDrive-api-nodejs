const { S3Client, ListBucketsCommand, HeadBucketCommand, GetBucketLocationCommand, GetBucketTaggingCommand, ListObjectsV2Command, HeadObjectCommand, RestoreObjectCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const { env } = require("process");

const paginationService = require("./pagination.service");

const AWS_REGION = env.AWS_REGION ? env.AWS_REGION : "us-east-1";
const AWS_ACCESS_KEY = env.AWS_ACCESS_KEY ? env.AWS_ACCESS_KEY : "us-east-1";
const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY ? env.AWS_SECRET_ACCESS_KEY : "us-east-1";

const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

const doesBucketExists = async (bucketName) => {
    try {
        return true;
    } catch (err) {
        return { error: err };
    }
};

const getBucketLocation = async (bucketName) => {
    try {
        const res = await s3Client.send(new GetBucketLocationCommand({ Bucket: bucketName }));

        return res.LocationConstraint || "us-east-1";
    } catch (error) {
        return "unavailable";
    }
};

const getBucketCreationDate = async (bucketName) => {
    try {
        const res = await s3Client.send(new ListBucketsCommand({}));
        const bucket = res.Buckets.find((b) => b.Name === bucketName);

        return bucket.CreationDate || "1857-04-18T01:00:00.000Z";
    } catch (error) {
        return "unavailable";
    }
};

const getBucketTags = async (bucketName) => {
    try {
        const res = await s3Client.send(new GetBucketTaggingCommand({ Bucket: bucketName }));

        return (res.TagSet || []).map((tag) => ({
            key: tag.Key,
            value: tag.Value,
        }));
    } catch (error) {
        return [];
    }
};

const translateRestoreMessage = (message) => {
    if (!message) {
        return {
            status: "UNAVAILABLE",
            is_restoring: false,
            is_restored: false,
            available_until: null,
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
        available_until: expiresAt,
    };
};

module.exports = {
    async getS3Client() {
        return s3Client;
    },

    async listBuckets(filter, pagination) {
        try {
            //ToDo: Isso aqui não existe, mas depois eu removo
            let limit = pagination?.limit || 0;

            const command = new ListBucketsCommand({});
            const response = await s3Client.send(command);
            let buckets = [];
            if (response["$metadata"].httpStatusCode === 200) {
                let bucketCount = 1;
                for (let i in response.Buckets) {
                    buckets.push({
                        name: response.Buckets[i].Name,
                        created_at: response.Buckets[i].CreationDate,
                    });
                    if (bucketCount++ === limit && limit !== 0) break;
                }
            }

            return paginationService.parseListToPagination(pagination, { elements: buckets });
        } catch (error) {
            return { error: error };
        }
    },

    async getBucketInfo(bucketName) {
        let exists = await doesBucketExists(bucketName);
        if (exists?.error) return exists;

        let bucket = {
            name: bucketName,
            exists: true,
            region: await getBucketLocation(bucketName),
            tags: await getBucketTags(bucketName),
            created_at: await getBucketCreationDate(bucketName),
            // ToDo: inserir mais informações úteis aqui
        };

        return bucket;
    },

    async listBucketObjects(bucketName, pagination, filter = {}) {
        let exists = await doesBucketExists(bucketName);
        if (exists?.error) return exists;

        try {
            let pgnatiion = paginationService.parsePagination(pagination);

            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: filter.prefix,
                Delimiter: filter.hasOwnProperty("tree") && filter.tree !== "" && filter.tree ? "/" : undefined,
                MaxKeys: pgnatiion.limit === 0 ? undefined : pgnatiion.limit,
                ContinuationToken: filter.hasOwnProperty("page") && filter.page !== "" ? filter.page : undefined,
            });

            const response = await s3Client.send(command);

            const dirs =
                response.CommonPrefixes?.map((p) => {
                    return {
                        kind: "dir",
                        bucket: bucketName,
                        name: p.Prefix,
                        key: Buffer.from(p.Prefix).toString("base64").replace(/=/g, ""),
                        _token: response.IsTruncated ? response.NextContinuationToken : null,
                    };
                }) || [];

            const files =
                response.Contents?.map((obj) => {
                    return {
                        kind: "file",
                        bucket: bucketName,
                        key: Buffer.from(obj.Key).toString("base64").replace(/=/g, ""),
                        name: obj.Key,
                        size: obj.Size,
                        tier: obj.StorageClass,
                        updated_at: obj.LastModified,
                        _token: response.IsTruncated ? response.NextContinuationToken : null,
                        restore: translateRestoreMessage(response.Restore || null),
                        // eTag: obj.ETag
                    };
                }) || [];

            // return paginationService.parseListToPagination(pgnatiion, { elements: dirs.concat(files) });
            const dirsReady = paginationService.parseListToScrollPagination(pgnatiion, { elements: dirs.concat(files) });

            return dirsReady;
        } catch (error) {
            return { error: error };
        }
    },

    async getObjectInfo(bucketName, objectKey) {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });

            const result = await s3Client.send(command);
            return {
                bucket: bucketName,
                name: objectKey,
                key: Buffer.from(objectKey).toString("base64").replace(/=/g, ""),
                size: result.ContentLength,
                contentType: result.ContentType,
                updated_at: result.LastModified,
                metadata: result.Metadata || {},
                tier: result.StorageClass || null,
                restore: translateRestoreMessage(result.Restore || null),
            };
        } catch (error) {
            return { error: error };
        }
    },

    async deleteObject(bucketName, objectKey) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });

            return await s3Client.send(command);
        } catch (error) {
            return { error: error };
        }
    },

    async restoreObject(bucketName, objectKey, params) {
        try {
            let days = params.days;
            let tier = params.tier;

            const command = new RestoreObjectCommand({
                Bucket: bucketName,
                Key: objectKey,

                RestoreRequest: {
                    Days: days,
                    GlacierJobParameters: {
                        Tier: tier,
                    },
                },
            });

            await s3Client.send(command);

            return module.exports.getObjectInfo(bucketName, objectKey);
        } catch (error) {
            if (error.name === "RestoreAlreadyInProgress") {
                return { error: new Error("Solicitação já está em andamento") };
            } else {
                return { error: error };
            }
        }
    },

    async downloadObject(bucketName, objectKey, params) {
        try {
            let expiresInSeconds = params.expiresInSeconds;

            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });

            const url = await getSignedUrl(s3Client, command, {
                expiresIn: expiresInSeconds,
            });

            return {
                url: url,
            };
        } catch (error) {
            if (error.name === "RestoreAlreadyInProgress") {
                return { error: new Error("Solicitação já está em andamento") };
            } else {
                return { error: error };
            }
        }
    },

    async uploadObject(bucketName, objectKey, file) {
        try {
            const fileStream = fs.createReadStream(file.path);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: fileStream,
                ContentType: file.mimetype,
                StorageClass: "DEEP_ARCHIVE",
            });
            await s3Client.send(command);
            return module.exports.getObjectInfo(bucketName, objectKey);
        } catch (error) {
            if (error.name === "RestoreAlreadyInProgress") {
                return { error: new Error("Solicitação já está em andamento") };
            } else {
                return { error: error };
            }
        }
    },
};
