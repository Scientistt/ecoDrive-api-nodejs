const awsService = require("../../utils/aws.service");

module.exports = {
    async listObjects(supplier, bucketName, pagination, filter) {
        const myObject = await awsService.listBucketObjects(supplier, bucketName, pagination, filter);
        return myObject;
    },

    async getObjectInfo(options) {
        const decodedKey = Buffer.from(options.objectKey, "base64").toString("utf-8");
        const myObject = await awsService.getObjectInfo({ ...options, objectKey: decodedKey });
        return myObject;
    },

    async deleteObject(bucketName, objectKey) {
        const decodedKey = Buffer.from(objectKey, "base64").toString("utf-8");
        const myObject = await awsService.deleteObject(bucketName, decodedKey);
        return myObject;
    },

    async restoreObject(supplier, bucketName, objectKey, params) {
        const decodedKey = Buffer.from(objectKey, "base64").toString("utf-8");
        const myObject = await awsService.restoreObject({ supplier, bucketName, objectKey: decodedKey, ...params });
        return myObject;
    },

    async downloadObject(options) {
        const decodedKey = Buffer.from(options.objectKey, "base64").toString("utf-8");
        const myObject = await awsService.downloadObject({ ...options, objectKey: decodedKey });
        return myObject;
    },

    async uploadObject(options) {
        const myObject = await awsService.uploadObjectMultiPart(options);
        return myObject;
    }

    // async getBucket(bucketName) {
    //     let myBuckets = await awsService.getBucket(bucketName);
    //     return myBuckets;
    // },
};
