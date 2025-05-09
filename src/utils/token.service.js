const jsonWebToken = require("jsonwebtoken");
const { getSlug } = require("./id.service");
const { env } = require("process");

const getJWT = async (user) => {
    const secret = getSlug();
    const payload = {
        sub: user.id,
        lgn: user.login,
        sct: secret
    };
    const jwtToken = jsonWebToken.sign(payload, env.CRYPTOGRAPHY_SECRET, {}).replace("=g", "");
    return { secret, token: jwtToken };
};

const isJWTValid = async (jwt) => {
    try {
        return jsonWebToken.verify(jwt, env.CRYPTOGRAPHY_SECRET);
    } catch {
        return false;
    }
};

const getHeader = (req, headerName) => {
    return req.headers[headerName] || req.body[headerName];
};

module.exports = {
    getJWT,
    getHeader,
    isJWTValid
};
