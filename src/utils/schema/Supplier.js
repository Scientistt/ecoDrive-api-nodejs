const { z } = require("zod");

const allowedSuppliers = { aws: "aws", oracle: "Oracle" };

const supplierSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    slug: z
        .string()
        .min(1, "O slug não pode ser vazio")
        .max(50, "O slug deve ter no máximo 50 caracteres.")
        .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hífens."),
    account_supplier: z.string().superRefine((sup, ctx) => {
        if (!Object.prototype.hasOwnProperty.call(allowedSuppliers, sup)) {
            ctx.addIssue({
                message: "Supplier não suportado",
                code: z.ZodIssueCode.custom
            });
        }
    }),
    account_key: z.string(),
    account_secret: z.string()
});

module.exports = {
    Schema: supplierSchema,
    validate: (sup) => {
        const result = supplierSchema.safeParse(sup);
        let err = undefined;
        if (!result.success) {
            err = result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));
        }
        return { ...result, err };
    }
};
