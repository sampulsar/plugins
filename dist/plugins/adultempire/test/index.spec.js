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
const { createPluginRunner } = require("../../../context");
const plugin = require("../main");
const { expect } = require("chai");
const runPlugin = createPluginRunner("adultEmpire", plugin);
describe("adultempire", () => {
    it("Should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        let errord = false;
        try {
            yield runPlugin();
        }
        catch (error) {
            expect(error.message).to.equal("Uh oh. You shouldn't use the plugin for this type of event");
            errord = true;
        }
        expect(errord).to.be.true;
    }));
    describe("Actors", () => {
        it("Should fetch info", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield runPlugin({
                actorName: "Avi love",
                args: {},
            });
            expect(result.avatar).to.be.a("string");
            expect(result.$ae_avatar).to.equal("https://imgs1cdn.adultempire.com/actors/675975h.jpg");
            expect(result.hero).to.be.a("string");
            expect(result.$ae_hero).to.equal("https://imgs1cdn.adultempire.com/actors/675975hero.jpg");
            expect(result.aliases).to.deep.equal(["Maricella", "FTV Maricella"]);
            expect(result.description.startsWith(`"I'm mixed with a little bit of everything," pornstar Avi Love once said.`)).to.be.true;
        }));
    });
    describe("Movies", () => {
        it("Should fetch covers & studio name from page", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield runPlugin({
                movieName: "tushy raw v5",
                args: {},
            });
            expect(result).to.be.an("object");
            expect(result.name).to.equal("Tushy Raw V5");
            expect(result.frontCover).to.be.a("string");
            expect(result.backCover).to.be.a("string");
            expect(result.studio).to.be.a("string").equal("Tushy Raw");
            expect(result.description)
                .to.be.a("string")
                .equal("TUSHY.com is proud to present its newest studio TUSHY RAW. TUSHY RAW is straight to the point - hard, hot, and intense anal sex with the most beautiful women on the planet. Everything you see here is 100% real & raw. See more at TUSHYRAW.com");
            expect(result.releaseDate).to.be.a("number");
            const date = new Date(result.releaseDate);
            expect(date.getDate(), 28);
            expect(date.getMonth(), 7);
            expect(date.getFullYear(), 2019);
        }));
        it("Should fetch covers & studio name from page 2", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield runPlugin({
                movieName: "Black & White Vol. 15",
                args: {},
            });
            expect(result).to.be.an("object");
            expect(result.name).to.equal("Black & White Vol. 15");
            expect(result.frontCover).to.be.a("string");
            expect(result.backCover).to.be.a("string");
            expect(result.studio).to.be.a("string").equal("Blacked");
            expect(result.description)
                .to.be.a("string")
                .equal("BLACKED.com and Greg Lansky are proud to present Black and White Vol. 15! This next collection in the award-winning series is back to showcase the absolute biggest and brightest in IR sex. Cover model Kali Roses plays a college student who is the best type of insatiable - one that could only be satisfied by an entire football team. Also featuring career-defining performances by Nicole Aniston, Khloe Kapri, and Angel Emily. Come for BLACKED.com's unrivaled production value, and stay for the hot, unparalleled passionate IR performances. Black and White Vol. 15 is a collection not to be missed.");
            expect(result.releaseDate).to.be.a("number");
            const date = new Date(result.releaseDate);
            expect(date.getDate(), 28);
            expect(date.getMonth(), 7);
            expect(date.getFullYear(), 2019);
        }));
        it("Should not fetch covers etc (404)", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield runPlugin({
                movieName: "fasdfawbwaerawerawebr",
                args: {},
            });
            expect(result).to.deep.equal({});
        }));
    });
});
