const DEFAULT_PAGINATION_LIMIT = 10;
const DEFAULT_PAGINATION_PAGE = 1;

module.exports = {
    parsePagination(pagination = {}) {
        let obj = {};
        obj.limit = pagination.hasOwnProperty("limit") ? (pagination.limit >= 0 ? parseInt(pagination.limit) : DEFAULT_PAGINATION_LIMIT) : DEFAULT_PAGINATION_LIMIT;
        obj.page = pagination.hasOwnProperty("page") ? (pagination.page > 0 ? parseInt(pagination.page) : DEFAULT_PAGINATION_PAGE) : DEFAULT_PAGINATION_PAGE;
        return obj;
    },

    parseListToPagination(pagination, obj) {
        let pgnation = module.exports.parsePagination(pagination);

        let response = {};

        response.elements = obj.elements;
        response.totalElements = pgnation.limit === 0 ? obj.elements.length : obj.elements[0]?.hasOwnProperty("_count") ? obj.elements[0]._count : obj.elements.length;
        response.limit = pgnation.limit === 0 ? obj.elements.length : pgnation.limit;
        response.totalPages = pgnation.limit === 0 ? 1 : Math.ceil(response.totalElements / pgnation.limit);
        response.page = pgnation.limit === 0 ? 1 : pgnation.page;
        response.pagingCounter = pgnation.limit === 0 ? 1 : (response.page - 1) * response.limit + 1;
        response.hasPrevPage = pgnation.page > 1 && response.totalPages > pgnation.page;
        response.hasNextPage = pgnation.page < response.totalPages;
        response.prevPage = response.hasPrevPage ? response.page - 1 : null;
        response.nextPage = response.hasNextPage ? response.page + 1 : null;

        return response;
    },

    parseListToScrollPagination(pagination, obj) {
        let pgnation = module.exports.parsePagination(pagination);

        let response = {};

        response.elements = obj.elements;
        response.limit = pgnation.limit === 0 ? obj.elements.length : pgnation.limit;
        response.hasNextPage = pgnation.limit === 0 ? false : obj.elements[0]?.hasOwnProperty("_token") ? (obj.elements[0]._token ? true : false) : false;
        response.nextPage = pgnation.limit === 0 ? obj.elements.length : obj.elements[0]?.hasOwnProperty("_token") ? obj.elements[0]._token : 0;

        return response;
    },
};
