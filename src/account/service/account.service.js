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
    }
};
