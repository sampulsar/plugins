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
function searchWhitney(args = {}) {
    return runPlugin({
        actorName: "Whitney Wright",
        args,
    });
}
function searchWhitneyKindaWrongThough(args = {}) {
    return runPlugin({
        actorName: "Whitney Wri",
        args,
    });
}
describe("freeones", () => {
    it("Search 'Whitney Wright'", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney();
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright, piercings as array'", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({ piercingsType: "array" });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: ["Navel", "Left Ear, Vch"],
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright' with whitelist", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            whitelist: ["nationality", "hair color"],
        });
        expect(result).to.deep.equal({
            nationality: "US",
            custom: {
                "hair color": "Brown",
            },
        });
    }));
    it("Search 'Whitney Wright', dry", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            dry: true,
        });
        expect(result).to.deep.equal({});
    }));
    it("Search 'Whitney Wright, with avatar as thumbnail'", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            useAvatarAsThumbnail: true,
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.equal(result.avatar);
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wri'", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitneyKindaWrongThough();
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without hair color", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["hair color"],
        });
        expect(result.custom).to.deep.equal({
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without eye color", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["eye color"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without ethnicity", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["ethnicity"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without height", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["height"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            weight: 57,
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without weight", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["weight"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without avatar", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["avatar"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.undefined;
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without labels", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["labels"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.be.undefined;
    }));
    it("Search 'Whitney Wright', but without nationality", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["nationality"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.be.undefined;
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but imperial", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            useImperial: true,
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 5.54,
            weight: 125.4,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            measurements: "32B-25-36",
            "waist size": 25,
            "hip size": 36,
            "cup size": "B",
            "bra size": "32B",
            "bust size": 32,
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Hazel Eyes");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
    it("Search 'Whitney Wright', but without measurements", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield searchWhitney({
            blacklist: ["measurements"],
        });
        expect(result.custom).to.deep.equal({
            "hair color": "Brown",
            "eye color": "Hazel",
            ethnicity: "Caucasian",
            height: 168,
            weight: 57,
            birthplace: "Oklahoma City, OK",
            zodiac: "Virgo",
            gender: "Female",
            sex: "Female",
            piercings: "Navel; Left Ear, Vch",
        });
        expect(result.nationality).to.equal("US");
        expect(result.bornOn).to.be.a("number");
        expect(result.avatar).to.be.a("string");
        expect(result.thumbnail).to.be.undefined;
        expect(result.labels).to.have.length.greaterThan(0);
        expect(result.labels).to.contain("Brown Hair");
        expect(result.labels).to.contain("Caucasian");
        expect(result.labels).to.contain("Female");
        expect(result.labels).to.contain("Piercings");
        expect(result.labels).to.not.contain("Tattoos");
    }));
});
