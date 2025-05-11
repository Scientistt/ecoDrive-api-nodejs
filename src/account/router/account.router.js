const method = require("express").Router();
const { init, end } = require("../../utils/request.service");
const { isAuth } = require("../../auth/controller/auth.controller");

const {
    validateAccountCreationVoucher,
    validateAccountCreationEmail,
    validateAccountCreationLogin,
    createAccount
} = require("../controller/account.controller");

method.post(`/account/validate/voucher`, init, validateAccountCreationVoucher, end);

method.post(`/account/validate/email`, init, validateAccountCreationEmail, end);

method.post(`/account/validate/login`, init, validateAccountCreationLogin, end);

method.post(`/account`, init, validateAccountCreationVoucher, createAccount, end);

module.exports = method;
