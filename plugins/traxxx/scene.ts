import { SceneOutput } from "../../types/scene";
import { Api, SceneResult } from "./api";
import { MySceneContext, MyValidatedSceneContext } from "./types";
import { dateToTimestamp, timestampToString, slugify } from "./util";
import levenshtein from "./levenshtein";

export class SceneExtractor {
  ctx: MyValidatedSceneContext;
  scene?: SceneResult.Scene;
  api: Api;

  /**
   * @param ctx - plugin context
   * @param input - extractor input
   * @param input.scene - the matched channel
   */
  constructor(
    ctx: MyValidatedSceneContext,
    {
      traxxScene,
    }: {
      traxxScene?: SceneResult.Scene;
    }
  ) {
    this.ctx = ctx;
    this.api = new Api(ctx);
    this.scene = traxxScene;
  }

  getName(): Partial<{ name: string }> {
    const name = this.scene?.title;
    if (!name) {
      return {};
    }

    return { name };
  }

  getDescription(): Partial<{ description: string }> {
    const description = this.scene?.description;
    if (!description) {
      return {};
    }

    return { description };
  }

  getReleaseDate(): Partial<{ releaseDate: number }> {
    if (!this.scene?.date) {
      return {};
    }

    const releaseDate = new Date(this.scene?.date).getTime();

    return { releaseDate };
  }

  getStudio(): Partial<{ studio: string }> {
    const studio = this.scene?.entity?.name;
    if (!studio) {
      return {};
    }

    return { studio };
  }

  getActors(): Partial<{ actors: string[] }> {
    const actorsArray = this.scene?.actors;

    if (!actorsArray) {
      return {};
    }

    const actors = actorsArray
      .map((actor) => {
        if (actor.gender !== "female") {
          return "";
        }

        return actor.name;
      })
      .filter((actorName) => {
        return actorName !== "";
      });

    return { actors };
  }

  async getThumbnail(): Promise<Partial<{ thumbnail: string }>> {
    const poster = this.scene?.poster.path;
    if (!poster) {
      return {};
    }

    let thumbnail = "";
    const name = this.getName().name as string;
    const mediaLocation = this.ctx.args?.server?.mediaLocation;
    if (mediaLocation) {
      thumbnail = this.ctx.args.dry
        ? `_would_have_created_${poster}`
        : await this.ctx.$createLocalImage(mediaLocation + poster, name, true);
    } else {
      thumbnail = this.ctx.args.dry
        ? `_would_have_created_${poster}`
        : await this.ctx.$createImage(poster, name, true);
    }

    return {
      thumbnail,
    };
  }

  getCustom(): Partial<SceneResult.Scene> {
    const scene = this.scene;
    return {
      ...scene,
    };
  }
}

