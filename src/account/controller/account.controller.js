const accountService = require("../service/account.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();
const constantsService = require("../../utils/constants.service");

const UserSchema = require("../../utils/schema/User");

module.exports = {
    async createAccount(req, res, next) {
        const validatedUser = UserSchema.validate({
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
