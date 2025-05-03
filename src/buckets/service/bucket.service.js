const awsService = require("../../utils/aws.service");

module.exports = {
    async listBuckets(filter, pagination) {
        let myBuckets = await awsService.listBuckets(filter, pagination);
        return myBuckets;
    },

    async getBucketInfo(bucketName) {
        let myBuckets = await awsService.getBucketInfo(bucketName);
        return myBuckets;
    },
};
