const awsService = require("../../utils/aws.service");

module.exports = {
    async listObjects(supplier, bucketName, pagination, filter) {
        const myObject = await awsService.listBucketObjects(supplier, bucketName, pagination, filter);
        return myObject;
    },

    async getObjectInfo(bucketName, objectKey) {
        const decodedKey = Buffer.from(objectKey, "base64").toString("utf-8");
        const myObject = await awsService.getObjectInfo(bucketName, decodedKey);
        return myObject;
    },

    async deleteObject(bucketName, objectKey) {
        const decodedKey = Buffer.from(objectKey, "base64").toString("utf-8");
        const myObject = await awsService.deleteObject(bucketName, decodedKey);
        return myObject;
    },

    async restoreObject(bucketName, objectKey, params) {
        const decodedKey = Buffer.from(objectKey, "base64").toString("utf-8");
        const myObject = await awsService.restoreObject(bucketName, decodedKey, params);
        return myObject;
    },

    async downloadObject(bucketName, objectKey, params) {
        const decodedKey = Buffer.from(objectKey, "base64").toString("utf-8");
        const myObject = await awsService.downloadObject(bucketName, decodedKey, params);
        return myObject;
    },

    async uploadObject(options) {
        const myObject = await awsService.uploadObjectMP(options);
        return myObject;
    }

    // async getBucket(bucketName) {
    //     let myBuckets = await awsService.getBucket(bucketName);
    //     return myBuckets;
    // },
};
