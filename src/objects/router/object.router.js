const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { name, id } = require("../../utils/urlParams.service");
const { upload } = require("../../utils/upload.service");

const { getSupp } = require("../../supplier/controller/supplier.controller");
const { isAuth } = require("../../auth/controller/auth.controller");

const {
    listObjects,
    getObjectInfo,
    restoreObject,
    downloadObject,
    uploadObject,
    deleteObject
} = require("../controller/object.controller");

method.post(
    `/supplier/${id("supplierId")}/bucket/${name("bucketName")}/object`,
    init,
    isAuth,
    getSupp,
    upload.single("file"),
    uploadObject,
    end
);

method.post(
    `/supplier/${id("supplierId")}/bucket/${name("bucketName")}/objects`,
    init,
    isAuth,
    getSupp,
    listObjects,
    end
);

method.get(
    `/supplier/${id("supplierId")}/bucket/${name("bucketName")}/object/${name("objectKey")}`,
    init,
    isAuth,
    getSupp,
    getObjectInfo,
    downloadObject,
    end
);

method.delete(
    `/supplier/${id("supplierId")}/bucket/${name("bucketName")}/object/${name("objectKey")}`,
    init,
    isAuth,
    getSupp,
    deleteObject,
    end
);

method.post(
    `/supplier/${id("supplierId")}/bucket/${name("bucketName")}/object/${name("objectKey")}/restore`,
    init,
    isAuth,
    getSupp,
    restoreObject,
    end
);

module.exports = method;
