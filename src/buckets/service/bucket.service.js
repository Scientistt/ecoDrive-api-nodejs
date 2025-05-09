const awsService = require("../../utils/aws.service");

module.exports = {
    async listBuckets(supplier, filter, pagination) {
        const myBuckets = await awsService.listBuckets(supplier, filter, pagination);
        return myBuckets;
    },

    async getBucketInfo(supplier, bucketName) {
        const myBuckets = await awsService.getBucketInfo(supplier, bucketName);
        return myBuckets;
    }
};
