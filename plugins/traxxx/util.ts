import {
  DeepPartial,
  MyStudioArgs,
  MyStudioContext,
  MyValidatedStudioContext,
  MyValidatedSceneContext,
  StudioSettings,
} from "./types";

export const hasProp = (target: unknown, prop: string): boolean => {
  return !!target && typeof target === "object" && Object.hasOwnProperty.call(target, prop);
};

const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  channelPriority: true,
  uniqueNames: true,
  channelSuffix: "",
  networkSuffix: " (Network)",
  whitelist: [],
  blacklist: [],
  whitelistOverride: [],
  blacklistOverride: [],
  mergeAliases: true,
};

/**
 * @param ctx - plugin context
 * @returns the context with defaults args when missing, or throws
 */
export const validateArgs = ({
  args,
  $throw,
  $logger,
  studioName,
}: MyStudioContext): MyStudioArgs | void => {
  let validatedArgs: DeepPartial<MyStudioArgs> | undefined;
  if (args && typeof args === "object") {
    // Copy object
    validatedArgs = { ...args };
  }

  if (!studioName || typeof studioName !== "string") {
    return $throw(`Missing "studioName", cannot run plugin`);
  }

  if (!validatedArgs || typeof validatedArgs !== "object") {
    return $throw(`Missing args, cannot run plugin`);
  }

  if (!validatedArgs.studios || typeof validatedArgs.studios !== "object") {
    $logger.verbose(
      `Missing "args.studios.channelPriority, setting to default: `,
      DEFAULT_STUDIO_SETTINGS
    );
    validatedArgs.studios = DEFAULT_STUDIO_SETTINGS;
  } else {
    // Copy object
    validatedArgs.studios = { ...validatedArgs.studios };
  }

  const studios = validatedArgs.studios;

  [
    { prop: "channelPriority", type: "boolean" },
    { prop: "uniqueNames", type: "boolean" },
    { prop: "channelSuffix", type: "string" },
    { prop: "networkSuffix", type: "string" },
    { prop: "mergeAliases", type: "boolean" },
  ].forEach((propCheck) => {
    if (!hasProp(studios, propCheck.prop)) {
      $logger.verbose(
        `Missing "args.studios.${propCheck.prop}", setting to default: "${
          DEFAULT_STUDIO_SETTINGS[propCheck.prop]
        }"`
      );
      studios[propCheck.prop] = DEFAULT_STUDIO_SETTINGS[propCheck.prop];
    } else if (typeof studios[propCheck.prop] !== propCheck.type) {
      return $throw(
        `"args.studios.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`
      );
    }
  });

  // One suffix can be an empty string, but both cannot be at the same time.
  // They cannot have the same value in general, otherwise it would not fix the conflict
  if (validatedArgs.studios.channelSuffix === validatedArgs.studios.networkSuffix) {
    return $throw(
      `"args.studios.channelSuffix" and "args.studios.networkSuffix" are identical, cannot run plugin`
    );
  }

  ["whitelist", "blacklist", "whitelistOverride", "blacklistOverride"].forEach((arrayProp) => {
    const arr = studios[arrayProp];
    if (!hasProp(studios, arrayProp)) {
      $logger.verbose(
        `Missing "args.studios.${arrayProp}", setting to default: "${DEFAULT_STUDIO_SETTINGS[arrayProp]}"`
      );
      studios[arrayProp] = DEFAULT_STUDIO_SETTINGS[arrayProp];
    } else if (!Array.isArray(arr) || !arr.every((prop) => typeof prop === "string")) {
      return $throw(
        `"args.studios.${arrayProp}" does not only contain strings, cannot run plugin"`
      );
    }
  });

  // At the end of this function, validatedArgs will have type MyStudioArgs
  // since we merged defaults
  return validatedArgs as MyStudioArgs;
};

function lowercase(str: string): string {
  return str.toLowerCase();
}

/**
 * @param ctx - plugin context
 * @param name - the studio name from pv
 * @returns the studio name, without our plugin suffixes
 */
export const normalizeStudioName = (ctx: MyValidatedStudioContext, name: string): string => {
  return name
    .replace(ctx.args.studios.channelSuffix, "")
    .replace(ctx.args.studios.networkSuffix, "");
};

/**
 * What type of entity should be returned. Either channel, network, or default:
 * according to user preference (when conflict), or whatever is found (no conflict).
 */
export type EntityPreference = "none" | "channel" | "network";

/**
 * @param ctx - plugin context
 * @param name - the input studio name
 * @returns how to treat the studio: channel, network, or none (according to user args)
 */
export const getEntityPreferenceFromName = (
  ctx: MyValidatedStudioContext,
  name: string
): EntityPreference => {
  let entityPreference: EntityPreference = "none";
  if (ctx.args.studios.channelSuffix && name.endsWith(ctx.args.studios.channelSuffix)) {
    entityPreference = "channel";
  } else if (ctx.args.studios.networkSuffix && name.endsWith(ctx.args.studios.networkSuffix)) {
    entityPreference = "network";
  }
  return entityPreference;
};

/**
 * @param str - the string to strip
 * @returns the string without diacritics
 */
export const stripAccents = (str: string): string =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * @param str - the studio name
 * @returns the slugified version of the name for traxxx
 */

