const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");
const prettier = require("eslint-plugin-prettier");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            parserOptions: {},

            globals: {
                ...globals.node
            }
        },

        extends: compat.extends("eslint:recommended", "prettier", "plugin:prettier/recommended"),

        plugins: {
            prettier
        },

        rules: {
            "prefer-const": "warn",
            "no-var": "warn",
            "no-unused-vars": "warn",
            "object-shorthand": "warn",
            "quote-props": ["warn", "as-needed"],
            "prettier/prettier": "warn"
        },

        settings: {
            react: {
                version: "detect"
            }
        }
    },
    globalIgnores([
        "**/build",
        "**/dist",
        "**/package-lock.json",
        "**/public",
        "**/node_modules",
        "**/package-lock.json",
        "**/yarn.lock"
    ])
]);
