const httpStatusService = require("./httpStatus.service");

const FEEDBACK = {
    OK: {
        http: httpStatusService.OK
    },
    CREATED: {
        http: httpStatusService.CREATED
    },
    READ: {
        http: httpStatusService.OK
    },
    LISTED: {
        http: httpStatusService.OK
    },
    BAD_REQUEST: {
        http: httpStatusService.BAD_REQUEST
    },
    FORBIDDEN: {
        http: httpStatusService.FORBIDDEN
    },
    ERROR: {
        http: httpStatusService.ERROR
    }
};

module.exports = {
    getFeedbacks() {
        return FEEDBACK;
    }
};
