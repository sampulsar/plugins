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
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = ({ args, $throw, $log, actorName, $createLocalImage, $fs, $path, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!actorName)
        $throw("Uh oh. You shouldn't use the plugin for this type of event");
    const exts = [".jpg", ".png", ".jpeg", ".gif"];
    function scanFolder(partial, prop) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!partial) {
                $log(`No ${prop} path defined`);
                return {};
            }
            const path = $path.resolve(partial);
            $log(`Trying to find ${prop} pictures of ${actorName} in ${path}`);
            const files = $fs.readdirSync(path);
            const hit = files.find((name) => name.toLowerCase().includes(actorName.toLowerCase()));
            if (hit && exts.some((ext) => hit.endsWith(ext))) {
                $log(`Found ${prop} picture for ${actorName}`);
                var image = yield $createLocalImage($path.join(path, hit), actorName, true);
                return {
                    [prop]: image,
                };
            }
            return {};
        });
    }
    return Object.assign(Object.assign(Object.assign(Object.assign({}, (yield scanFolder(args === null || args === void 0 ? void 0 : args.path_thumb, "thumbnail"))), (yield scanFolder(args === null || args === void 0 ? void 0 : args.path_alt, "altThumbnail"))), (yield scanFolder(args === null || args === void 0 ? void 0 : args.path_avatar, "avatar"))), (yield scanFolder(args === null || args === void 0 ? void 0 : args.path_hero, "hero")));
});
