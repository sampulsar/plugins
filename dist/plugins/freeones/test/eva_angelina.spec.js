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
        actorName: "Eva Angelina",
        args,
    });
}
describe("freeones", () => {
    it("Search 'Eva Angelina'", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield search({
            dry: false,
            blacklist: [],
            useImperial: false,
            useAvatarAsThumbnail: false,
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Latin",
            height: 160,
            weight: 54,
            birthplace: "Orange County, CA",
            zodiac: "Pisces",
            measurements: "34D-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "D",
            "bust size": 34,
            "bra size": "34D",
            gender: "Female",
            sex: "Female",
            piercings: "Right Nostril; Navel; Left Eyebrow; Both Nipples",
            tattoos: "Back Of Neck; Half-Sleeve With Large Skull On Right Upper Arm; Heart With Devil Horns On Left Breast",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Latin");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.contain("Tattoos");
    }));
});
