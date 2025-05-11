const accountService = require("../service/account.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();
const constantsService = require("../../utils/constants.service");

const UserSchema = require("../../utils/schema/User");

module.exports = {
    async validateAccountCreationVoucher(req, res, next) {
        if (req.body.voucher) {
            if (req.body.voucher === "FVN1E96") {
                req.response.meta.feedback = FEEDBACK.OK;
                return next();
            }
        }

        req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
        return end(req, res);
    },

    async validateAccountCreationEmail(req, res, next) {
        const validatedUser = UserSchema.validate({
            ...req.body,
            name: "decoy name",
            login: "decoy_login",
            sex: "N",
            password: "Dec0y#p4ss",
            whitelabel_id: constantsService.getDefaultWhitelabel().id
        });

        if (!validatedUser.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedUser.err };
            return end(req, res);
        }

        const user = await accountService.validateAccountCreationEmail(validatedUser.data.email);

        if (!user) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: user.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.OK;
        return next();
    },

    async validateAccountCreationLogin(req, res, next) {
        const validatedUser = UserSchema.validate({
            ...req.body,
            name: "decoy name",
            email: "decoyemail@email.com",
            sex: "N",
            password: "Dec0y#p4ss",
            whitelabel_id: constantsService.getDefaultWhitelabel().id
        });

        console.log("Validated: ", validatedUser);

        if (!validatedUser.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedUser.err };
            return end(req, res);
        }

        const user = await accountService.validateAccountCreationLogin(validatedUser.data.login);

        console.log("Validated: ", user);

        if (!user) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: user.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.OK;
        return next();
    },

    async createAccount(req, res, next) {
        const validatedUser = UserSchema.validate({
            ...req.body,
            whitelabel_id: constantsService.getDefaultWhitelabel().id
        });

        console.log("Deu bigode? ", {
            ...req.body,
            whitelabel_id: constantsService.getDefaultWhitelabel().id
        });

        if (!validatedUser.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: validatedUser.err };
            return end(req, res);
        }

        const user = await accountService.createAccount(validatedUser.data);

        if (user.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body.user = { error: user.error };
            return end(req, res);
        }

        req.response.meta.feedback = FEEDBACK.CREATED;
        req.response.body.user = user;
        return next();
    }
};
