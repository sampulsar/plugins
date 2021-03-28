"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppressProp = exports.isOverrideBlacklisted = exports.propExistsInData = exports.isBlacklisted = exports.slugify = exports.stripAccents = exports.getEntityPreferenceFromName = exports.normalizeStudioName = exports.validateArgs = exports.hasProp = void 0;
const hasProp = (target, prop) => {
    return !!target && typeof target === "object" && Object.hasOwnProperty.call(target, prop);
};
exports.hasProp = hasProp;
const DEFAULT_STUDIO_SETTINGS = {
    channelPriority: true,
    uniqueNames: true,
    channelSuffix: "",
    networkSuffix: " (Network)",
    whitelist: [],
    blacklist: [],
    whitelistOverride: [],
    blacklistOverride: [],
    mergeAliases: true,
};
const validateArgs = ({ args, $throw, $logger, studioName, }) => {
    let validatedArgs;
    if (args && typeof args === "object") {
        validatedArgs = Object.assign({}, args);
    }
    if (!studioName || typeof studioName !== "string") {
        return $throw(`Missing "studioName", cannot run plugin`);
    }
    if (!validatedArgs || typeof validatedArgs !== "object") {
        return $throw(`Missing args, cannot run plugin`);
    }
    if (!validatedArgs.studios || typeof validatedArgs.studios !== "object") {
        $logger.verbose(`Missing "args.studios.channelPriority, setting to default: `, DEFAULT_STUDIO_SETTINGS);
        validatedArgs.studios = DEFAULT_STUDIO_SETTINGS;
    }
    else {
        validatedArgs.studios = Object.assign({}, validatedArgs.studios);
    }
    const studios = validatedArgs.studios;
    [
        { prop: "channelPriority", type: "boolean" },
        { prop: "uniqueNames", type: "boolean" },
        { prop: "channelSuffix", type: "string" },
        { prop: "networkSuffix", type: "string" },
        { prop: "mergeAliases", type: "boolean" },
    ].forEach((propCheck) => {
        if (!exports.hasProp(studios, propCheck.prop)) {
            $logger.verbose(`Missing "args.studios.${propCheck.prop}", setting to default: "${DEFAULT_STUDIO_SETTINGS[propCheck.prop]}"`);
            studios[propCheck.prop] = DEFAULT_STUDIO_SETTINGS[propCheck.prop];
        }
        else if (typeof studios[propCheck.prop] !== propCheck.type) {
            return $throw(`"args.studios.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`);
        }
    });
    if (validatedArgs.studios.channelSuffix === validatedArgs.studios.networkSuffix) {
        return $throw(`"args.studios.channelSuffix" and "args.studios.networkSuffix" are identical, cannot run plugin`);
    }
    ["whitelist", "blacklist", "whitelistOverride", "blacklistOverride"].forEach((arrayProp) => {
        const arr = studios[arrayProp];
        if (!exports.hasProp(studios, arrayProp)) {
            $logger.verbose(`Missing "args.studios.${arrayProp}", setting to default: "${DEFAULT_STUDIO_SETTINGS[arrayProp]}"`);
            studios[arrayProp] = DEFAULT_STUDIO_SETTINGS[arrayProp];
        }
        else if (!Array.isArray(arr) || !arr.every((prop) => typeof prop === "string")) {
            return $throw(`"args.studios.${arrayProp}" does not only contain strings, cannot run plugin"`);
        }
    });
    return validatedArgs;
};
exports.validateArgs = validateArgs;
function lowercase(str) {
    return str.toLowerCase();
}
const normalizeStudioName = (ctx, name) => {
    return name
        .replace(ctx.args.studios.channelSuffix, "")
        .replace(ctx.args.studios.networkSuffix, "");
};
exports.normalizeStudioName = normalizeStudioName;
const getEntityPreferenceFromName = (ctx, name) => {
    let entityPreference = "none";
    if (ctx.args.studios.channelSuffix && name.endsWith(ctx.args.studios.channelSuffix)) {
        entityPreference = "channel";
    }
    else if (ctx.args.studios.networkSuffix && name.endsWith(ctx.args.studios.networkSuffix)) {
        entityPreference = "network";
    }
    return entityPreference;
};
exports.getEntityPreferenceFromName = getEntityPreferenceFromName;
const stripAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
exports.stripAccents = stripAccents;
const slugify = (str) => {
    let res = str.replace(/\s/g, "");
    res = exports.stripAccents(res);
    res = lowercase(res);
    return res;
};
exports.slugify = slugify;
const isBlacklisted = (ctx, prop) => {
    if (ctx.args.studios.whitelist.length) {
        return !ctx.args.studios.whitelist.includes(lowercase(prop));
    }
    return ctx.args.studios.blacklist.includes(lowercase(prop));
};
exports.isBlacklisted = isBlacklisted;
const propExistsInData = ({ data }, prop) => {
    if (!exports.hasProp(data, prop)) {
        return false;
    }
    if (data[prop] === undefined ||
        data[prop] === null ||
        (typeof data[prop] === "string" && data[prop].trim() === "") ||
        (Array.isArray(data[prop]) && data[prop].length === 0)) {
        return false;
    }
    return true;
};
exports.propExistsInData = propExistsInData;
const isOverrideBlacklisted = (ctx, prop) => {
    if (!exports.propExistsInData(ctx, prop)) {
        return false;
    }
    if (ctx.args.studios.whitelistOverride.length) {
        return !ctx.args.studios.whitelistOverride.includes(lowercase(prop));
    }
    return ctx.args.studios.blacklistOverride.includes(lowercase(prop));
};
exports.isOverrideBlacklisted = isOverrideBlacklisted;
const suppressProp = (ctx, prop) => {
    return exports.isBlacklisted(ctx, prop) || exports.isOverrideBlacklisted(ctx, prop);
};
exports.suppressProp = suppressProp;
