const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { slug, id } = require("../../utils/urlParams.service");

const { isAuth } = require("../../auth/controller/auth.controller");
const {
    validateSupplierSlug,
    createSupplier,
    listSuppliers,
    getSupplier,
    deleteSupplier
} = require("../controller/supplier.controller");

method.get(
    `/supplier/${id("supplierId")}/validate/slug/${slug("supplierSlug")}`,
    init,
    isAuth,
    validateSupplierSlug,
    end
);

method.post(`/supplier`, init, isAuth, createSupplier, end);

method.post(`/suppliers`, init, isAuth, listSuppliers, end);

method.get(`/supplier/${slug("supplierSlug")}`, init, isAuth, getSupplier, end);

method.delete(`/supplier/${id("supplierId")}`, init, isAuth, deleteSupplier, end);

module.exports = method;
