const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { name, id } = require("../../utils/urlParams.service");

const { listBuckets, getBucketInfo } = require("../controller/bucket.controller");
const { getSupp } = require("../../supplier/controller/supplier.controller");
const { isAuth } = require("../../auth/controller/auth.controller");

method.post(`/supplier/${id("supplierId")}/buckets`, init, isAuth, getSupp, listBuckets, end);

method.get(`/supplier/${id("supplierId")}/bucket/${name("bucketName")}`, init, isAuth, getSupp, getBucketInfo, end);

module.exports = method;
