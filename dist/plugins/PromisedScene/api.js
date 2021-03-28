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
exports.Api = void 0;
class Api {
    constructor(ctx) {
        this.ctx = ctx;
        this.axios = ctx.$axios.create({
            baseURL: "https://api.metadataapi.net/api",
        });
    }
    parseScene(parse) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ctx.$logger.verbose(`GET: https://api.metadataapi.net/api/scenes?parse=${encodeURIComponent(parse)}`);
            return this.axios.get("/scenes", {
                params: {
                    parse,
                },
            });
        });
    }
    getSceneById(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/scenes/${sceneId}`);
        });
    }
    getSites() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get("/sites");
        });
    }
}
exports.Api = Api;
