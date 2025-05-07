module.exports = {
    slug: (name, size = -1) => {
        if (size > 0) return `:${name}([a-z0-9-]+){${size}}`;
        return `:${name}([a-z0-9-]+)`;
    },
    name: (name, size = -1) => {
        if (size > 0) return `:${name}([a-zA-Z0-9-.]+){${size}}`;
        return `:${name}([a-z0-9-.]+)`;
    }
};
