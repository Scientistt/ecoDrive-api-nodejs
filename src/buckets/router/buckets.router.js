const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { name } = require("../../utils/urlParams.service");

const { listBuckets, getBucketInfo } = require("../controller/bucket.controller");

method.post(`/buckets`, init, listBuckets, end);
method.get(`/bucket/${name("bucketName")}/info`, init, getBucketInfo, end);

module.exports = method;
