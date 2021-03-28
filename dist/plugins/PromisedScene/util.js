"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSceneExistsInDb = exports.normalizeSceneResultData = exports.matchSceneResultToSearch = exports.ignoreDbLine = exports.createQuestionPrompter = exports.escapeRegExp = exports.stripStr = exports.dateToTimestamp = exports.timestampToString = exports.isPositiveAnswer = exports.manualTouchChoices = void 0;
exports.manualTouchChoices = {
    MANUAL_ENTER: "Enter scene details manually, straight into the porn-vault",
    NOTHING: "Do nothing (let the scene be imported with no details)",
    SEARCH: "Search scene details on The Porn Database (TPD)",
};
const isPositiveAnswer = (answer = "") => ["y", "yes"].includes(answer.toLowerCase());
exports.isPositiveAnswer = isPositiveAnswer;
function timestampToString(timestamp) {
    const dateNotFormatted = new Date(timestamp);
    let formattedString = dateNotFormatted.getFullYear() + "-";
    if (dateNotFormatted.getMonth() < 9) {
        formattedString += "0";
    }
    formattedString += dateNotFormatted.getMonth() + 1;
    formattedString += "-";
    if (dateNotFormatted.getDate() < 10) {
        formattedString += "0";
    }
    formattedString += dateNotFormatted.getDate();
    return formattedString;
}
exports.timestampToString = timestampToString;
const dateToTimestamp = (ctx, dateStr) => {
    const ddmmyyyy = dateStr.match(/\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d\d\d/);
    const yyyymmdd = dateStr.match(/\d\d\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d/);
    const yymmdd = dateStr.match(/\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d/);
    ctx.$logger.verbose(`Converting date ${JSON.stringify(dateStr)} to timestamp`);
    if (yyyymmdd && yyyymmdd.length) {
        const date = yyyymmdd[0].replace(" ", ".");
        ctx.$logger.verbose("\tSUCCESS: Found => yyyymmdd");
        return ctx.$moment(date, "YYYY-MM-DD").valueOf();
    }
    if (ddmmyyyy && ddmmyyyy.length) {
        const date = ddmmyyyy[0].replace(" ", ".");
        ctx.$logger.verbose("\tSUCCESS: Found => ddmmyyyy");
        return ctx.$moment(date, "DD-MM-YYYY").valueOf();
    }
    if (yymmdd && yymmdd.length) {
        const date = yymmdd[0].replace(" ", ".");
        ctx.$logger.verbose("\tSUCCESS: Found => yymmdd");
        return ctx.$moment(date, "YY-MM-DD").valueOf();
    }
    ctx.$logger.verbose("\tFAILED: Could not find a date");
    return null;
};
exports.dateToTimestamp = dateToTimestamp;
function stripStr(str, keepDate = false) {
    str = str.toString();
    str = str.toLowerCase().replace("'", "");
    str = str.toLowerCase().replace(/P.O.V./gi, "pov");
    if (!keepDate) {
        str = str.toLowerCase().replace(/\b0+/g, "");
    }
    str = str.replace(/[^a-zA-Z0-9'/\\,(){}]/g, " ");
    str = str.replace(/  +/g, " ");
    return str;
}
exports.stripStr = stripStr;
function escapeRegExp(string) {
    var _a;
    return (_a = string === null || string === void 0 ? void 0 : string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")) !== null && _a !== void 0 ? _a : "";
}
exports.escapeRegExp = escapeRegExp;
const createQuestionPrompter = (inquirer, testingStatus, $logger) => {
    const questionAsync = (promptArgs) => __awaiter(void 0, void 0, void 0, function* () {
        if (testingStatus) {
            $logger.info(`TESTMODE: ${JSON.stringify(promptArgs["name"])} => ${JSON.stringify(promptArgs["testAnswer"])}`);
            return { [promptArgs["name"]]: promptArgs["testAnswer"] };
        }
        return inquirer.prompt(promptArgs);
    });
    return questionAsync;
};
exports.createQuestionPrompter = createQuestionPrompter;
const ignoreDbLine = (line) => {
    if (!line) {
        return true;
    }
    try {
        const parsed = JSON.parse(line);
        return parsed.$$deleted;
    }
    catch (err) {
        return true;
    }
};
exports.ignoreDbLine = ignoreDbLine;
const matchSceneResultToSearch = (ctx, sceneList, knownActors, studio) => {
    ctx.$logger.verbose(`MATCH: ${sceneList.length} results found`);
    for (const scene of sceneList) {
        ctx.$logger.verbose(`MATCH:\tTrying to match TPD title: ${JSON.stringify(scene.title)} --with--> ${JSON.stringify(ctx.sceneName)}`);
        let searchedTitle = stripStr(ctx.sceneName).toLowerCase();
        let matchTitle = stripStr(scene.title || "").toLowerCase();
        if (!matchTitle) {
            continue;
        }
        for (const actor of knownActors) {
            if (actor) {
                searchedTitle = searchedTitle.replace(actor.toLowerCase(), "");
                matchTitle = matchTitle.replace(actor.toLowerCase(), "");
            }
        }
        if (studio) {
            searchedTitle = searchedTitle.replace(studio.toLowerCase(), "");
            searchedTitle = searchedTitle.replace(studio.toLowerCase().replace(" ", ""), "");
            matchTitle = matchTitle.replace(studio.toLowerCase(), "");
        }
        matchTitle = matchTitle.trim();
        searchedTitle = searchedTitle.trim();
        if (matchTitle) {
            const matchTitleRegex = new RegExp(matchTitle, "i");
            if (searchedTitle !== undefined) {
                if (matchTitleRegex.test(searchedTitle)) {
                    ctx.$logger.verbose(`MATCH:\t\tSUCCESS: ${JSON.stringify(searchedTitle)} did match to ${JSON.stringify(matchTitle)}`);
                    return scene;
                }
            }
        }
    }
    ctx.$logger.error(`MATCH:\tERR: did not find any match`);
    return null;
};
exports.matchSceneResultToSearch = matchSceneResultToSearch;
const normalizeSceneResultData = (sceneData) => {
    var _a;
    const result = {};
    if (sceneData.title) {
        result.name = sceneData.title;
    }
    if (sceneData.description) {
        result.description = sceneData.description;
    }
    if (sceneData.date) {
        result.releaseDate = new Date(sceneData.date).getTime();
    }
    if ((_a = sceneData.tags) === null || _a === void 0 ? void 0 : _a.length) {
        result.labels = sceneData.tags.map((l) => l.tag);
    }
    if (sceneData.background.large && !sceneData.background.large.includes("default.png")) {
        result.thumbnail = sceneData.background.large;
    }
    if (sceneData.performers) {
        result.actors = sceneData.performers.map((p) => p.name);
    }
    if (sceneData.site.name) {
        result.studio = sceneData.site.name;
    }
    return result;
};
exports.normalizeSceneResultData = normalizeSceneResultData;
const checkSceneExistsInDb = (ctx, sceneTitle) => {
    var _a, _b, _c;
    if (!sceneTitle || !((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.sceneDuplicationCheck) || !((_c = (_b = ctx.args) === null || _b === void 0 ? void 0 : _b.source_settings) === null || _c === void 0 ? void 0 : _c.scenes)) {
        return;
    }
    let foundDupScene = false;
    const lines = ctx.$fs.readFileSync(ctx.args.source_settings.scenes, "utf8").split("\n");
    let line = lines.shift();
    while (!foundDupScene && line) {
        if (exports.ignoreDbLine(line) || !stripStr(JSON.parse(line).name.toString())) {
            line = lines.shift();
            continue;
        }
        let matchSceneRegexes = [
            escapeRegExp(stripStr(JSON.parse(line).name.toString())),
            escapeRegExp(stripStr(JSON.parse(line).name.toString()).replace(/ /g, "")),
        ].map((str) => new RegExp(str, "gi"));
        if (matchSceneRegexes.some((regex) => regex.test(stripStr(sceneTitle)))) {
            foundDupScene = true;
            break;
        }
        line = lines.shift();
    }
    if (foundDupScene) {
        ctx.$logger.warn("Title Duplication check: Found a possible duplicate title in the database");
    }
    else {
        ctx.$logger.verbose("Title Duplication check: Did not find any possible duplicate title");
    }
};
exports.checkSceneExistsInDb = checkSceneExistsInDb;
