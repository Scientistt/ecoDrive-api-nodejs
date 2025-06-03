const multer = require("multer");

const MAX_FILE_SIZE = 1099511627776; // 1 TB

const upload = multer({
    dest: "tmp/", // salva no disco temporariamente
    limits: { fileSize: MAX_FILE_SIZE /* bytes */ }
});

module.exports = {
    upload
};