export default async (initialContext: MySceneContext): Promise<SceneOutput> => {
  const { $logger, $formatMessage, scenePath, sceneName, scene, data } = initialContext;

  // Scene Output from other plugins
  const passThroughSceneInfo = data as SceneOutput;
  const notFoundResult: SceneOutput = {};

  // Can assert all properties exist, since we just validated them above
  const ctx = initialContext as MyValidatedSceneContext;
  const args = ctx.args;

  const api = new Api(ctx);

  if (args.scenes?.missingLabel) {
    notFoundResult.labels = [];
    notFoundResult.labels.push(args.scenes.missingLabel);
  }

  ctx.$logger.info(`Trying to match "${sceneName}"`);

  const queries = [] as string[];

  // Studio from other plugins will be a usable text value
  if (passThroughSceneInfo.studio) {
    const slugifiedStudio = slugify(passThroughSceneInfo.studio);
    const { channel } = await api.getAllEntities(slugifiedStudio);

    if (channel?.name) {
      queries.push(channel.name);
      notFoundResult.studio = channel.name;
    } else {
      queries.push(slugifiedStudio);
    }
  }

  // Use the scene name from other plugins as it may be clean and formated
  if (passThroughSceneInfo.name) scene.name = passThroughSceneInfo.name;
  queries.push(scene.name);

  // Check that we actually have something to search with.
  // (Purposefully ignore the date, since that cannot reliable identify a scene)
  if (!queries.flat().filter(Boolean).join("")) {
    $logger.warn("Did not have any parameters to do primary search");
    return {};
  }

  // User releaseDate from other plugins
  if (passThroughSceneInfo?.releaseDate) scene.releaseDate = passThroughSceneInfo.releaseDate;

  if (!scene.releaseDate || Number.isNaN(scene.releaseDate)) {
    scene.releaseDate = dateToTimestamp(ctx, scenePath);
  }

  if (scene.releaseDate && !Number.isNaN(scene.releaseDate)) {
    queries.push(timestampToString(scene.releaseDate));
  }

  const initialQuery = queries.flat().filter(Boolean).join(" ");

  $logger.info(initialQuery);
  const scenes = (await api.getScenes(initialQuery)).data.scenes;

  if (!scenes || scenes.length === 0) {
    $logger.info(`Could not find scene "${sceneName}" in TRAXXX`);
    return notFoundResult;
  }

  let sceneHighScore = 5000;
  let sceneId;
  $logger.info(`Found ${scenes.length} scenes "${initialQuery}" in TRAXXX`);
  scenes.forEach((result) => {
    let match = true;
    // The studio needs to match what is passed.
    if (scene.studio && args.scenes.matchStudio) {
      match = slugify(result?.entity?.name) === slugify(scene.studio);
      $logger.info(`Match Studio "${result?.entity?.name}" with "${scene.studio}"`);
    }

    if (match && args.scenes.matchActors && passThroughSceneInfo?.actors) {
      // eslint-disable-next-line dot-notation
      const actorsArray = passThroughSceneInfo.actors;

      const resultActors = result.actors.map((actor) => {
        return actor.name;
      });

      $logger.info(
        `Testing "${$formatMessage(actorsArray)}" with "${$formatMessage(resultActors)}"`
      );
      actorsArray?.forEach((actorName) => {
        if (!resultActors.includes(actorName)) {
          match = false;
        }
      });
    }
    $logger.info(`Match "${match}"`);
    if (match) {
      const resultDate = result?.date.split("T")[0];
      const date = timestampToString(scene.releaseDate);
      $logger.debug(`Testing "${date}" with "${resultDate}"`);

      // Test the title
      const resultName = slugify(result.title, "", { removePunctuation: true });
      const name = slugify(scene.name, "", { removePunctuation: true });

      const found = levenshtein(name, resultName) as number;
      $logger.debug(`Testing "${name}" with "${resultName}" ${found}`);

      if (found < sceneHighScore) {
        sceneHighScore = found;
        sceneId = result.id;
      }

      // Test the just contains the actors name
      const actors = result?.actors
        ?.map((actor) => {
          if (actor.gender !== "female") return "";
          return actor.name;
        })
        .filter(Boolean)
        .join(" ");

      if (date === resultDate && name === slugify(actors, "", { removePunctuation: true })) {
        sceneHighScore = 0;
        sceneId = result.id;
      }

      const resultNameWithActors = slugify(`${actors} ${result?.title}`, "", {
        removePunctuation: true,
      });

      const found2 = levenshtein(name, resultNameWithActors) as number;

      if (found2 < sceneHighScore) {
        $logger.debug(`Testing "${name}" with "${resultNameWithActors}" ${found2}`);
        sceneHighScore = found2;
        sceneId = result.id;
      }

      // Test title contains actors and names
      const nameWithActors = slugify(`${actors} ${scene.name}`, "", { removePunctuation: true });

      const found3 = levenshtein(nameWithActors, resultName) as number;

      if (found3 < sceneHighScore) {
        $logger.debug(`Testing "${nameWithActors}" with "${resultName}" ${found3}`);
        sceneHighScore = found3;
        sceneId = result.id;
      }
    }
  });
  const maxLevenshteinDistance = args.scenes?.maxLevenshteinDistance || 10;
  if (!sceneId || sceneHighScore > maxLevenshteinDistance) return notFoundResult;

  $logger.info(`traxxScene: ${$formatMessage(sceneId)}`);

  const traxxScene = (await api.getScene(sceneId)).data.scene;

  $logger.debug(`traxxScene: ${$formatMessage(traxxScene)}`);

  const sceneExtractor = new SceneExtractor(ctx, {
    traxxScene,
  });

  const result: SceneOutput = {
    ...sceneExtractor.getName(),
    ...sceneExtractor.getDescription(),
    ...sceneExtractor.getReleaseDate(),
    ...sceneExtractor.getStudio(),
    ...sceneExtractor.getActors(),
    ...(await sceneExtractor.getThumbnail()),
    custom: sceneExtractor.getCustom(),
  };

  result.labels = [];

  if (args.dry) {
    $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(result)}`);
    return {};
  }

  return result;
};