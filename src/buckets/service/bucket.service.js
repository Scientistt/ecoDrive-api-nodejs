const awsService = require("../../utils/aws.service");

module.exports = {
    async listBuckets() {
        let myBuckets = await awsService.listBuckets();
        return myBuckets;
    },

    async getBucketInfo(bucketName) {
        let myBuckets = await awsService.getBucketInfo(bucketName);
        return myBuckets;
    },
};
