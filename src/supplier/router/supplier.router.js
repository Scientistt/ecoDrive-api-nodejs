const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { slug } = require("../../utils/urlParams.service");

const { isAuth } = require("../../auth/controller/auth.controller");
const { createSupplier, listSuppliers, getSupplier } = require("../controller/supplier.controller");

method.post(`/supplier`, init, isAuth, createSupplier, end);

method.post(`/suppliers`, init, isAuth, listSuppliers, end);

method.get(`/supplier/${slug("supplierSlug")}`, init, isAuth, getSupplier, end);

module.exports = method;
