const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { name } = require("../../utils/urlParams.service");

const { listObjects, getObjectInfo, restoreObject, downloadObject } = require("../controller/object.controller");

method.post(`/bucket/${name('bucketName')}/objects`, init, listObjects, end);

method.get(`/bucket/${name('bucketName')}/object/${name('objectKey')}/info`, init, getObjectInfo, end);

method.post(`/bucket/${name('bucketName')}/object/${name('objectKey')}/restore`, init, restoreObject, end);

method.post(`/bucket/${name('bucketName')}/object/${name('objectKey')}/download`, init, downloadObject, end);

module.exports = method;
