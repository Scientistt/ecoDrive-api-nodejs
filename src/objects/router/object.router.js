const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { name } = require("../../utils/urlParams.service");
const { upload } = require("../../utils/upload.service");

const {
    listObjects,
    getObjectInfo,
    restoreObject,
    downloadObject,
    uploadObject,
    deleteObject
} = require("../controller/object.controller");

method.post(`/bucket/${name("bucketName")}/object`, init, upload.single("file"), uploadObject, end);

method.post(`/bucket/${name("bucketName")}/objects`, init, listObjects, end);

method.get(`/bucket/${name("bucketName")}/object/${name("objectKey")}`, init, getObjectInfo, downloadObject, end);

method.delete(`/bucket/${name("bucketName")}/object/${name("objectKey")}`, init, deleteObject, end);

method.post(`/bucket/${name("bucketName")}/object/${name("objectKey")}/restore`, init, restoreObject, end);

module.exports = method;
