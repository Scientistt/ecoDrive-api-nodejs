const authService = require("../service/auth.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();
const { getClientIp } = require("../../utils/ip.service");

const LoginSchema = require("../../utils/schema/Login");

module.exports = {
    async login(req, res, next) {
        const validatedLogin = LoginSchema.validate({
            ...req.body
        });

        if (!validatedLogin.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedLogin.err };
            return end(req, res);
        }

        const { error, user, token } = await authService.login(validatedLogin.data, getClientIp(req));

        if (error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.token = { error };
            req.response.body.user = { error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.CREATED;
        req.response.user = user;
        req.response.body.user = user;
        req.response.body.token = token;
        return next();
    },

    async isAuth(req, res, next) {
        const { error, user } = await authService.isAuth(req, getClientIp(req));

        if (error) {
            req.response.meta.feedback = FEEDBACK.FORBIDDEN;
            // req.response.body.token = { error };
            // req.response.body.user = { error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.VALIDATED;
        req.response.params.user = user;

        return next();
    },

    async isAuthenticated(req, res, next) {
        const { error, user, token } = await authService.isAuth(req, getClientIp(req));

        if (error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.token = { error };
            req.response.body.user = { error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.VALIDATED;
        req.response.params.user = user;
        req.response.body.user = user;
        req.response.body.token = token;
        return next();
    },

    async logout(req, res, next) {
        await authService.logout(req, getClientIp(req));
        req.response.meta.feedback = FEEDBACK.OK;
        return next();
    }
};