export const isBlacklisted = (ctx: MyValidatedStudioContext, prop: string): boolean => {
  if (ctx.args.studios.whitelist.length) {
    return !ctx.args.studios.whitelist.includes(lowercase(prop));
  }
  return ctx.args.studios.blacklist.includes(lowercase(prop));
};

/**
 * @param ctx - plugin context
 * @param prop - the property to check
 * @returns if the property exists in the data, and has a "real" value
 */
export const propExistsInData = ({ data }: MyValidatedStudioContext, prop: string): boolean => {
  if (!hasProp(data, prop)) {
    return false;
  }
  if (
    data[prop] === undefined ||
    data[prop] === null ||
    (typeof data[prop] === "string" && data[prop].trim() === "") ||
    (Array.isArray(data[prop]) && data[prop].length === 0)
  ) {
    return false;
  }

  return true;
};

/**
 * Checks if the property was already returned by a previous plugin
 *
 * @param ctx - plugin context
 * @param prop - the property to check
 * @returns if the property should not be returned because it already exists in data, and
 * it is override blacklisted
 */
export const isOverrideBlacklisted = (ctx: MyValidatedStudioContext, prop: string): boolean => {
  if (!propExistsInData(ctx, prop)) {
    return false;
  }

  if (ctx.args.studios.whitelistOverride.length) {
    return !ctx.args.studios.whitelistOverride.includes(lowercase(prop));
  }
  return ctx.args.studios.blacklistOverride.includes(lowercase(prop));
};

/**
 * @param ctx - plugin context
 * @param prop - the property to check
 * @returns if the property should not be returned from the plugin
 */
export const suppressProp = (ctx: MyValidatedStudioContext, prop: string): boolean => {
  return isBlacklisted(ctx, prop) || isOverrideBlacklisted(ctx, prop);
};

/**
 * @param timestamp - Timestamp to be converted to date
 * @returns a human friendly date string in YYYY-MM-DD
 */
export function timestampToString(timestamp: number | null) {
  if (timestamp === null) return "";

  const dateNotFormatted = new Date(timestamp);

  let formattedString = `${dateNotFormatted.getFullYear()}-`;

  if (dateNotFormatted.getMonth() < 9) {
    formattedString += "0";
  }

  formattedString += dateNotFormatted.getMonth() + 1;

  formattedString += "-";

  if (dateNotFormatted.getDate() < 10) {
    formattedString += "0";
  }
  formattedString += dateNotFormatted.getDate();

  return formattedString;
}

export const dateToTimestamp = (ctx: MyValidatedSceneContext, dateStr: string): number | null => {
  const ddmmyyyy = dateStr.match(/\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d\d\d/);
  const yyyymmdd = dateStr.match(/\d\d\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d/);
  const yymmdd = dateStr.match(/\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d/);

  ctx.$logger.verbose(`Converting date ${JSON.stringify(dateStr)} to timestamp`);

  if (yyyymmdd && yyyymmdd.length) {
    const date = yyyymmdd[0].replace(" ", ".");

    ctx.$logger.verbose("\tSUCCESS: Found => yyyymmdd");

    return ctx.$moment(date, "YYYY-MM-DD").valueOf();
  }
  if (ddmmyyyy && ddmmyyyy.length) {
    const date = ddmmyyyy[0].replace(" ", ".");

    ctx.$logger.verbose("\tSUCCESS: Found => ddmmyyyy");

    return ctx.$moment(date, "DD-MM-YYYY").valueOf();
  }
  if (yymmdd && yymmdd.length) {
    const date = yymmdd[0].replace(" ", ".");

    ctx.$logger.verbose("\tSUCCESS: Found => yymmdd");

    return ctx.$moment(date, "YY-MM-DD").valueOf();
  }

  ctx.$logger.verbose("\tFAILED: Could not find a date");
  return null;
};

const substitutes = {
  à: "a",
  á: "a",
  ä: "a",
  å: "a",
  ã: "a",
  æ: "ae",
  ç: "c",
  è: "e",
  é: "e",
  ë: "e",
  ẽ: "e",
  ì: "i",
  í: "i",
  ï: "i",
  ĩ: "i",
  ǹ: "n",
  ń: "n",
  ñ: "n",
  ò: "o",
  ó: "o",
  ö: "o",
  õ: "o",
  ø: "o",
  œ: "oe",
  ß: "ss",
  ù: "u",
  ú: "u",
  ü: "u",
  ũ: "u",
  ỳ: "y",
  ý: "y",
  ÿ: "y",
  ỹ: "y",
};

export function slugify(
  string: string,
  delimiter = "",
  { encode = false, removeAccents = true, removePunctuation = false, limit = 1000 } = {}
): string {
  if (!string || typeof string !== "string") {
    return string;
  }

  const slugComponents = string
    .trim()
    .toLowerCase()
    .replace(removePunctuation ? /[.,:;'"]/g : "", "")
    .match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+/g);

  if (!slugComponents) {
    return "";
  }

  const slug = slugComponents.reduce((acc, component, index) => {
    const accSlug = `${acc}${index > 0 ? delimiter : ""}${component}`;

    if (accSlug.length < limit) {
      if (removeAccents) {
        return accSlug.replace(/[à-ÿ]/g, (match) => substitutes[match] || "");
      }

      return accSlug;
    }

    return acc;
  }, "");

  return encode ? encodeURI(slug) : slug;
}
