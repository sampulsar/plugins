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
const { actorFixtures, movieFixtures, studioFixtures, sceneFixtures, basicFixtures, actorCreateImageFixtures, } = require("./fixtures/main.fixtures");
const { createPluginRunner } = require("../../../context");
const runPlugin = createPluginRunner("pics", plugin);
describe("pics", () => {
    describe("basic", () => {
        basicFixtures.forEach((fixture, fixtureIndex) => {
            it(`${fixtureIndex} ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                let errored = false;
                try {
                    yield runPlugin(Object.assign({}, fixture.runContext));
                }
                catch (err) {
                    if (fixture.errorMessage) {
                        expect(err.message.includes(fixture.errorMessage)).to.be.true;
                    }
                    errored = true;
                    if (!fixture.errored) {
                        console.error(err);
                    }
                }
                expect(errored).to.equal(Boolean(fixture.errored));
            }));
        });
    });
    ["actorCreated", "actorCustom"].forEach((event) => {
        describe(event, () => {
            actorFixtures.forEach((fixture, fixtureIndex) => {
                it(`${fixtureIndex} ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    let errored = false;
                    let result;
                    try {
                        result = yield runPlugin(Object.assign(Object.assign({}, fixture.runContext), { event }));
                    }
                    catch (err) {
                        if (fixture.errorMessage) {
                            expect(err.message.includes(fixture.errorMessage)).to.be.true;
                        }
                        errored = true;
                        if (!fixture.errored) {
                            console.error(err);
                        }
                    }
                    expect(errored).to.equal(Boolean(fixture.errored));
                    if (fixture.result) {
                        expect(result).to.be.an("object");
                        expect(result).to.deep.equal(fixture.result);
                    }
                }));
            });
            actorCreateImageFixtures.forEach((fixture, fixtureIndex) => {
                it(`${fixtureIndex} ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    let errored = false;
                    let createImageCallCount = 0;
                    let result;
                    try {
                        result = yield runPlugin(Object.assign(Object.assign({}, fixture.runContext), { $createLocalImage: () => {
                                createImageCallCount++;
                            }, event }));
                    }
                    catch (err) {
                        if (fixture.errorMessage) {
                            expect(err.message.includes(fixture.errorMessage)).to.be.true;
                        }
                        errored = true;
                        if (!fixture.errored) {
                            console.error(err);
                        }
                    }
                    expect(errored).to.equal(Boolean(fixture.errored));
                    if (fixture.result) {
                        expect(result).to.be.an("object");
                        expect(result).to.deep.equal(fixture.result);
                    }
                    expect(createImageCallCount).to.equal(fixture.createImageCallCount);
                }));
            });
        });
    });
    ["sceneCreated", "sceneCustom"].forEach((event) => {
        describe(event, () => {
            sceneFixtures.forEach((fixture, fixtureIndex) => {
                it(`${fixtureIndex} ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    let errored = false;
                    let result;
                    try {
                        result = yield runPlugin(Object.assign(Object.assign({}, fixture.runContext), { event }));
                    }
                    catch (err) {
                        if (fixture.errorMessage) {
                            expect(err.message.includes(fixture.errorMessage)).to.be.true;
                        }
                        errored = true;
                        if (!fixture.errored) {
                            console.error(err);
                        }
                    }
                    expect(errored).to.equal(Boolean(fixture.errored));
                    if (fixture.result) {
                        expect(result).to.be.an("object");
                        expect(result).to.deep.equal(fixture.result);
                    }
                }));
            });
        });
    });
    ["movieCreated"].forEach((event) => {
        describe(event, () => {
            movieFixtures.forEach((fixture, fixtureIndex) => {
                it(`${fixtureIndex} ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    let errored = false;
                    let result;
                    try {
                        result = yield runPlugin(Object.assign(Object.assign({}, fixture.runContext), { event }));
                    }
                    catch (err) {
                        if (fixture.errorMessage) {
                            expect(err.message.includes(fixture.errorMessage)).to.be.true;
                        }
                        errored = true;
                        if (!fixture.errored) {
                            console.error(err);
                        }
                    }
                    expect(errored).to.equal(Boolean(fixture.errored));
                    if (fixture.result) {
                        expect(result).to.be.an("object");
                        expect(result).to.deep.equal(fixture.result);
                    }
                }));
            });
        });
    });
    ["studioCreated", "studioCustom"].forEach((event) => {
        describe(event, () => {
            studioFixtures.forEach((fixture, fixtureIndex) => {
                it(`${fixtureIndex} ${fixture.name}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    let errored = false;
                    let result;
                    try {
                        result = yield runPlugin(Object.assign(Object.assign({}, fixture.runContext), { event }));
                    }
                    catch (err) {
                        if (fixture.errorMessage) {
                            expect(err.message.includes(fixture.errorMessage)).to.be.true;
                        }
                        errored = true;
                        if (!fixture.errored) {
                            console.error(err);
                        }
                    }
                    expect(errored).to.equal(Boolean(fixture.errored));
                    if (fixture.result) {
                        expect(result).to.be.an("object");
                        expect(result).to.deep.equal(fixture.result);
                    }
                }));
            });
        });
    });
});
