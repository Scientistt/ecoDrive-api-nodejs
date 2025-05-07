const shortId = require("short-unique-id");
const DEFAULT_SHORT_ID_LENGTH = 10;
const getRandomId = new shortId({ length: DEFAULT_SHORT_ID_LENGTH }).randomUUID;

module.exports = {
    async getId(length = DEFAULT_SHORT_ID_LENGTH) {
        if (length !== DEFAULT_SHORT_ID_LENGTH) {
            const { randomUUID } = new shortId({ length });
            return randomUUID();
        }
        return getRandomId();
    }
};
