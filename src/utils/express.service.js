const fs = require("fs");
const { env } = require("process");
const cmdService = require("./cmd.service");

const PRINT_ROUTES = env.PRINT_ROUTES === "true" ? true : false;
const PRINT_ROUTES_PATHS = env.PRINT_ROUTES_PATHS === "true" ? true : false;
const PRINT_ROUTES_REGEX = env.PRINT_ROUTES_REGEX === "true" ? true : false;

const CMD_STYLE = cmdService.getCMDStyleCodes();
const HTTP_METHODS = {
    POST: {
        name: "Post",
        color: `${CMD_STYLE.BRIGHT_GREEN}${CMD_STYLE.ITALIC}`,
    },
    GET: {
        name: "Get",
        color: `${CMD_STYLE.BRIGHT_CYAN}${CMD_STYLE.ITALIC}`,
    },
    PUT: {
        name: "Put",
        color: `${CMD_STYLE.BRIGHT_YELLOW}${CMD_STYLE.ITALIC}`,
    },
    PATCH: {
        name: "Patch",
        color: `${CMD_STYLE.BRIGHT_MAGENTA}${CMD_STYLE.ITALIC}`,
    },
    DELETE: {
        name: "Delete",
        color: `${CMD_STYLE.BRIGHT_RED}${CMD_STYLE.ITALIC}`,
    },
    DEFAULT: {
        name: "???",
        color: `${CMD_STYLE.DEFAULT}${CMD_STYLE.ITALIC}`,
    },
};

const printRoutes = (prefix, router) => {
    for (let i = 0; i < router.stack.length; i++)
        for (let m in router.stack[i].route.methods) {
            let method = HTTP_METHODS.hasOwnProperty(`${m}`.toUpperCase()) ? HTTP_METHODS[`${m}`.toUpperCase()] : HTTP_METHODS.DEFAULT;
            let path = PRINT_ROUTES_REGEX
                ? router.stack[i].route.path.replace(/\)/g, `)${CMD_STYLE.DEFAULT}`).replace(/:/g, `${CMD_STYLE.BRIGHT_WHITE}${CMD_STYLE.BOLD}$`)
                : router.stack[i].route.path.replace(/ *\([^)]*\) */g, `${CMD_STYLE.DEFAULT}`).replace(/:/g, `${CMD_STYLE.BRIGHT_WHITE}${CMD_STYLE.BOLD}$`);
            ++importedRoutes;
            if (PRINT_ROUTES) console.log(`\t${`${importedRoutes}`.padStart(4, " ").padEnd(6, " ")}${`[${method.color}${method.name}${CMD_STYLE.DEFAULT}] `.padEnd(22, " ")}${prefix}${path}`);
        }
};

const importRoutes = (server, path, topLevel) => {
    fs.readdirSync(path).forEach((name) => {
        if (fs.lstatSync(`${path}/${name}`).isDirectory()) return importRoutes(server, `${path}/${name}`, topLevel);
        else
            try {
                if (`${name}`.endsWith("router.js")) {
                    ++importedRouterFiles;
                    if (PRINT_ROUTES_PATHS) console.log(`\n\t${CMD_STYLE.ITALIC}${CMD_STYLE.YELLOW}${CMD_STYLE.DIM}${path}/${name}${CMD_STYLE.DEFAULT}`);
                    server.use(`/${topLevel}`, require(`../.${path}/${name}`));
                    printRoutes(`/${topLevel}`, require(`../.${path}/${name}`));
                } else {
                    // skipping...
                }
            } catch (error) {
                RouterFileErrors++;
                console.log(`\t${CMD_STYLE.UNDERLINE}${CMD_STYLE.RED}Error at ${CMD_STYLE.ITALIC}${CMD_STYLE.BOLD}${path}/${name}${CMD_STYLE.DEFAULT}: ${CMD_STYLE.RED}${error.message.toString()}${CMD_STYLE.DEFAULT}.`);
            }
    });
};

let importedRouterFiles = 0;
let importedRoutes = 0;
let RouterFileErrors = 0;

module.exports = {
    printServerUpStatus() {
        console.log(
            `\t[Express] Imported ${importedRouterFiles > 0 ? CMD_STYLE.GREEN : CMD_STYLE.YELLOW}${importedRouterFiles}${CMD_STYLE.DEFAULT} file${importedRouterFiles > 1 ? "s" : ""} with a total of ${importedRoutes > 0 ? CMD_STYLE.GREEN : CMD_STYLE.YELLOW}${importedRoutes}${
                CMD_STYLE.DEFAULT
            } routes. ${RouterFileErrors > 0 ? `${CMD_STYLE.BG_BRIGHT_RED}${CMD_STYLE.BOLD} ${RouterFileErrors} file${RouterFileErrors > 1 ? "s" : ""} with errors ${CMD_STYLE.DEFAULT}` : `${CMD_STYLE.GREEN}No errors found.${CMD_STYLE.DEFAULT}`}`
        );
    },

    importRoutes(server, basePath) {
        // console.log("\n\nexpress");
        fs.readdirSync(basePath).forEach((dirName) => {
            if (PRINT_ROUTES_PATHS) console.log(`\n\t${CMD_STYLE.BG_WHITE}${CMD_STYLE.BOLD}   ${dirName.toUpperCase()}   ${CMD_STYLE.DEFAULT}`);
            try {
                importRoutes(server, `${basePath}/${dirName}`, `${dirName}`);
            } catch (error) {}
        });
    },
};
