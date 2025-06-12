const { parsePagination, parseListToPagination } = require("../../utils/pagination.service");
const { getJWT, isJWTValid } = require("../../utils/token.service");
const { encrypt2, decrypt2 } = require("../../utils/cryptography.service");
const { db, parseError } = require("../../utils/db.service");
const { getId } = require("../../utils/id.service");

module.exports = {
    async validateSupplierSlug(id, slug) {
        try {
            const supp = await db.Supplier.findFirst({
                where: {
                    slug
                },
                select: {
                    id: true
                }
            });

            return !supp || supp.id.toString() === id;
        } catch (err) {
            return parseError(err);
        }
    },

    async createSupplier(supplier, req) {
        try {
            const newSupplier = await db.Supplier.create({
                data: {
                    ...supplier,
                    account_key: await encrypt2(supplier.account_key),
                    account_secret: await encrypt2(supplier.account_secret),
                    created_at: new Date(),
                    created_by_user_id: req.response.params.user.id,
                    user_id: req.response.params.user.id
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    status: true,
                    description: true,
                    account_supplier: true
                }
            });

            return newSupplier;
        } catch (err) {
            return parseError(err);
        }
    },

    async listSuppliers(filter, pagination, req) {
        try {
            const paginationObj = parsePagination(pagination);

            const newSupplier = await db.Supplier.findMany({
                skip: paginationObj.limit * (paginationObj.page - 1),
                take: paginationObj.limit,
                where: {
                    ...filter,
                    user_id: req.response.params.user.id,
                    status: "A"
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    status: true,
                    description: true,
                    account_supplier: true
                }
            });

            const counter = await db.Supplier.count({
                where: {
                    ...filter,
                    user_id: req.response.params.user.id,
                    status: "A"
                }
            });

            return parseListToPagination(paginationObj, { elements: newSupplier, total: counter });

            // return { elements: newSupplier };
        } catch (err) {
            return parseError(err);
        }
    },

    async getSupplier(slug) {
        try {
            const isNumericId = !isNaN(Number(slug));

            const newSupplier = await db.Supplier.findFirst({
                where: {
                    ...(isNumericId
                        ? { OR: [{ id: Number(slug) }, { slug: slug.toString() }] }
                        : { slug: slug.toString() }),
                    status: "A"
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    status: true,
                    description: true,
                    account_supplier: true
                }
            });
            if (!newSupplier)
                throw {
                    code: "P2025",
                    message: "Supplier inválido"
                };
            return newSupplier;
        } catch (err) {
            return parseError(err);
        }
    },

    async deleteSupplier(id, req) {
        try {
            const sup = await module.exports.getSupplier(id);

            if (sup.error) return sup;

            const newSupplier = await db.Supplier.update({
                where: {
                    id,
                    status: "A"
                },
                select: {
                    id: true
                },
                data: {
                    updated_at: new Date(),
                    updated_by_user_id: req.response.params.user.id,
                    status: "D",
                    slug: `${sup}-DELETED-${getId()}`
                }
            });

            if (!newSupplier)
                throw {
                    code: "P2025",
                    message: "Supplier inválido"
                };
            return newSupplier;
        } catch (err) {
            return parseError(err);
        }
    },

    async getSupp(id, user) {
        try {
            const newSupplier = await db.Supplier.findFirst({
                where: {
                    id,
                    user_id: user.id,
                    status: "A"
                },
                select: {
                    account_supplier: true,
                    account_key: true,
                    account_secret: true
                }
            });
            if (!newSupplier)
                throw {
                    code: "P2025",
                    message: "Supplier inválido"
                };

            return {
                ...newSupplier,
                account_key: await decrypt2(newSupplier.account_key),
                account_secret: await decrypt2(newSupplier.account_secret)
            };
        } catch (err) {
            return parseError(err);
        }
    }
};
