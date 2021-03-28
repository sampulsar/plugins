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
const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");
const runPlugin = createPluginRunner("freeones", plugin);
function search(args = {}) {
    return runPlugin({
        actorName: "Zoe Bloom",
        args,
    });
}
describe("freeones", () => {
    it("Search 'Zoe Bloom'", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield search({
            dry: false,
            blacklist: [],
            useImperial: false,
            useAvatarAsThumbnail: false,
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Green",
            ethnicity: "Caucasian",
            height: 157,
            weight: 50,
            birthplace: "Pittsburgh, PA",
            zodiac: "Aries",
            measurements: "32A-24-35",
            "waist size": 24,
            "hip size": 35,
            "cup size": "A",
            "bra size": "32A",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Left Nostril",
            tattoos: "Yes",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Green Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.contain("Tattoos");
    }));
    it("Search 'Zoe Bloom' but without measurements", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield search({
            dry: false,
            blacklist: ["measurements"],
            useImperial: false,
            useAvatarAsThumbnail: false,
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Green",
            ethnicity: "Caucasian",
            height: 157,
            weight: 50,
            birthplace: "Pittsburgh, PA",
            zodiac: "Aries",
            gender: "Female",
            sex: "Female",
            piercings: "Left Nostril",
            tattoos: "Yes",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Green Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.contain("Tattoos");
    }));
});
