require("json-bigint-patch");
require("dotenv").config();
const { env } = process;
const http = require("http");
const cors = require("cors");
const express = require("express");

const cmdService = require("./src/utils/cmd.service");
const expressService = require("./src/utils/express.service");
const { end, init, route404 } = require("./src/utils/request.service");

const server = express();
server.use(express.json(), cors());
const httpServer = http.createServer(server);

expressService.importRoutes(server, "./src");
server.use(init, route404, end);

httpServer.listen(env.PORT, () => {
    const CMD_STYLE = cmdService.getCMDStyleCodes();
    console.log("");
    expressService.printServerUpStatus();
    console.log(
        `\t[NodeJs] ${CMD_STYLE.UNDERLINE}${CMD_STYLE.BOLD}listening on port ${CMD_STYLE.GREEN}${env.PORT}${CMD_STYLE.DEFAULT}\nRequests: `
    );
});
