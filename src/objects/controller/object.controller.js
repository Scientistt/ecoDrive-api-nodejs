const objectService = require("../service/object.service");
const { end } = require('../../utils/request.service');
const FEEDBACK = require('../../utils/feedback.service').getFeedbacks();

module.exports = {
    async listObjects(req, res, next) {
        let buckets = await objectService.listObjects(req.params.bucketName, req.body.pagination, req.body.filter);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.ERROR;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.LISTED;
        req.response.body.object = buckets;
        return next();
    },

    async getObjectInfo(req, res, next) {
        let buckets = await objectService.getObjectInfo(req.params.bucketName, req.params.objectKey);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.object = buckets;
        return next();
    },

    async restoreObject(req, res, next) {
        let buckets = await objectService.restoreObject(req.params.bucketName, req.params.objectKey, req.body);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.CREATED;
        return next();
    },

    async downloadObject(req, res, next) {
        let buckets = await objectService.downloadObject(req.params.bucketName, req.params.objectKey, req.body);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.object = buckets;
        return next();
    },
};
