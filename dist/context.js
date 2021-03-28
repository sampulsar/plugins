"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPluginRunner = exports.walk = exports.basicMatcher = void 0;
const axios_1 = __importDefault(require("axios"));
const boxen_1 = __importDefault(require("boxen"));
const cheerio_1 = __importDefault(require("cheerio"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importStar(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const jimp_1 = __importDefault(require("jimp"));
const moment_1 = __importDefault(require("moment"));
const ora_1 = __importDefault(require("ora"));
const os_1 = __importDefault(require("os"));
const path_1 = __importStar(require("path"));
const readline_1 = __importDefault(require("readline"));
const semver_1 = __importDefault(require("semver"));
const util_1 = require("util");
const yaml_1 = __importDefault(require("yaml"));
const zod = __importStar(require("zod"));
const winston_1 = __importDefault(require("winston"));
exports.basicMatcher = new (class BasicMatcher {
    filterMatchingItems(itemsToMatch, str, getInputs, sortByLongestMatch) {
        const matchedItems = itemsToMatch.filter((item) => {
            const itemInputs = getInputs(item);
            return itemInputs.some((input) => str.toLowerCase().includes(input.toLowerCase()));
        });
        if (sortByLongestMatch) {
            matchedItems.sort((a, b) => b.name.length - a.name.length);
        }
        return matchedItems;
    }
    isMatchingItem(item, str, getInputs) {
        return !!this.filterMatchingItems([item], str, getInputs).length;
    }
})();
const readdirAsync = util_1.promisify(fs_1.readdir);
const statAsync = util_1.promisify(fs_1.stat);
const pathIsExcluded = (exclude, path) => exclude.some((regStr) => new RegExp(regStr, "i").test(path.toLowerCase()));
const validExtension = (exts, path) => exts.includes(path_1.extname(path).toLowerCase());
function walk(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const root = path_1.resolve(options.dir);
        const folderStack = [];
        folderStack.push(root);
        while (folderStack.length) {
            const top = folderStack.pop();
            if (!top)
                break;
            logger.debug(`Walking folder ${top}`);
            let filesInDir = [];
            try {
                filesInDir = yield readdirAsync(top);
            }
            catch (err) {
                logger.error(`Error reading contents of directory "${top}", skipping`);
                logger.error(err);
                continue;
            }
            for (const file of filesInDir) {
                const path = path_1.join(top, file);
                if (pathIsExcluded(options.exclude, path)) {
                    logger.debug(`"${path}" is excluded, skipping`);
                    continue;
                }
                try {
                    const stat = yield statAsync(path);
                    if (stat.isDirectory()) {
                        logger.debug(`Pushed folder ${path}`);
                        folderStack.push(path);
                    }
                    else if (validExtension(options.extensions, file)) {
                        logger.debug(`Found file ${file}`);
                        const resolvedPath = path_1.resolve(path);
                        const res = yield options.cb(resolvedPath);
                        if (res) {
                            return resolvedPath;
                        }
                    }
                }
                catch (err) {
                    const _err = err;
                    if (_err.code && (_err.code === "EACCES" || _err.code === "EPERM")) {
                        logger.error(`"${path}" requires elevated permissions, skipping`);
                    }
                    else {
                        handleError(`Error walking or in callback for "${path}", skipping`, err);
                    }
                }
            }
        }
    });
}
exports.walk = walk;
function handleError(message, error, bail = false) {
    logger.error(`${message}: ${formatMessage(error)}`);
    if (error instanceof Error) {
        logger.debug(error.stack);
    }
    if (bail) {
        process.exit(1);
    }
}
function formatMessage(message) {
    if (message instanceof Error) {
        return message.message;
    }
    return typeof message === "string" ? message : JSON.stringify(message, null, 2);
}
const LOGLEVEL = process.env.PV_LOG_LEVEL || "info";
const logger = createVaultLogger(LOGLEVEL);
function createVaultLogger(consoleLevel) {
    return winston_1.default.createLogger({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp }) => {
            const msg = formatMessage(message);
            return `${timestamp} [vault] ${level}: ${msg}`;
        })),
        transports: [
            new winston_1.default.transports.Console({
                level: consoleLevel,
            }),
        ],
    });
}
function createPluginLogger(name) {
    logger.debug(`Creating plugin logger: ${name}`);
    return winston_1.default.createLogger({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp }) => {
            const msg = formatMessage(message);
            return `${timestamp} [vault:plugin:${name}] ${level}: ${msg}`;
        })),
        transports: [
            new winston_1.default.transports.Console({
                level: LOGLEVEL,
            }),
        ],
    });
}
const context = {
    $axios: axios_1.default,
    $boxen: boxen_1.default,
    $cheerio: cheerio_1.default,
    $ffmpeg: fluent_ffmpeg_1.default,
    $fs: fs_1.default,
    $inquirer: inquirer_1.default,
    $jimp: jimp_1.default,
    $loader: ora_1.default,
    $moment: moment_1.default,
    $os: os_1.default,
    $path: path_1.default,
    $readline: readline_1.default,
    $semver: semver_1.default,
    $yaml: yaml_1.default,
    $zod: zod,
    $createImage: () => __awaiter(void 0, void 0, void 0, function* () {
        return Date.now().toString(36);
    }),
    $createLocalImage: () => __awaiter(void 0, void 0, void 0, function* () {
        return Date.now().toString(36);
    }),
    $cwd: process.cwd(),
    $library: ".",
    $log: (...msgs) => {
        logger.warn(`$log is deprecated, use $logger instead`);
        logger.info(msgs.map(formatMessage).join(" "));
    },
    $formatMessage: formatMessage,
    $logger: logger,
    $getMatcher: () => exports.basicMatcher,
    $matcher: exports.basicMatcher,
    $pluginName: "plugin",
    $pluginPath: ".",
    $require: (path) => require(path),
    $throw: (msg) => {
        throw new Error(msg);
    },
    $version: "",
    $walk: walk,
    args: {},
    data: {},
    event: "fake_event",
};
const createPluginRunner = (pluginName, plugin) => {
    const pluginLogger = createPluginLogger(pluginName);
    return (runContext) => plugin(Object.assign(Object.assign(Object.assign({}, context), runContext), { $pluginName: pluginName, $logger: pluginLogger }));
};
exports.createPluginRunner = createPluginRunner;
module.exports = {
    context,
    createPluginRunner: exports.createPluginRunner,
};
