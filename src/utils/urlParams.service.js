module.exports = {
    id: (name) => {
        return `:${name}([0-9-]+)`;
    },
    slug: (name, size = -1) => {
        if (size > 0) return `:${name}([a-z0-9-]+){${size}}`;
        return `:${name}([a-z0-9-]+)`;
    },
    name: (name, size = -1) => {
        if (size > 0) return `:${name}([a-zA-Z0-9-.]+){${size}}`;
        return `:${name}([a-z0-9-.]+)`;
    }
};
