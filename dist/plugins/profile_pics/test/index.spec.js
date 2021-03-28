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
const context = require("../../../context");
const plugin = require("../main");
const { expect } = require("chai");
describe("adultempire", () => {
    it("Should find a thumbnail", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield plugin(Object.assign(Object.assign({}, context), { actorName: "001", args: {
                path_thumb: "./plugins/profile_pics/test/fixtures",
            } }));
        expect(result).to.be.an("object");
        expect(result.thumbnail).to.be.a("string");
    }));
    it("Should find no image", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield plugin(Object.assign(Object.assign({}, context), { actorName: "003", args: {
                path_thumb: "./plugins/profile_pics/test/fixtures",
            } }));
        expect(result).to.be.an("object");
        expect(result.thumbnail).to.be.undefined;
    }));
    it("Should find a thumbnail 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield plugin(Object.assign(Object.assign({}, context), { actorName: "001", args: {
                path_hero: "./plugins/profile_pics/test/fixtures",
            } }));
        expect(result).to.be.an("object");
        expect(result.hero).to.be.a("string");
    }));
    it("Should find no image 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield plugin(Object.assign(Object.assign({}, context), { actorName: "003", args: {
                path_hero: "./plugins/profile_pics/test/fixtures",
            } }));
        expect(result).to.be.an("object");
        expect(result.hero).to.be.undefined;
    }));
});
