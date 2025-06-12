const supplierService = require("../service/supplier.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();

const SupplierSchema = require("../../utils/schema/Supplier");

module.exports = {
    async validateSupplierSlug(req, res, next) {
        const validatedSupplier = SupplierSchema.validate({
            slug: req.params.supplierSlug,
            name: "decoy",
            description: "decoy",
            account_supplier: "aws",
            account_key: "x",
            account_secret: "y"
        });

        if (!validatedSupplier.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedSupplier.err };
            return end(req, res);
        }

        const supplier = await supplierService.validateSupplierSlug(req.params.supplierId, validatedSupplier.data.slug);

        if (!supplier) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.supplier = { error: supplier.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.OK;
        return next();
    },

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

        req.response.meta.feedback = FEEDBACK.READ;
        req.response.params.supplier = supplier;
        return next();
    },

    async deleteSupplier(req, res, next) {
        const supplier = await supplierService.deleteSupplier(req.params.supplierId, req);

        if (supplier.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.supplier = { error: supplier.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.READ;
        // req.response.body.supplier = supplier;
        return next();
    }
};
