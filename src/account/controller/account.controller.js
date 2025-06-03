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
            from: `"Equipe EcoDrive" <>`, // Use a configuração de email do seu serviço
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
        // Finaliza a resposta
        return next();
    },
    async forgotPassword(req, res, next) {
        const { email } = req.body;
        if (!email) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body = { error: "Email is required." };
            return end(req, res);
        }
        console.log("Forgot password request for email: ", req.body);
        const user = await accountService.findUserByEmail(email);
        if (!user) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body = { error: `Email não encontrado: ${req.body.email}` };
            return end(req, res);
        }

        // Generate a reset token (implement this in your service)
        const resetToken = await accountService.generateResetToken(email);
        console.log("Generated reset token: ", resetToken);
        if (!resetToken) {
            req.response.meta.feedback = FEEDBACK.INTERNAL_ERROR;
            req.response.body = { error: "Failed to generate reset token." };
            return end(req, res);
        }

        // Send reset email
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3001"}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: `"Equipe EcoDrive" <${process.env.MAIL_FROM}>`,
            to: user.email,
            subject: "EcoDrive - Redefinição de senha",
            text: `Olá ${user.name},\n\nClique no link para redefinir sua senha: ${resetLink}\n\nSe não foi você, ignore este email.\n\nEquipe EcoDrive`
        };
        console.log("Reset link: ", resetLink);
        try {
            await sendMail(mailOptions);
            console.log("Reset email sent to: ", user.email);
            req.response.meta.feedback = FEEDBACK.OK;
            req.response.body = { message: "Reset email sent successfully." };
        } catch (error) {
            console.error("Erro ao enviar email de redefinição de senha: ", error);
            req.response.meta.feedback = FEEDBACK.INTERNAL_ERROR;
            req.response.body = { error: "Failed to send reset email." };
            return end(req, res);
        }
        return next();
    },

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body = { error: "Token and new password are required." };
            return end(req, res);
        }

        // Validate token and reset password (implement this in your service)
        const result = await accountService.resetPasswordWithToken(token, newPassword);
        console.log("Reset password result: ", result);
        // Check if the result indicates an error or success
        if (result.error) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body = { error: result.error };
            return end(req, res);
        }
        if (!result.success) {
            req.response.meta.feedback = FEEDBACK.BAD_REQUEST;
            req.response.body = { error: "Invalid or expired token." };
            return end(req, res);
        }
        console.log("Password reset successful for token: ", token);
        // If successful, send a confirmation response

        req.response.meta.feedback = FEEDBACK.OK;
        req.response.body = { message: "Password reset successful." };
        return end(req, res);
    }
};
