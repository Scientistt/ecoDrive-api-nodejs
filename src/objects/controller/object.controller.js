const objectService = require("../service/object.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();

const ObjectSchema = require("../../utils/schema/Object");

const fs = require("fs");

module.exports = {
    async listObjects(req, res, next) {
        const buckets = await objectService.listObjects(
            req.response.params.supplier,
            req.params.bucketName,
            req.body.pagination,
            req.body.filter
        );

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
        const buckets = await objectService.getObjectInfo(req.params.bucketName, req.params.objectKey);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.object = buckets;
        return next();
    },

    async deleteObject(req, res, next) {
        const buckets = await objectService.deleteObject(req.params.bucketName, req.params.objectKey);

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
        const buckets = await objectService.restoreObject(req.params.bucketName, req.params.objectKey, req.body);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.CREATED;
        return next();
    },

    async downloadObject(req, res, next) {
        const buckets = await objectService.downloadObject(req.params.bucketName, req.params.objectKey, req.body);

        if (buckets.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = buckets.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.object.url = buckets.url;
        return next();
    },

    async uploadObject(req, res, next) {
        console.log("Arrived at uploadObject controller: ", req.file);
        if (!req.file) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = new Error("Invalid file");
            return end(req, res);
        }

        // const { bucket, name } = req.body;

        const validatedObject = ObjectSchema.validate({ ...req.body });

        if (!validatedObject.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedObject.err };
            return end(req, res);
        }

        const file = req.file;

        const buckets = await objectService.getObjectInfo(
            req.params.bucketName,
            Buffer.from(validatedObject.data.name).toString("base64").replace(/=/g, "")
        );

        if (!buckets.error) {
            fs.unlinkSync(file.path);

            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = new Error("Nome ja está em uso");
            return end(req, res);
        }

        const object = await objectService.uploadObject({
            supplier: req.response.params.supplier,
            bucketName: req.params.bucketName,
            objectKey: validatedObject.data.name,
            file,
            storage: validatedObject.data.storage
        });

        fs.unlinkSync(file.path);

        if (object.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.meta.error = object.error;
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.CREATED;
        req.response.body.object = object;
        return next();
    }
};
