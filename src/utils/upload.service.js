const multer = require("multer");

const upload = multer({
    dest: "tmp/" // salva no disco temporariamente
});

module.exports = {
    upload
};
