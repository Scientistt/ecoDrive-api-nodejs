const { z } = require("zod");

const loginSchema = z.object({
    login: z.string().min(4, "Login deve ter ao menos 4 caracteres"),
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    keep: z.boolean().optional()
});

module.exports = {
    Schema: loginSchema,
    validate: (user) => {
        const result = loginSchema.safeParse(user);
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
