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
const runPlugin = createPluginRunner("traxxx", plugin);
describe("tpdb", () => {
    it("throws if no 'args'", () => __awaiter(void 0, void 0, void 0, function* () {
        let errored = false;
        try {
            yield runPlugin({ event: "studioCreated" });
        }
        catch (error) {
            expect(error.message.includes("cannot run plugin")).to.be.true;
            errored = true;
        }
        expect(errored).to.be.true;
    }));
    it("throws if no event name", () => __awaiter(void 0, void 0, void 0, function* () {
        let errored = false;
        try {
            yield runPlugin({ args: {} });
        }
        catch (error) {
            expect(error.message).to.equal("Uh oh. You shouldn't use the plugin for this type of event");
            errored = true;
        }
        expect(errored).to.be.true;
    }));
});
