const { getSlug } = require("../../utils/id.service");
const { encrypt } = require("../../utils/cryptography.service");
const { db, parseError } = require("../../utils/db.service");

module.exports = {
    async createAccount(user) {
        try {
            const newUser = await db.User.create({
                data: { ...user, slug: getSlug(), password: await encrypt(user.password) },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true,
                    sex: true,
                    login: true,
                    status: true,
                    email: true
                }
            });
            return newUser;
        } catch (err) {
            return parseError(err);
        }
    },

    async validateAccountCreationEmail(email) {
        try {
            const newUser = await db.User.findFirst({
                where: { email },
                select: {
                    id: true
                }
            });

            return !newUser;
        } catch (err) {
            return parseError(err);
        }
    },

    async validateAccountCreationLogin(login) {
        try {
            const newUser = await db.User.findFirst({
                where: { login },
                select: {
                    id: true
                }
            });

            console.log("found: ", newUser);
            return !newUser;
        } catch (err) {
            return parseError(err);
        }
    },
    async resetPassword(user) {
        try {
            const updatedUser = await db.User.update({
                where: { id: user.id },
                data: { password: await encrypt(user.password) },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true
                }
            });
            return updatedUser;
        } catch (err) {
            return parseError(err);
        }
    },
    async forgotPassword(email) {
        try {
            const user = await db.User.findFirst({
                where: { email },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true,
                    email: true
                }
            });

            if (!user) {
                return { error: "User not found" };
            }

            return user;
        } catch (err) {
            return parseError(err);
        }
    },
    async findUserByEmail(email) {
        try {
            const user = await db.User.findFirst({
                where: { email },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true,
                    email: true
                }
            });

            return user;
        } catch (err) {
            return parseError(err);
        }
    },
    async generateResetToken(email) {
        try {
            const token = await encrypt(email + Date.now());
            await db.User.update({
                where: { email },
                data: { reset_token: token }
            });
            //console.log("Generated reset token2: ", token);
            return token;
        } catch (err) {
            return parseError(err);
        }
    },
    async validateResetToken(token) {
        try {
            const user = await db.User.findFirst({
                where: { reset_token: token },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true,
                    email: true
                }
            });

            if (!user) {
                return { error: "Invalid or expired reset token" };
            }

            return user;
        } catch (err) {
            return parseError(err);
        }
    },
    async resetPasswordWithToken(token, newPassword) {
        console.log("Resetting password with token: ", token);
        console.log("New password: ", newPassword);
        try {
            const user = await db.User.findFirst({
                where: { reset_token: token },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true,
                    email: true
                }
            });
            console.log("Another check token check:", token);
            console.log("User found reset_token mate:", user?.reset_token);

            if (!newPassword || newPassword.length < 8) {
                return { error: "New password must be at least 8 characters long" };
            }
            if (newPassword === user.password) {
                return { error: "New password cannot be the same as the old password" };
            }
            if (newPassword.includes(user.login)) {
                return { error: "New password cannot contain the user's login" };
            }
            const updatedUser = await db.User.update({
                where: { id: user.id },
                data: { password: await encrypt(newPassword), reset_token: null },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true
                }
            });

            return updatedUser;
        } catch (err) {
            return parseError(err);
        }
    }
};
