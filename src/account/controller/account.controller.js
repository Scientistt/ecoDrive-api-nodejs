const accountService = require("../service/account.service");
const { end } = require("../../utils/request.service");
const FEEDBACK = require("../../utils/feedback.service").getFeedbacks();
const constantsService = require("../../utils/constants.service");
const { sendMail } = require("../../utils/mailsend.service");

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
        //console.log("User created: ", user);

        // Envia email de boas-vindas após a criação da conta
        const mailOptions = {
            from: `"Equipe EcoDrive" <ti@novotemposupermercados.com.br>`,
            to: user.email,
            subject: `Seja muito bem-vindo ao EcoDrive, ${user.name}!`,
            text: `Olá ${user.name},\n\nBem-vindo ao EcoDrive! Sua conta foi criada com sucesso.\n\n Seu login é ${user.login}\n\nAtenciosamente,\nEquipe EcoDrive`
        };
        try {
            await sendMail(mailOptions);
            console.log("Welcome email sent to: ", user.email);
        } catch (error) {
            console.error("Erro ao enviar email: ", error);
            req.response.meta.feedback = FEEDBACK.INTERNAL_ERROR;
            req.response.body.user = { error: "Failed to send welcome email." };
            return end(req, res);
        }
        return next();
    }
};
