const bucketService = require("../service/bucket.service");

module.exports = {
    async listBuckets(req, res, next) {
        req.response.body.message = await bucketService.listBucketsFromAWS();

        return next();
    },
};
