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
const { validationFixtures, defaultArgsResultFixtures, genericResultFixtures, } = require("./fixtures/studio.fixtures");
const { createPluginRunner } = require("../../../context");
const runPlugin = createPluginRunner("traxxx", plugin);
describe("traxxx studio", () => {
    ["studioCreated", "studioCustom"].forEach((event) => {
        describe(event, () => {
            describe("validate args", () => {
                validationFixtures.forEach((fixture, fixtureIdx) => {
                    it(`[${fixtureIdx}] ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                        let errored = false;
                        try {
                            yield runPlugin(Object.assign(Object.assign({}, fixture.context), { event }));
                        }
                        catch (error) {
                            if (fixture.errorMessage) {
                                expect(error.message.includes(fixture.errorMessage)).to.be.true;
                            }
                            errored = true;
                        }
                        expect(errored).to.equal(fixture.errored);
                    }));
                });
            });
            describe("default args", () => {
                defaultArgsResultFixtures.forEach((fixture, fixtureIdx) => {
                    it(`[${fixtureIdx}] ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                        let errored = false;
                        let result;
                        try {
                            result = yield runPlugin(Object.assign(Object.assign({}, fixture.context), { event }));
                        }
                        catch (error) {
                            if (fixture.errorMessage) {
                                expect(error.message.includes(fixture.errorMessage)).to.be.true;
                            }
                            errored = true;
                        }
                        expect(errored).to.equal(fixture.errored);
                        expect(result).to.deep.equal(fixture.result);
                    }));
                });
            });
            describe("other tests", () => {
                genericResultFixtures.forEach((fixture, fixtureIdx) => {
                    it(`[${fixtureIdx}] ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                        let errored = false;
                        let result;
                        try {
                            result = yield runPlugin(Object.assign(Object.assign({}, fixture.context), { event }));
                        }
                        catch (error) {
                            if (fixture.errorMessage) {
                                expect(error.message.includes(fixture.errorMessage)).to.be.true;
                            }
                            errored = true;
                        }
                        expect(errored).to.equal(fixture.errored);
                        if (!fixture.errored) {
                            expect(result).to.deep.equal(fixture.result);
                        }
                    }));
                });
            });
        });
    });
});
