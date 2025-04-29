module.exports = {
    async init(req, res, next) {
        let defaultObj = {
            header: {
                http: 200,
            },
            meta: {},
            body: {},
        };
        req.response = defaultObj;
        return next();
    },

    async route404(req, res, next) {
        req.response.header.http = 404;
        req.response.body = undefined;
        return next();
    },

    async end(req, res, next) {
        res.status(parseInt(req.response.header.http));
        res.json(req.response.body);
    },
};
