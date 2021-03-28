"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSceneTimestamp = exports.parseSceneStudio = exports.parseSceneActor = void 0;
const levenshtein_1 = __importDefault(require("./levenshtein"));
const util_1 = require("./util");
const parseSceneActor = (ctx) => {
    var _a, _b, _c;
    if (!((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.parseActor) || !((_c = (_b = ctx.args) === null || _b === void 0 ? void 0 : _b.source_settings) === null || _c === void 0 ? void 0 : _c.actors)) {
        return null;
    }
    const cleanScenePath = util_1.stripStr(ctx.scenePath);
    const allDbActors = [];
    let parsedDbActor = null;
    ctx.$logger.verbose(`Parsing Actors DB ==> ${ctx.args.source_settings.actors}`);
    ctx.$fs
        .readFileSync(ctx.args.source_settings.actors, "utf8")
        .split("\n")
        .forEach((line) => {
        if (util_1.ignoreDbLine(line)) {
            return;
        }
        const matchActor = new RegExp(util_1.escapeRegExp(JSON.parse(line).name), "i");
        const actorLength = matchActor.toString().split(" ");
        if (actorLength.length < 2) {
            return;
        }
        const foundActorMatch = cleanScenePath.match(matchActor);
        if (foundActorMatch !== null) {
            allDbActors.push(JSON.parse(line).name);
            return;
        }
        const allAliases = JSON.parse(line).aliases.toString().split(",");
        allAliases.forEach((personAlias) => {
            const aliasLength = personAlias.toString().split(" ");
            if (aliasLength.length < 2) {
                return;
            }
            let matchAliasActor = new RegExp(util_1.escapeRegExp(personAlias), "i");
            let foundAliasActorMatch = cleanScenePath.match(matchAliasActor);
            if (foundAliasActorMatch !== null) {
                allDbActors.push("alias:" + JSON.parse(line).name);
            }
            else {
                const aliasNoSpaces = personAlias.toString().replace(" ", "");
                matchAliasActor = new RegExp(util_1.escapeRegExp(aliasNoSpaces), "i");
                foundAliasActorMatch = cleanScenePath.match(matchAliasActor);
                if (foundAliasActorMatch !== null) {
                    allDbActors.push("alias:" + JSON.parse(line).name);
                }
            }
        });
    });
    let actorHighScore = 5000;
    allDbActors.forEach((person) => {
        let foundAnAlias = false;
        if (person.includes("alias:")) {
            person = person.toString().replace("alias:", "").trim();
            foundAnAlias = true;
        }
        const found = levenshtein_1.default(person.toString().toLowerCase(), cleanScenePath);
        if (found < actorHighScore) {
            actorHighScore = found;
            parsedDbActor = person;
        }
        if (foundAnAlias) {
            ctx.$logger.verbose(`SUCCESS Found Actor-Alias: ${JSON.stringify(person)}`);
        }
        else {
            ctx.$logger.verbose(`SUCCESS Found Actor: ${JSON.stringify(person)}`);
        }
    });
    ctx.$logger.verbose(`\tUsing "best match" Actor For Search: ${JSON.stringify(parsedDbActor)}`);
    return parsedDbActor;
};
exports.parseSceneActor = parseSceneActor;
const parseSceneStudio = (ctx) => {
    var _a, _b, _c;
    if (!((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.parseStudio) || !((_c = (_b = ctx.args) === null || _b === void 0 ? void 0 : _b.source_settings) === null || _c === void 0 ? void 0 : _c.studios)) {
        return null;
    }
    ctx.$logger.verbose(`Parsing Studios DB ==> ${JSON.stringify(ctx.args.source_settings.studios)}`);
    const cleanScenePath = util_1.stripStr(ctx.scenePath);
    const allDbStudios = [];
    let parsedDbStudio = null;
    ctx.$fs
        .readFileSync(ctx.args.source_settings.studios, "utf8")
        .split("\n")
        .forEach((line) => {
        if (util_1.ignoreDbLine(line)) {
            return;
        }
        if (!JSON.parse(line).name) {
            return;
        }
        let matchStudio = new RegExp(util_1.escapeRegExp(JSON.parse(line).name), "i");
        const foundStudioMatch = cleanScenePath.match(matchStudio);
        if (foundStudioMatch !== null) {
            allDbStudios.push(JSON.parse(line).name);
        }
        else if (JSON.parse(line).name !== null) {
            matchStudio = new RegExp(util_1.escapeRegExp(JSON.parse(line).name.replace(/ /g, "")), "i");
            const foundStudioMatch = cleanScenePath.match(matchStudio);
            if (foundStudioMatch !== null) {
                allDbStudios.push(JSON.parse(line).name);
            }
        }
        if (!JSON.parse(line).aliases) {
            return;
        }
        const allStudioAliases = JSON.parse(line).aliases.toString().split(",");
        allStudioAliases.forEach((studioAlias) => {
            if (studioAlias) {
                let matchAliasStudio = new RegExp(util_1.escapeRegExp(studioAlias), "i");
                let foundAliasStudioMatch = cleanScenePath.match(matchAliasStudio);
                if (foundAliasStudioMatch !== null) {
                    allDbStudios.push("alias:" + JSON.parse(line).name);
                }
                else {
                    const aliasNoSpaces = studioAlias.toString().replace(" ", "");
                    matchAliasStudio = new RegExp(util_1.escapeRegExp(aliasNoSpaces), "i");
                    foundAliasStudioMatch = cleanScenePath.match(matchAliasStudio);
                    if (foundAliasStudioMatch !== null) {
                        allDbStudios.push("alias:" + JSON.parse(line).name);
                    }
                }
            }
        });
    });
    let studioHighScore = 5000;
    let foundStudioAnAlias = false;
    let instanceFoundStudioAnAlias = false;
    allDbStudios.forEach((stud) => {
        if (stud.includes("alias:")) {
            stud = stud.toString().replace("alias:", "").trim();
            instanceFoundStudioAnAlias = true;
        }
        const found = levenshtein_1.default(stud.toString().toLowerCase(), cleanScenePath);
        if (found < studioHighScore) {
            studioHighScore = found;
            parsedDbStudio = stud;
            foundStudioAnAlias = instanceFoundStudioAnAlias;
        }
        if (foundStudioAnAlias) {
            ctx.$logger.verbose(`\tSUCCESS: Found Studio-Alias: ${JSON.stringify(parsedDbStudio)}`);
        }
        else {
            ctx.$logger.verbose(`\tSUCCESS: Found Studio: ${JSON.stringify(parsedDbStudio)}`);
        }
    });
    ctx.$logger.verbose(`\tUsing "best match" Studio For Search: ${JSON.stringify(parsedDbStudio)}`);
    return parsedDbStudio;
};
exports.parseSceneStudio = parseSceneStudio;
const parseSceneTimestamp = (ctx) => {
    if (!ctx.args.parseDate) {
        return null;
    }
    const cleanScenePath = util_1.stripStr(ctx.scenePath, true);
    return util_1.dateToTimestamp(ctx, cleanScenePath);
};
exports.parseSceneTimestamp = parseSceneTimestamp;
