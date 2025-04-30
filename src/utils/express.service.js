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
        color_after: CMD_STYLE.DEFAULT
    },
    GET: {
        name: "Get",
        color: `${CMD_STYLE.BRIGHT_CYAN}${CMD_STYLE.ITALIC}`,
        color_after: CMD_STYLE.DEFAULT
    },
    PUT: {
        name: "Put",
        color: `${CMD_STYLE.BRIGHT_YELLOW}${CMD_STYLE.ITALIC}`,
        color_after: CMD_STYLE.DEFAULT
    },
    PATCH: {
        name: "Patch",
        color: `${CMD_STYLE.BRIGHT_MAGENTA}${CMD_STYLE.ITALIC}`,
        color_after: CMD_STYLE.DEFAULT
    },
    DELETE: {
        name: "Delete",
        color: `${CMD_STYLE.BRIGHT_RED}${CMD_STYLE.ITALIC}`,
        color_after: CMD_STYLE.DEFAULT
    },
    DEFAULT: {
        name: "???",
        color: `${CMD_STYLE.DEFAULT}${CMD_STYLE.ITALIC}`,
        color_after: CMD_STYLE.DEFAULT
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

let printedTopLevelPaths = {};

const importRoutes = (server, path, topLevel) => {
    fs.readdirSync(path).forEach((name) => {
        if (fs.lstatSync(`${path}/${name}`).isDirectory()) return importRoutes(server, `${path}/${name}`, topLevel);
        else
            try {
                if (`${name}`.endsWith("router.js")) {
                    if (!printedTopLevelPaths.hasOwnProperty(topLevel)) {
                        printedTopLevelPaths[topLevel] = true;
                        if (PRINT_ROUTES_PATHS) console.log(`\n\t${CMD_STYLE.BG_WHITE}${CMD_STYLE.BOLD}   ${topLevel.toUpperCase()}   ${CMD_STYLE.DEFAULT}`);
                    }
                    ++importedRouterFiles;
                    if (PRINT_ROUTES_PATHS) console.log(`\n\t${CMD_STYLE.ITALIC}${CMD_STYLE.YELLOW}${CMD_STYLE.DIM}${path}/${name}${CMD_STYLE.DEFAULT}`);
                    server.use(require(`../.${path}/${name}`));
                    printRoutes(``, require(`../.${path}/${name}`));
                } else {
                    // skipping...
                }
            } catch (error) {
                RouterFileErrors++;
                console.log(`\t${CMD_STYLE.UNDERLINE}${CMD_STYLE.RED}Error at ${CMD_STYLE.ITALIC}${CMD_STYLE.BOLD}${path}/${name}${CMD_STYLE.DEFAULT}: ${CMD_STYLE.RED}${error.message.toString()}${CMD_STYLE.DEFAULT}.`);
                console.error(error)
            }
    });
};

let importedRouterFiles = 0;
let importedRoutes = 0;
let RouterFileErrors = 0;

module.exports = {

    getHttpMethodList() {
        return HTTP_METHODS;
    },
    printServerUpStatus() {
        console.log(`\t[Express] Imported ${CMD_STYLE.BOLD}${importedRouterFiles > 0 ? CMD_STYLE.BRIGHT_GREEN : CMD_STYLE.BRIGHT_YELLOW}${importedRouterFiles} file${importedRouterFiles > 1 ? "s" : ""}${CMD_STYLE.DEFAULT} with a total of ${CMD_STYLE.BOLD}${importedRoutes > 0 ? CMD_STYLE.BRIGHT_GREEN : CMD_STYLE.BRIGHT_YELLOW}${importedRoutes} routes${CMD_STYLE.DEFAULT}. ${RouterFileErrors > 0 ? `${CMD_STYLE.BG_BRIGHT_RED}${CMD_STYLE.BOLD} ${RouterFileErrors} file${RouterFileErrors > 1 ? "s" : ""} with errors ${CMD_STYLE.DEFAULT}` : ``}`);
    },

    importRoutes(server, basePath) {
        fs.readdirSync(basePath).forEach((dirName) => {
            try {
                importRoutes(server, `${basePath}/${dirName}`, `${dirName}`);
            } catch (error) { }
        });
    },
};
