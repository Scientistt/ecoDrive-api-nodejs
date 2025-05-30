const bucketService = require("../service/bucket.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();

module.exports = {
    async listBuckets(req, res, next) {
        const buckets = await bucketService.listBuckets(
            req.response.params.supplier,
            req.body.filter,
            req.body.pagination
        );

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.ERROR;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.LISTED;
        req.response.body.bucket = buckets;
        return next();
    },

    async getBucketInfo(req, res, next) {
        const bucket = await bucketService.getBucketInfo(req.response.params.supplier, req.params.bucketName);

        if (bucket.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = bucket.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.bucket = bucket;
        return next();
    }
};
