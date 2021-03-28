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
exports.buildImageUrls = exports.Api = void 0;
class Api {
    constructor(ctx) {
        this.ctx = ctx;
        this.axios = ctx.$axios.create({
            baseURL: "https://traxxx.me/api",
        });
    }
    getChannel(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/channels/${idOrSlug}`);
        });
    }
    getNetwork(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/networks/${idOrSlug}`);
        });
    }
    getAllEntities(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchPromises = [];
            searchPromises.push(this.getChannel(idOrSlug)
                .then((res) => res.data.entity)
                .catch((err) => {
                var _a;
                const _err = err;
                if (((_a = _err.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    this.ctx.$logger.verbose(`"${idOrSlug}" does not exist as a channel`);
                }
                else {
                    this.ctx.$throw(err);
                }
                return undefined;
            }));
            searchPromises.push(this.getNetwork(idOrSlug)
                .then((res) => res.data.entity)
                .catch((err) => {
                var _a;
                const _err = err;
                if (((_a = _err.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    this.ctx.$logger.verbose(`"${idOrSlug}" does not exist as a network`);
                }
                else {
                    this.ctx.$throw(err);
                }
                return undefined;
            }));
            const [channel, network] = yield Promise.all(searchPromises);
            return {
                channel,
                network,
            };
        });
    }
}
exports.Api = Api;
const buildImageUrls = (entity) => {
    const baseUrl = "https://traxxx.me/img/logos/";
    return {
        logo: entity.logo ? `${baseUrl}${entity.logo}` : undefined,
        thumbnail: entity.thumbnail ? `${baseUrl}${entity.thumbnail}` : undefined,
        favicon: entity.favicon ? `${baseUrl}${entity.favicon}` : undefined,
    };
};
exports.buildImageUrls = buildImageUrls;
