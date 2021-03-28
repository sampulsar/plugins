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
exports.ChannelExtractor = void 0;
const api_1 = require("./api");
const util_1 = require("./util");
class ChannelExtractor {
    constructor(ctx, { channel, network, entityPreference, }) {
        this.ctx = ctx;
        this.api = new api_1.Api(ctx);
        this.channel = channel;
        this.network = network;
        this.entityPreference = entityPreference;
        this.preferredEntity = this.getPreferredEntity();
    }
    getPreferredEntity() {
        const bothExist = !!this.channel && !!this.network;
        if (this.entityPreference === "channel" ||
            (this.entityPreference === "none" &&
                (!this.network || (bothExist && this.ctx.args.studios.channelPriority)))) {
            return { type: "channel", entity: this.channel };
        }
        if (this.entityPreference === "network" ||
            (this.entityPreference === "none" &&
                (!this.channel || (bothExist && !this.ctx.args.studios.channelPriority)))) {
            return { type: "network", entity: this.network };
        }
        return undefined;
    }
    _getName() {
        var _a, _b, _c, _d, _e, _f;
        const baseName = (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.name;
        if (!baseName) {
            return {};
        }
        const ignoreNameConflicts = ((_c = this.channel) === null || _c === void 0 ? void 0 : _c.name) !== ((_d = this.network) === null || _d === void 0 ? void 0 : _d.name) ||
            (!this.ctx.args.studios.uniqueNames && this.entityPreference === "none");
        if (ignoreNameConflicts) {
            return { name: baseName };
        }
        let suffix = "";
        if (((_e = this.preferredEntity) === null || _e === void 0 ? void 0 : _e.type) === "channel") {
            suffix = this.ctx.args.studios.channelSuffix;
        }
        else if (((_f = this.preferredEntity) === null || _f === void 0 ? void 0 : _f.type) === "network") {
            suffix = this.ctx.args.studios.networkSuffix;
        }
        return { name: `${baseName}${suffix}` };
    }
    getName() {
        if (util_1.suppressProp(this.ctx, "name")) {
            return {};
        }
        return this._getName();
    }
    getDescription() {
        var _a, _b;
        if (util_1.suppressProp(this.ctx, "description")) {
            return {};
        }
        const description = (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.description;
        if (!description) {
            return {};
        }
        return { description };
    }
    getThumbnail() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.suppressProp(this.ctx, "thumbnail")) {
                return {};
            }
            const entity = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity;
            if (!entity) {
                return {};
            }
            const { logo } = api_1.buildImageUrls(entity);
            if (!logo) {
                return {};
            }
            const thumbnail = this.ctx.args.dry
                ? `_would_have_created_${logo}`
                : yield this.ctx.$createImage(logo, this._getName().name || this.ctx.studioName, true);
            return {
                thumbnail,
            };
        });
    }
    getAliases() {
        var _a, _b;
        if (util_1.suppressProp(this.ctx, "aliases")) {
            return {};
        }
        const ourAliases = ((_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.aliases) || [];
        if (!ourAliases.length) {
            return {};
        }
        const previousAliases = this.ctx.data.aliases;
        if ((previousAliases === null || previousAliases === void 0 ? void 0 : previousAliases.length) && this.ctx.args.studios.mergeAliases) {
            return {
                aliases: [...previousAliases, ...ourAliases],
            };
        }
        return {
            aliases: ourAliases,
        };
    }
    getParent() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.suppressProp(this.ctx, "parent")) {
                return {};
            }
            const parentName = (_c = (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.name;
            if (!parentName) {
                return {};
            }
            if (((_e = (_d = this.preferredEntity) === null || _d === void 0 ? void 0 : _d.entity) === null || _e === void 0 ? void 0 : _e.name) === parentName) {
                if (this.ctx.args.studios.uniqueNames) {
                    return { parent: `${parentName}${this.ctx.args.studios.networkSuffix}` };
                }
                this.ctx.$logger.warn(`Cannot return parent name, would conflict with current name`);
                return {};
            }
            const parentSlug = (_h = (_g = (_f = this.preferredEntity) === null || _f === void 0 ? void 0 : _f.entity) === null || _g === void 0 ? void 0 : _g.parent) === null || _h === void 0 ? void 0 : _h.slug;
            if (!parentSlug) {
                this.ctx.$logger.warn(`Parent did not have slug, cannot check for name conflict, will not return parent'`);
                return {};
            }
            const { channel: parentAsChannel, network: parentAsNetwork } = yield this.api.getAllEntities(parentSlug);
            if ((parentAsChannel === null || parentAsChannel === void 0 ? void 0 : parentAsChannel.name) === (parentAsNetwork === null || parentAsNetwork === void 0 ? void 0 : parentAsNetwork.name)) {
                if (this.ctx.args.studios.uniqueNames) {
                    return { parent: `${parentName}${this.ctx.args.studios.networkSuffix}` };
                }
                this.ctx.$logger.warn(`Cannot return parent name, would conflict other parent's other type'`);
                return {};
            }
            return { parent: parentName };
        });
    }
    getCustom() {
        var _a, _b, _c, _d, _e, _f;
        return {
            ["Traxxx Slug"]: (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.slug,
            ["Traxxx Type"]: (_d = (_c = this.preferredEntity) === null || _c === void 0 ? void 0 : _c.entity) === null || _d === void 0 ? void 0 : _d.type,
            Homepage: (_f = (_e = this.preferredEntity) === null || _e === void 0 ? void 0 : _e.entity) === null || _f === void 0 ? void 0 : _f.url,
        };
    }
}
exports.ChannelExtractor = ChannelExtractor;
exports.default = (initialContext) => __awaiter(void 0, void 0, void 0, function* () {
    const { $logger, $formatMessage, $throw, studioName } = initialContext;
    try {
        const validatedArgs = util_1.validateArgs(initialContext);
        if (validatedArgs) {
            initialContext.args = validatedArgs;
        }
    }
    catch (err) {
        $throw(err);
        return {};
    }
    const ctx = initialContext;
    const args = ctx.args;
    const api = new api_1.Api(ctx);
    const entityPreference = util_1.getEntityPreferenceFromName(ctx, studioName);
    const slugifiedName = util_1.slugify(util_1.normalizeStudioName(ctx, studioName));
    ctx.$logger.verbose(`Trying to match "${studioName}" as "${slugifiedName}"`);
    if (entityPreference !== "none") {
        ctx.$logger.verbose(`Identified as ${entityPreference} from current name`);
    }
    const { channel, network } = yield api.getAllEntities(slugifiedName);
    if (!channel && !network) {
        $logger.warn(`Could not find channel or network "${studioName}" in TRAXXX`);
        return {};
    }
    const channelExtractor = new ChannelExtractor(ctx, {
        channel,
        network,
        entityPreference,
    });
    const result = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, channelExtractor.getName()), channelExtractor.getDescription()), (yield channelExtractor.getThumbnail())), channelExtractor.getAliases()), (yield channelExtractor.getParent())), { custom: channelExtractor.getCustom() });
    if (args.dry) {
        $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(result)}`);
        return {};
    }
    return result;
});
