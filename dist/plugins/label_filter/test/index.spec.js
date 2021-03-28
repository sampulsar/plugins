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
const tests = require("./index.fixture");
const { createPluginRunner } = require("../../../context");
const runPlugin = createPluginRunner("label_filter", plugin);
describe("label_filter", () => {
    for (const test of tests) {
        it("Should work correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield runPlugin({
                args: test.args,
                data: test.data,
            });
            expect(result).to.deep.equal(test.result);
        }));
    }
});
