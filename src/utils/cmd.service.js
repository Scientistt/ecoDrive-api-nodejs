const CMD_STYLE_CODES = {
    DEFAULT: "\x1b[0m",
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",
    ITALIC: "\x1b[3m",
    UNDERLINE: "\x1b[4m",
    BLINK: "\x1b[5m",
    INVERSE: "\x1b[7m",
    HIDDEN: "\x1b[8m",
    STRIKETHROUGH: "\x1b[9m",

    // Text colors
    BLACK: "\x1b[30m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m",

    // Bright text colors
    BRIGHT_BLACK: "\x1b[90m",
    BRIGHT_RED: "\x1b[91m",
    BRIGHT_GREEN: "\x1b[92m",
    BRIGHT_YELLOW: "\x1b[93m",
    BRIGHT_BLUE: "\x1b[94m",
    BRIGHT_MAGENTA: "\x1b[95m",
    BRIGHT_CYAN: "\x1b[96m",
    BRIGHT_WHITE: "\x1b[97m",

    // Background colors
    BG_BLACK: "\x1b[40m",
    BG_RED: "\x1b[41m",
    BG_GREEN: "\x1b[42m",
    BG_YELLOW: "\x1b[43m",
    BG_BLUE: "\x1b[44m",
    BG_MAGENTA: "\x1b[45m",
    BG_CYAN: "\x1b[46m",
    BG_WHITE: "\x1b[47m",

    // Bright backgrounds
    BG_BRIGHT_BLACK: "\x1b[100m",
    BG_BRIGHT_RED: "\x1b[101m",
    BG_BRIGHT_GREEN: "\x1b[102m",
    BG_BRIGHT_YELLOW: "\x1b[103m",
    BG_BRIGHT_BLUE: "\x1b[104m",
    BG_BRIGHT_MAGENTA: "\x1b[105m",
    BG_BRIGHT_CYAN: "\x1b[106m",
    BG_BRIGHT_WHITE: "\x1b[107m"
};
module.exports = {
    getCMDStyleCodes() {
        return CMD_STYLE_CODES;
    }
};
