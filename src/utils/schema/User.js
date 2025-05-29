const { z } = require("zod");
const allowedSexes = { M: "Masculino", N: "Neutro", F: "Feminino" };
const userSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    login: z.string().min(4, "Login deve ter ao menos 4 caracteres"),
    email: z.string().email("Email é obrigatório"),
    sex: z.string().superRefine((sex, ctx) => {
        if (!Object.prototype.hasOwnProperty.call(allowedSexes, sex)) {
            ctx.addIssue({
                message: "Sexo deve ser M, F ou N",
                code: z.ZodIssueCode.custom
            });
        }
    }),
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    whitelabel_id: z.number()
});

module.exports = {
    Schema: userSchema,
    validate: (user) => {
        const result = userSchema.safeParse(user);
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
