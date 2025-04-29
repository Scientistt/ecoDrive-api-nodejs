const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { listBuckets } = require("../controller/bucket.controller");

method.post(`/buckets`, init, listBuckets, end);

module.exports = method;
