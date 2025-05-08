const { getSlug } = require("../../utils/id.service");
const { getJWT, isJWTValid } = require("../../utils/token.service");
const { compare } = require("../../utils/cryptography.service");
const { db, parseError } = require("../../utils/db.service");
const { getHeader } = require("../../utils/token.service");

const isTokenValidBasedOnKeep = async (last_used_at, keep) => {
    const agora = new Date();
    const diferencaEmMs = agora - new Date(last_used_at);
    const trintaMinutosEmMs = 30 * 60 * 1000;
    const umaSemanaEmMs = 7 * 24 * 60 * 60 * 1000;

    return keep ? diferencaEmMs <= umaSemanaEmMs : diferencaEmMs <= trintaMinutosEmMs;
};

module.exports = {
    async login(loginInfo, ip) {
        try {
            const user = await db.User.findUnique({
                where: { login: loginInfo.login },
                select: {
                    id: true,
                    slug: true,
                    created_at: true,
                    name: true,
                    sex: true,
                    login: true,
                    status: true,
                    password: true,
                    email: true
                }
            });

            if (!user) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            if (!(await compare(loginInfo.password, user.password))) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            delete user.password;

            const jwt = await getJWT(user);

            const newToken = await db.UserAuthToken.create({
                data: {
                    user_id: user.id,
                    slug: getSlug(),
                    created_ip: ip,
                    jwt_token: jwt.token,
                    jwt_secret: jwt.secret,
                    keep: !!loginInfo.keep
                },
                select: {
                    jwt_token: true,
                    jwt_secret: true,
                    keep: true,
                    status: true
                }
            });

            return {
                user,
                token: newToken
            };
        } catch (err) {
            return parseError(err);
        }
    },

    async isAuth(req, ip) {
        try {
            const token = getHeader(req, "authorization")?.split(" ")[1]; // "Bearer <token>"

            if (!token) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            if (!isJWTValid(token)) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            const returnObj = {
                token: {
                    keep: false,
                    status: "E",
                    last_used_at: null,
                    last_used_ip: null
                }
            };

            const userToken = await db.UserAuthToken.findFirst({
                where: { jwt_token: token, status: "A" },
                select: {
                    id: true,
                    keep: true,
                    created_at: true,
                    status: true,
                    last_used_at: true,
                    UserAuthToken_User: {
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
                    }
                }
            });

            if (!userToken) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            returnObj.user = userToken.UserAuthToken_User;
            returnObj.token = {
                keep: userToken.keep,
                status: userToken.status,
                last_used_at: userToken.last_used_at || userToken.created_at,
                last_used_ip: userToken.last_used_ip
            };

            if (!isTokenValidBasedOnKeep(userToken.last_used_at || userToken.created_at, userToken.keep)) {
                returnObj.token.status = "E";
                return {
                    ...returnObj,
                    error: new Error({
                        code: "P2025",
                        message: "Login inválido"
                    })
                };
            }

            await db.UserAuthToken.update({
                where: { id: userToken.id },
                data: {
                    last_used_at: new Date(),
                    updated_at: new Date(),
                    last_used_ip: ip
                }
            });

            return returnObj;
        } catch (err) {
            return parseError(err);
        }
    },

    async logout(req, ip) {
        try {
            const token = getHeader(req, "authorization")?.split(" ")[1]; // "Bearer <token>"

            if (!token) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            if (!isJWTValid(token)) {
                throw {
                    code: "P2025",
                    message: "Login inválido"
                };
            }

            await db.UserAuthToken.updateMany({
                where: { jwt_token: token },
                data: {
                    last_used_at: new Date(),
                    last_used_ip: ip,
                    updated_at: new Date(),
                    status: "I"
                }
            });
        } catch (err) {
            return parseError(err);
        }
    }
};
