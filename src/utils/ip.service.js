const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
        ? forwarded.split(",")[0].trim()
        : req.connection?.remoteAddress || req.socket?.remoteAddress || req.connection?.socket?.remoteAddress;

    // Converte IPv6 loopback para IPv4
    if (ip === "::1") {
        return "127.0.0.1";
    }

    // Remove o prefixo "::ffff:" de IPs IPv4 mapeados
    if (ip?.startsWith("::ffff:")) {
        return ip.replace("::ffff:", "");
    }

    return ip;
};

module.exports = {
    getClientIp
};
