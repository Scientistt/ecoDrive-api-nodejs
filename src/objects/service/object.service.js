const awsService = require('../../utils/aws.service')

module.exports = {
    async listObjects(bucketName, pagination, filter) {
        let myObject = await awsService.listBucketObjects(bucketName, pagination, filter);
        return myObject;
    },

    async getObjectInfo(bucketName, objectKey) {
        let decodedKey = Buffer.from(objectKey, 'base64').toString('utf-8');
        let myObject = await awsService.getObjectInfo(bucketName, decodedKey);
        return myObject;
    },

    async restoreObject(bucketName, objectKey, params) {
        let decodedKey = Buffer.from(objectKey, 'base64').toString('utf-8');
        let myObject = await awsService.restoreObject(bucketName, decodedKey, params);
        return myObject;
    },

    async downloadObject(bucketName, objectKey, params) {
        let decodedKey = Buffer.from(objectKey, 'base64').toString('utf-8');
        let myObject = await awsService.downloadObject(bucketName, decodedKey, params);
        return myObject;
    },

    // async getBucket(bucketName) {
    //     let myBuckets = await awsService.getBucket(bucketName);
    //     return myBuckets;
    // },
};
