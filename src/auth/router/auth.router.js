const method = require("express").Router();
const { init, end } = require("../../utils/request.service");

const { login, isAuth, logout } = require("../controller/auth.controller");

method.post(`/login`, init, login, end);

method.get(`/is-auth`, init, isAuth, end);

method.delete(`/logout`, init, logout, end);

module.exports = method;
