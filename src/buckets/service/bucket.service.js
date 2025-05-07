const awsService = require("../../utils/aws.service");

module.exports = {
    async listBuckets(filter, pagination) {
        const myBuckets = await awsService.listBuckets(filter, pagination);
        return myBuckets;
    },

    async getBucketInfo(bucketName) {
        const myBuckets = await awsService.getBucketInfo(bucketName);
        return myBuckets;
    }
};
