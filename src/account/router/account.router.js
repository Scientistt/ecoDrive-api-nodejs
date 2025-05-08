const method = require("express").Router();
const { init, end } = require("../../utils/request.service");

const { createAccount } = require("../controller/account.controller");

method.post(`/account`, init, createAccount, end);

module.exports = method;
