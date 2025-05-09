const bcrypt = require("bcrypt");
const { env } = require("process");
const crypto = require("crypto");
const ALGORITHM = "aes-256-cbc"; // crypto algorithm
const iv = crypto.randomBytes(16);

module.exports = {
    async encrypt(plain) {
        return await bcrypt.hash(plain, parseInt(env.CRYPTOGRAPHY_ROUNDS_OF_SALT));
    },

    async compare(plain, encrypted) {
        return await bcrypt.compare(plain, encrypted);
    },

    async encrypt2(plain) {
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(env.CRYPTOGRAPHY_SECRET), iv);
        const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    },

    async decrypt2(encryptedText) {
        const [ivHex, encryptedHex] = encryptedText.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const encrypted = Buffer.from(encryptedHex, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(env.CRYPTOGRAPHY_SECRET), iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString();
    }
};
