import { SceneOutput } from "../../types/scene";
import { Api } from "./api";
import { parseSceneActor, parseSceneStudio, parseSceneTimestamp } from "./parse";
import { MyContext, SceneResult } from "./types";
import {
  checkSceneExistsInDb,
  createQuestionPrompter,
  dateToTimestamp,
  isPositiveAnswer,
  manualTouchChoices,
  matchSceneResultToSearch,
  normalizeSceneResultData,
  timestampToString,
} from "./util";

module.exports = async (ctx: MyContext): Promise<SceneOutput> => {
  const {
    event,
    scenePath,
    sceneName,
    $throw,
    $logger,
    $formatMessage,
    testMode,
    args,
    $inquirer,
    $createImage,
  } = ctx;

  /**
   * If makeChoices() was already run (for test mode only)
   */
  let didRunMakeChoices = false;

  // Making sure that the event that triggered is the correct event
  if (event !== "sceneCreated" && event !== "sceneCustom") {
    $throw("Plugin used for unsupported event");
  }

  // Checking all of the arguments are set in the plugin

  if (!Object.hasOwnProperty.call(args, "useTitleInSearch")) {
    $logger.warn("Missing useTitleInSearch in plugin args!");
  }

  if (!Object.hasOwnProperty.call(args, "alwaysUseSingleResult")) {
    $logger.warn("Missing alwaysUseSingleResult in plugin args!");
  }

  if (!Object.hasOwnProperty.call(args, "source_settings")) {
    $throw("Missing source_settings in plugin args");
  }

  if (!Object.hasOwnProperty.call(args, "parseActor")) {
    $throw("Missing parseActor in plugin args");
  }

  if (!Object.hasOwnProperty.call(args, "parseStudio")) {
    $throw("Missing parseStudio in plugin args");
  }

  if (!Object.hasOwnProperty.call(args, "parseDate")) {
    $throw("Missing parseStudio in plugin args");
  }

  if (!Object.hasOwnProperty.call(args, "manualTouch")) {
    $throw("Missing manualTouch in plugin args");
  }

  if (!Object.hasOwnProperty.call(args, "sceneDuplicationCheck")) {
    $throw("Missing sceneDuplicationCheck in plugin args");
  }

  const tpdbApi = new Api(ctx);

  $logger.info(`STARTING to analyze scene: ${JSON.stringify(scenePath)}`);

  const parsedDbActor = parseSceneActor(ctx);
  const parsedDbStudio = parseSceneStudio(ctx);
  const parsedTimestamp = parseSceneTimestamp(ctx);

  // After everything has completed parsing, I run a function that will perform all of the lookups against TPDB

  let searchTitle: string | undefined = sceneName;
  let searchActors = parsedDbActor ? [parsedDbActor] : [];
  let searchStudio = parsedDbStudio ?? undefined;
  let searchTimestamp: number | undefined = parsedTimestamp ?? undefined;
  let userMovie: string | undefined;
  let extra: string | undefined;

  const gotResultOrExit = false;
  do {
    const searchResult = await doASearch({
      title: searchTitle,
      actors: searchActors,
      studio: searchStudio,
      timestamp: searchTimestamp,
      extra,
    });
    if (searchResult) {
      if (!searchResult.movie && userMovie) {
        searchResult.movie = userMovie;
      }

      const confirmedData = await confirmFinalEntry(searchResult);
      if (confirmedData) {
        return confirmedData;
      }
    }

    const action = await makeChoices();
    if (!action || action === manualTouchChoices.NOTHING) {
      // Search already "failed" & user wants to do nothing => exit with no data
      return {};
    } else if (action === manualTouchChoices.MANUAL_ENTER) {
      const manualData = await manualImport();
      const confirmedData = await confirmFinalEntry(manualData);
      if (confirmedData) {
        return confirmedData;
      }
    } else if (action === manualTouchChoices.SEARCH) {
      const userSearchChoices = await getNextSearchChoices();
      searchTitle = userSearchChoices.title;
      searchActors = userSearchChoices.actors || [];
      searchStudio = userSearchChoices.studio;
      searchTimestamp = userSearchChoices.timestamp;
      userMovie = userSearchChoices.movie;
      extra = userSearchChoices.extra;
    }
  } while (!gotResultOrExit);

  return {};

  // -------------------------------------------------------------

  // -------------------Functions & Async functions---------------

  // -------------------------------------------------------------

  /**
   * Logs all the properties of the object
   *
   * @param results - the result object
   */
  function logResultObject(results: SceneOutput): void {
    $logger.info("====  Final Entry =====");

    const logObj = {
      ...results,
    };

    if (logObj.releaseDate) {
      (logObj.releaseDate as any) = timestampToString(logObj.releaseDate ?? 0);
    }

    $logger.info(JSON.stringify(logObj, null, 2));
  }

  /**
   * Logs the data and asks the user to confirm that it should be imported
   *
   * @param sceneData - the final data to confirm and apply
   * @returns the final data to import or null if should not
   */
  async function confirmFinalEntry(sceneData: SceneOutput): Promise<SceneOutput | null> {
    logResultObject(sceneData);

    if (!args?.manualTouch) {
      if (sceneData.thumbnail) {
        try {
          sceneData.thumbnail = await $createImage(sceneData.thumbnail, sceneData.name || "", true);
        } catch (err) {
          $logger.error(`Could not download scene thumbnail ${$formatMessage(err)}`);
          delete sceneData.thumbnail;
        }
      }
      return sceneData;
    }

    const questionAsync = createQuestionPrompter($inquirer, testMode?.status, $logger);
    const { correctImportInfo: resultsConfirmation } = await questionAsync<{
      correctImportInfo: string;
    }>({
      type: "input",
      name: "correctImportInfo",
      message: "Is this the correct scene details to import? (y/N)",
      testAnswer: testMode ? testMode.correctImportInfo : "",
    });

    if (isPositiveAnswer(resultsConfirmation)) {
      if (sceneData.thumbnail) {
        try {
          sceneData.thumbnail = await $createImage(sceneData.thumbnail, sceneData.name || "", true);
        } catch (err) {
          $logger.error(`Could not download scene thumbnail ${$formatMessage(err)}`);
          delete sceneData.thumbnail;
        }
      }

      return sceneData;
    }

    return null;
  }

  /**
   * Standard block of manual questions that prompt the user for input
   * @returns either an array of all questions that need to be import manually
   */
  async function manualImport(): Promise<SceneOutput> {
    const questionAsync = createQuestionPrompter($inquirer, testMode?.status, $logger);

    const result: SceneOutput = {};

    const { isMovie: manualMovieAnswer } = await questionAsync<{ isMovie: string }>({
      type: "input",
      name: "isMovie",
      message: "Is this a Scene from a Movie / Set / Collection?: (y/N) ",
      testAnswer: testMode?.questionAnswers?.enterMovie ?? "",
    });

    const manualEnterMovieSearch = isPositiveAnswer(manualMovieAnswer);

    if (manualEnterMovieSearch) {
      const { titleOfMovie: manualMovieName } = await questionAsync<{ titleOfMovie: string }>({
        type: "input",
        name: "titleOfMovie",
        message: "What is the Title of the Movie?: ",
        testAnswer: testMode?.questionAnswers?.movieTitle ?? "",
      });

      if (manualMovieName) {
        result.movie = manualMovieName;
      }
    }

    const { titleOfScene: manualEnterTitleScene } = await questionAsync<{ titleOfScene: string }>({
      type: "input",
      name: "titleOfScene",
      message: "What is the TITLE of the scene?: ",
      testAnswer: testMode?.questionAnswers?.enterSceneTitle ?? "",
    });

    result.name = manualEnterTitleScene;

    const { releaseDateOfScene: manualEnterReleaseDateScene } = await questionAsync<{
      releaseDateOfScene: string;
    }>({
      type: "input",
      name: "releaseDateOfScene",
      message: "What is the RELEASE DATE of the scene (YYYY.MM.DD / DD.MM.YYYY / YY.MM.DD)?: ",
      testAnswer: testMode?.questionAnswers?.enterSceneDate ?? "",
    });

    if (manualEnterReleaseDateScene) {
      const parsedDate = dateToTimestamp(ctx, manualEnterReleaseDateScene);
      if (parsedDate) {
        result.releaseDate = parsedDate;
      }
    }

    const { descriptionOfScene: manualEnterDescriptionOfScene } = await questionAsync<{
      descriptionOfScene: string;
    }>({
      type: "input",
      name: "descriptionOfScene",
      message: "What is the DESCRIPTION for the scene?: ",
      testAnswer: testMode?.questionAnswers?.manualDescription ?? "",
    });

    result.description = manualEnterDescriptionOfScene;

    const { actorsOfScene: splitActors } = await questionAsync<{ actorsOfScene: string }>({
      type: "input",
      name: "actorsOfScene",
      message: `What are the Actors NAMES in the scene?: (separated by Comma)`,
      testAnswer: testMode?.questionAnswers?.manualActors ?? "",
      default() {
        return searchActors ? ` ${searchActors.join(",")}` : "";
      },
    });

    if (splitActors && splitActors.trim()) {
      result.actors = splitActors.trim().split(",");
    }

    const { studioOfScene: askedStudio } = await questionAsync<{ studioOfScene: string }>({
      type: "input",
      name: "studioOfScene",
      message: `What Studio NAME is responsible for the scene?:`,
      testAnswer: testMode?.questionAnswers?.enterStudioName ?? "",
      default() {
        return searchStudio ? ` ${searchStudio}` : "";
      },
    });

    if (askedStudio && askedStudio.trim()) {
      result.studio = askedStudio;
    }

    return result;
  }

  async function getNextSearchChoices(): Promise<
    Partial<{
      title: string;
      actors: string[];
      studio: string;
      timestamp: number;
      movie: string;
      extra: string;
    }>
  > {
    let userTitle: string | undefined;
    let userTimestamp: number | undefined;
    let userMovie: string | undefined;
    let userActors: string[] = [];

    const questionAsync = createQuestionPrompter($inquirer, testMode?.status, $logger);

    const { movieSearch: movieAnswer } = await questionAsync<{ movieSearch: string }>({
      type: "input",
      name: "movieSearch",
      message: "Is this a Scene from a Movie / Set / Collection?: (y/N) ",
      testAnswer: testMode?.questionAnswers?.enterMovie ?? "",
    });
    const enterMovieSearch = isPositiveAnswer(movieAnswer);

    if (enterMovieSearch) {
      const { manualMovieTitleSearch: movieName } = await questionAsync<{
        manualMovieTitleSearch: string;
      }>({
        type: "input",
        name: "manualMovieTitleSearch",
        message: "What is the Title of the Movie?: ",
        testAnswer: testMode?.questionAnswers?.movieTitle ?? "",
      });

      if (movieName) {
        userMovie = movieName;
      }
    }

    if (args.useTitleInSearch) {
      const { titleOfScene: manualEnterTitleScene } = await questionAsync<{ titleOfScene: string }>(
        {
          type: "input",
          name: "titleOfScene",
          message: "What is the TITLE of the scene?: ",
          testAnswer: testMode?.questionAnswers?.enterSceneTitle ?? "",
        }
      );
      if (manualEnterTitleScene && manualEnterTitleScene.trim()) {
        userTitle = manualEnterTitleScene.trim();
      }
    }

    const { manualActorSearch: Q2Actor } = await questionAsync<{ manualActorSearch: string }>({
      type: "input",
      name: "manualActorSearch",
      message: `What is ONE of the Actors NAME in the scene?:`,
      testAnswer: testMode?.questionAnswers?.enterOneActorName ?? "",
      default() {
        return searchActors ? ` ${searchActors.join(",")}` : "";
      },
    });

    if (Q2Actor && Q2Actor.trim()) {
      if (Q2Actor.includes(",")) {
        userActors = Q2Actor.split(",").map((str) => str.trim());
      } else {
        userActors = [Q2Actor.trim()];
      }
    }

    const { manualStudioSearch: Q3Studio } = await questionAsync<{
      manualStudioSearch: string;
    }>({
      type: "input",
      name: "manualStudioSearch",
      message: `What Studio NAME is responsible for the scene?:`,
      testAnswer: testMode?.questionAnswers?.enterStudioName ?? "",
      default() {
        return searchStudio ? ` ${searchStudio}` : "";
      },
    });

    const { extra } = await questionAsync<{
      extra: string;
    }>({
      type: "input",
      name: "extra",
      message: `What else should be in the search?:`,
      testAnswer: testMode?.questionAnswers?.extra ?? "",
    });

    const { manualDateSearch: Q4date } = await questionAsync<{ manualDateSearch: string }>({
      type: "input",
      name: "manualDateSearch",
      message: "What is the release date (YYYY.MM.DD / DD.MM.YYYY / YY.MM.DD)?: (Blanks allowed) ",
      testAnswer: testMode?.questionAnswers?.enterSceneDate ?? "",
      default() {
        if (!searchTimestamp) {
          return "";
        }
        const dottedTimestamp = timestampToString(searchTimestamp).replace("-", ".");
        if (dottedTimestamp && !isNaN(+dottedTimestamp)) {
          return ` ${dottedTimestamp}`;
        }
        return "";
      },
    });

    if (Q4date) {
      const parsedDate = dateToTimestamp(ctx, Q4date);
      if (parsedDate) {
        userTimestamp = parsedDate;
      }
    }

    return {
      title: userTitle,
      actors: userActors,
      studio: Q3Studio,
      timestamp: userTimestamp,
      movie: userMovie,
      extra,
    };
  }

  /**
   * Provides 3 choices to be completed:
   * 1. search again => Completes a manual Search of The Porn Database
   * 2. manual info => plugin returns "manualImport"
   * 3. Do nothing => plugin does not return any results (empty object)
   * @returns
   */
  async function makeChoices(): Promise<string> {
    if (!args?.manualTouch) {
      $logger.verbose(`"manualTouch" disabled, will continue plugin with current queries`);
      return manualTouchChoices.NOTHING;
    }

    // If testmode is running, we do not want to run makeChoices() more than once,
    // or the test will have an infinite loop
    if (didRunMakeChoices && testMode) {
      return manualTouchChoices.NOTHING;
    }

    try {
      const questionAsync = createQuestionPrompter($inquirer, testMode?.status, $logger);

      $logger.info(`"manualTouch" is enabled, prompting user for action`);
      const { choices: Q1Answer } = await questionAsync<{ choices: string }>({
        type: "rawlist",
        name: "choices",
        message: "Would you like to:",
        testAnswer: testMode?.questionAnswers?.enterInfoSearch ?? "",
        choices: Object.values(manualTouchChoices),
      });

      didRunMakeChoices = true;

      if (!Object.values(manualTouchChoices).includes(Q1Answer)) {
        $throw("User did not select a choice, will consider exit");
        return manualTouchChoices.NOTHING;
      }

      return Q1Answer;
    } catch (error) {
      $logger.error(`Something went wrong asking for search questions ${$formatMessage(error)}`);
    }

    return manualTouchChoices.NOTHING;
  }

  /**
   * The (Backbone) main Search function for the plugin
   *
   * @param searchActors - The URL API that has the sites hosted on TPD
   * @param searchStudio - The URL API that has the sites hosted on TPD
   * @param searchFuncTimestamp - The URL API that has the sites hosted on TPD
   * @returns return the proper scene information (either through manual questions or automatically)
   * or null if there were no results, too many results
   */
  async function doASearch({
    title,
    actors,
    studio,
    timestamp,
  }: Partial<{
    title: string;
    actors: string[];
    studio: string;
    timestamp: number;
    extra: string;
  }>): Promise<SceneOutput | null> {
    async function mergeSearchResult(rawScene: SceneResult.SceneData): Promise<SceneOutput> {
      checkSceneExistsInDb(ctx, rawScene.title);

      const sceneData = normalizeSceneResultData(rawScene);

      if (
        (!sceneData.actors || !sceneData.actors.length) &&
        Array.isArray(actors) &&
        actors.length
      ) {
        sceneData.actors = actors;
      }
      if (studio) {
        // Always apply existing studio
        sceneData.studio = studio;
      }

      return sceneData;
    }

    const queries = [actors, studio, extra];

    if (args.useTitleInSearch) {
      queries.unshift(title);
    }

    // Check that we actually have something to search with.
    // (Purposefully ignore the date, since that cannot reliable identify a scene)
    if (!queries.flat().filter(Boolean).join("")) {
      $logger.warn("Did not have any parameters to do primary search");
      return null;
    }
    if (timestamp && !Number.isNaN(timestamp)) {
      queries.push(timestampToString(timestamp));
    }
    const initialQuery = queries.flat().filter(Boolean).join(" ");

    if (!initialQuery) {
      $logger.warn("Did not have any parameters to do primary search");
      return null;
    }

    let sceneList: SceneResult.SceneData[] = [];

    try {
      $logger.verbose(`Running TPDB Primary Search on: ${JSON.stringify(initialQuery)}`);
      const apiRes = await tpdbApi.parseScene(initialQuery);
      if (!apiRes?.data || testMode?.testSiteUnavailable) {
        $throw("TPDB API: received no data");
        return null; // for type compatibility
      }
      sceneList = Array.isArray(apiRes.data.data) ? apiRes.data.data : [apiRes.data.data];
    } catch (err) {
      $logger.error(`TPDB API query failed ${$formatMessage(err)}`);
      if (testMode?.status && !testMode?.testSiteUnavailable) {
        $logger.warn("!! This will impact the test if it was not expecting a failure !!");
      }

      return null;
    }

    if (!sceneList.length) {
      $logger.error("Did not find any results from TPDB");
      return null;
    }

    const matchedScene = matchSceneResultToSearch(ctx, sceneList, searchActors, searchStudio);

    if (matchedScene) {
      return mergeSearchResult(matchedScene);
    } else if (args.alwaysUseSingleResult && sceneList.length === 1) {
      $logger.verbose(
        `Did not match results to scene, but only 1 result was found and "alwaysUseSingleResult" is enabled. Returning it`
      );
      return mergeSearchResult(sceneList[0]);
    }

    $logger.error("Did not match any of the titles from TPDB");
    $logger.info("Scene is possibly one of multiple search results");

    if (!args.manualTouch) {
      $logger.info("ManualTouch is disabled, cannot automatically choose from multiple results");
      return null;
    }

    // Run through the list of titles and ask if they would like to choose one.
    $logger.info("#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#");

    const answersList: string[] = [];
    const possibleTitles: string[] = [];

    for (const scene of sceneList) {
      answersList.push(scene.title);
      possibleTitles.push(scene.title);
    }

    const questionAsync = createQuestionPrompter($inquirer, testMode?.status, $logger);
    answersList.push((new $inquirer.Separator() as any) as string);
    answersList.push("== None of the above == ");

    const { searchedTitles: multipleSitesAnswer } = await questionAsync<{
      searchedTitles: string;
    }>({
      type: "rawlist",
      name: "searchedTitles",
      message: "Which Title would you like to use?",
      testAnswer: testMode?.questionAnswers?.multipleChoice ?? "",
      choices: answersList,
    });

    const findResultIndex = possibleTitles.indexOf(multipleSitesAnswer.trim());
    const userSelectedScene: SceneResult.SceneData | undefined = sceneList[findResultIndex];

    if (!userSelectedScene) {
      $logger.info("User did not select a scene, exiting scene selection");
      return null;
    }

    return mergeSearchResult(userSelectedScene);
  }
};
