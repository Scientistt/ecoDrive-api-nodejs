const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const formatDbError = (error) => {
    if (error && error.code) {
        const campos = [];

        switch (error.code) {
            case "P2002":
                // Violação de campo único (ex: email já cadastrado)
                campos.push({
                    field: error.meta?.target?.[0] || "campo",
                    message: "Taken"
                });
                break;

            case "P2003":
                // Falha de chave estrangeira
                campos.push({
                    field: error.meta?.field_name || "campo_relacionado",
                    message: "Invalid relation"
                });
                break;

            case "P2025":
                // Registro não encontrado
                campos.push({
                    field: "id",
                    message: "not found"
                });
                break;

            default:
                campos.push({
                    field: "error",
                    message: "Error"
                });
                break;
        }

        return {
            error: campos
        };
    }

    // Fallback para outros erros
    return {
        error: [
            {
                field: "error",
                message: error?.message || "Something wrong happened"
            }
        ]
    };
};

module.exports = {
    db: prisma,
    parseError: formatDbError
};
