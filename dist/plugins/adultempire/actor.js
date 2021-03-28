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
function default_1(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const { args, $axios, $cheerio, $logger, $formatMessage, actorName, $createImage } = ctx;
        const name = actorName
            .replace(/#/g, "")
            .replace(/\s{2,}/g, " ")
            .trim();
        $logger.info(`Scraping actor info for '${name}', dry mode: ${(args === null || args === void 0 ? void 0 : args.dry) || false}...`);
        const url = `https://www.adultempire.com/allsearch/search?q=${name}`;
        const html = (yield $axios.get(url)).data;
        const $ = $cheerio.load(html);
        const firstResult = $(`a.boxcover[label="Performer"]`).toArray()[0];
        const href = $(firstResult).attr("href");
        if (href) {
            const actorUrl = "https://adultempire.com" + href;
            const html = (yield $axios.get(actorUrl)).data;
            const $ = $cheerio.load(html);
            let avatar;
            const firstImageResult = $(`a.fancy`).toArray()[0];
            const avatarUrl = $(firstImageResult).attr("href");
            if (avatarUrl) {
                avatar = yield $createImage(avatarUrl, `${actorName} (avatar)`);
            }
            let hero;
            const secondImageResult = $(`a.fancy`).toArray()[1];
            const heroUrl = $(secondImageResult).attr("href");
            if (heroUrl) {
                hero = yield $createImage(heroUrl, `${actorName} (hero image)`);
            }
            let description;
            const descEl = $("#content .row aside");
            if (descEl) {
                description = descEl.text().trim();
            }
            let aliases;
            const aliasEl = $("#content .row .col-sm-5 .m-b-1");
            if (aliasEl) {
                const text = aliasEl.text();
                aliases = text
                    .replace("Alias: ", "")
                    .split(",")
                    .map((s) => s.trim());
            }
            const result = { avatar, $ae_avatar: avatarUrl, hero, $ae_hero: heroUrl, aliases, description };
            if (args === null || args === void 0 ? void 0 : args.dry) {
                $logger.info(`Would have returned ${$formatMessage(result)}`);
                return {};
            }
            else {
                return result;
            }
        }
        return {};
    });
}
exports.default = default_1;
