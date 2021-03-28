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
function searchForMovie({ $cheerio, $axios }, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://www.adultempire.com/allsearch/search?q=${name}`;
        const html = (yield $axios.get(url)).data;
        const $ = $cheerio.load(html);
        const firstResult = $(".boxcover").toArray()[0];
        const href = $(firstResult).attr("href");
        if (!href) {
            return false;
        }
        return "https://adultempire.com" + href;
    });
}
function default_1(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const { args, $moment, $axios, $cheerio, $logger, $formatMessage, movieName, $createImage } = ctx;
        const name = movieName
            .replace(/[#&]/g, "")
            .replace(/\s{2,}/g, " ")
            .trim();
        $logger.info(`Scraping movie covers for '${name}', dry mode: ${(args === null || args === void 0 ? void 0 : args.dry) || false}...`);
        const url = movieName.startsWith("http") ? movieName : yield searchForMovie(ctx, name);
        if (url) {
            const movieUrl = url;
            const html = (yield $axios.get(movieUrl)).data;
            const $ = $cheerio.load(html);
            const desc = $(".m-b-0.text-dark.synopsis").text();
            let release = undefined;
            const movieName = $(`.title-rating-section .col-sm-6 h1`)
                .text()
                .replace(/[\t\n]+/g, " ")
                .replace(/ {2,}/, " ")
                .replace(/- On Sale!.*/i, "")
                .trim();
            $(".col-sm-4.m-b-2 li").each(function (i, elm) {
                const grabrvars = $(elm).text().split(":");
                if (grabrvars[0].includes("Released")) {
                    release = $moment(grabrvars[1].trim().replace(" ", "-"), "MMM-DD-YYYY").valueOf();
                }
            });
            const studioName = $(`.title-rating-section .item-info > a`).eq(0).text().trim();
            const frontCover = $("#front-cover img").toArray()[0];
            const frontCoverSrc = $(frontCover).attr("src") || "";
            const backCoverSrc = frontCoverSrc.replace("h.jpg", "bh.jpg");
            if ((args === null || args === void 0 ? void 0 : args.dry) === true) {
                $logger.info(`Would have returned ${$formatMessage({
                    name: movieName,
                    movieUrl,
                    frontCoverSrc,
                    backCoverSrc,
                    studioName,
                    desc,
                    release,
                })}`);
            }
            else {
                const frontCoverImg = yield $createImage(frontCoverSrc, `${movieName} (front cover)`);
                const backCoverImg = yield $createImage(backCoverSrc, `${movieName} (back cover)`);
                return {
                    name: movieName,
                    frontCover: frontCoverImg,
                    backCover: backCoverImg,
                    description: desc,
                    releaseDate: release,
                    studio: studioName,
                };
            }
        }
        return {};
    });
}
exports.default = default_1;
