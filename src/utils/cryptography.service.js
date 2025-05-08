const bcrypt = require("bcrypt");
const { env } = require("process");

module.exports = {
    async encrypt(plain) {
        return await bcrypt.hash(plain, parseInt(env.CRYPTOGRAPHY_ROUNDS_OF_SALT));
    },

    async compare(plain, encrypted) {
        console.log("Plain: ", plain);
        console.log("encrypted: ", encrypted);
        console.log("result: ", await bcrypt.compare(plain, encrypted));
        return await bcrypt.compare(plain, encrypted);
    }
};
