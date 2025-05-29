const nodemailer = require("nodemailer");

module.exports = {
    async sendMail(mailOptions) {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        return transporter.sendMail(mailOptions);
    }
};
