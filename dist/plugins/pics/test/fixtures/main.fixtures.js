"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studioFixtures = exports.movieFixtures = exports.sceneFixtures = exports.actorCreateImageFixtures = exports.actorFixtures = exports.basicFixtures = void 0;
const path_1 = __importDefault(require("path"));
const mockContext = {
    $createLocalImage: (path, name) => `${path} ${name}`,
};
const baseArgs = {
    actors: [],
    scenes: [],
    movies: [],
    studios: [],
};
exports.basicFixtures = [
    {
        name: "throw when no event",
        runContext: Object.assign({}, mockContext),
        errored: true,
        errorMessage: "cannot run plugin",
    },
    {
        name: "throws with dummy event",
        runContext: Object.assign(Object.assign({}, mockContext), { event: "fake" }),
        errored: true,
        errorMessage: "cannot run plugin",
    },
    {
        name: "throws when missing name",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "", args: Object.assign(Object.assign({}, baseArgs), { event: "actorCreated", actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["thumbnail"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        errored: true,
        errorMessage: "cannot run plugin",
    },
    {
        name: "throws when missing event args paths",
        runContext: Object.assign(Object.assign({}, mockContext), { event: "actorCreated", actorName: "", args: Object.assign(Object.assign({}, baseArgs), { actors: null }) }),
        errored: true,
        errorMessage: "validation issue",
    },
    {
        name: "throws when args not conform to schema",
        runContext: Object.assign(Object.assign({}, mockContext), { event: "actorCreated", actorName: "", args: Object.assign(Object.assign({}, baseArgs), { actors: [{ prop: "test", path: "./plugins/pics/test/fixtures" }] }) }),
        errored: true,
        errorMessage: "validation issue",
    },
    {
        name: "throws when args not conform to schema 2",
        runContext: Object.assign(Object.assign({}, mockContext), { event: "actorCreated", actorName: "", args: Object.assign(Object.assign({}, baseArgs), { actors: [{ prop: "test", searchTerms: "", path: "./plugins/pics/test/fixtures" }] }) }),
        errored: true,
        errorMessage: "validation issue",
    },
    {
        name: "does not throw when args conform to schema",
        runContext: Object.assign(Object.assign({}, mockContext), { event: "actorCreated", actorName: "test actor", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    { prop: "thumbnail", searchTerms: ["thumbnail"], path: "./plugins/pics/test/fixtures" },
                ] }) }),
        errored: false,
    },
];
exports.actorFixtures = [
    {
        name: "Should find a thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (thumbnail)"),
        },
    },
    {
        name: "Should find another thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "002", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["002"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image002.gif"), "002 (thumbnail)"),
        },
    },
    {
        name: "Should find when searchTerms",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "004", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        path: "./plugins/pics/test/fixtures",
                        searchTerms: ["dummy"],
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/deep/image004-dummy.jpg"), "004 (thumbnail)"),
        },
    },
    {
        name: "Should not find when no file with searchTerms",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "004", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        path: "./plugins/pics/test/fixtures",
                        searchTerms: ["not_exist"],
                    },
                ] }) }),
        result: {},
    },
    {
        name: "Should find no image",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "003", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
    {
        name: "Should find hero",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "hero",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            hero: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (hero)"),
        },
    },
    {
        name: "Should not find hero",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "003", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "hero",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
    {
        name: "deep: Should find a thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "005", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["005"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/deep/image005.jpg"), "005 (thumbnail)"),
        },
    },
    {
        name: "deep: Should find a thumbnail 2",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "004", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["deep", "dummy"],
                        path: "./plugins/pics/test/fixtures",
                        mustMatchInFilename: false,
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/deep/image004-dummy.jpg"), "004 (thumbnail)"),
        },
    },
    {
        name: "deep: Should not find a thumbnail when term not in basename",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "004", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["deep", "dummy"],
                        path: "./plugins/pics/test/fixtures",
                        mustMatchInFilename: true,
                    },
                ] }) }),
        result: {},
    },
    {
        name: "deep: Should find another thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "006", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["006"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/deep/image006.gif"), "006 (thumbnail)"),
        },
    },
    {
        name: "deep: Should find no image",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "007", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["007"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
    {
        name: "deep: Should find image when term in path",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "005", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["deep"],
                        path: "./plugins/pics/test/fixtures",
                        mustMatchInFilename: false,
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/deep/image005.jpg"), "005 (thumbnail)"),
        },
    },
    {
        name: "deep: Should NOT find image when term not in basename and mustMatchInFilename",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "005", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["deep"],
                        path: "./plugins/pics/test/fixtures",
                        mustMatchInFilename: true,
                    },
                ] }) }),
        result: {},
    },
    {
        name: "deep: Should find hero",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "005", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "hero",
                        searchTerms: ["005"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            hero: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/deep/image005.jpg"), "005 (hero)"),
        },
    },
    {
        name: "deep: Should not find hero",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "007", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "hero",
                        searchTerms: ["007"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
];
exports.actorCreateImageFixtures = [
    {
        name: "Should find all extra when no max, does not return in result",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "extra",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
        createImageCallCount: 2,
    },
    {
        name: "Should find all extra when max negative, does not return in result",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "extra",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                        max: -1,
                    },
                ] }) }),
        result: {},
        createImageCallCount: 2,
    },
    {
        name: "Should find only 1 extra when given max, does not return in result",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "extra",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                        max: 1,
                    },
                ] }) }),
        result: {},
        createImageCallCount: 1,
    },
    {
        name: "Finds restricted extra, does not return in result",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "extra",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                        max: -1,
                        blacklistTerms: ["png"],
                    },
                ] }) }),
        result: {},
        createImageCallCount: 1,
    },
    {
        name: "Should find extra, allows empty searchTerms",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "001", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "extra",
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
        createImageCallCount: 2,
    },
    {
        name: "Should not find extra",
        runContext: Object.assign(Object.assign({}, mockContext), { actorName: "003", args: Object.assign(Object.assign({}, baseArgs), { actors: [
                    {
                        prop: "extra",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
        createImageCallCount: 0,
    },
];
exports.sceneFixtures = [
    {
        name: "Should find a thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { sceneName: "001", args: Object.assign(Object.assign({}, baseArgs), { scenes: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (thumbnail)"),
        },
    },
    {
        name: "Should find no image",
        runContext: Object.assign(Object.assign({}, mockContext), { sceneName: "003", args: Object.assign(Object.assign({}, baseArgs), { scenes: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
];
exports.movieFixtures = [
    {
        name: "Should find a thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { movieName: "001", args: Object.assign(Object.assign({}, baseArgs), { movies: [
                    {
                        prop: "backCover",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            backCover: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (backCover)"),
        },
    },
    {
        name: "Should find no image",
        runContext: Object.assign(Object.assign({}, mockContext), { movieName: "003", args: Object.assign(Object.assign({}, baseArgs), { movies: [
                    {
                        prop: "backCover",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
    {
        name: "Should find a frontCover 1",
        runContext: Object.assign(Object.assign({}, mockContext), { movieName: "001", args: Object.assign(Object.assign({}, baseArgs), { movies: [
                    {
                        prop: "frontCover",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            frontCover: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (frontCover)"),
        },
    },
    {
        name: "Should find no frontCover 2",
        runContext: Object.assign(Object.assign({}, mockContext), { movieName: "003", args: Object.assign(Object.assign({}, baseArgs), { movies: [
                    {
                        prop: "frontCover",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
    {
        name: "Should find a spineCover 1",
        runContext: Object.assign(Object.assign({}, mockContext), { movieName: "001", args: Object.assign(Object.assign({}, baseArgs), { movies: [
                    {
                        prop: "spineCover",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            spineCover: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (spineCover)"),
        },
    },
    {
        name: "Should find spineCover",
        runContext: Object.assign(Object.assign({}, mockContext), { movieName: "003", args: Object.assign(Object.assign({}, baseArgs), { movies: [
                    {
                        prop: "spineCover",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
];
exports.studioFixtures = [
    {
        name: "Should find a thumbnail",
        runContext: Object.assign(Object.assign({}, mockContext), { studioName: "001", args: Object.assign(Object.assign({}, baseArgs), { studios: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["001"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {
            thumbnail: mockContext.$createLocalImage(path_1.default.resolve("./plugins/pics/test/fixtures/image001.jpg"), "001 (thumbnail)"),
        },
    },
    {
        name: "Should find no image",
        runContext: Object.assign(Object.assign({}, mockContext), { studioName: "003", args: Object.assign(Object.assign({}, baseArgs), { studios: [
                    {
                        prop: "thumbnail",
                        searchTerms: ["003"],
                        path: "./plugins/pics/test/fixtures",
                    },
                ] }) }),
        result: {},
    },
];
