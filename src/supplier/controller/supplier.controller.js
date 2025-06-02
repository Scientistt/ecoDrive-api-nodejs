const supplierService = require("../service/supplier.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();

const SupplierSchema = require("../../utils/schema/Supplier");

module.exports = {
    async createSupplier(req, res, next) {
        const validatedSupplier = SupplierSchema.validate({
            ...req.body
        });

        if (!validatedSupplier.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedSupplier.err };
            return end(req, res);
        }

        const supplier = await supplierService.createSupplier(validatedSupplier.data, req);

        if (supplier.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.supplier = { error: supplier.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.CREATED;
        req.response.body.supplier = supplier;
        return next();
    },

    async listSuppliers(req, res, next) {
        const supplier = await supplierService.listSuppliers(req.body.filter, req.body.pagination, req);

        if (supplier.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.supplier = { error: supplier.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.supplier = supplier;
        return next();
    },

    async getSupplier(req, res, next) {
        const supplier = await supplierService.getSupplier(req.params.supplierSlug);

        if (supplier.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.supplier = { error: supplier.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.body.supplier = supplier;
        return next();
    },

    async getSupp(req, res, next) {
        const supplier = await supplierService.getSupp(req.params.supplierId, req.response.params.user);

        if (supplier.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.supplier = { error: supplier.error };
            return end(req, res);
        }

        console.log("Vamos fazer o upload?");

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.params.supplier = supplier;
        return next();
    }
};
