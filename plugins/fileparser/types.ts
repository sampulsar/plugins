import { SceneContext } from "../../types/scene";

export interface MySceneContext extends SceneContext {
  args: {
    dry?: boolean;
    parseDate?: boolean;
  };
}

export interface IReplacementCharacter {
  original: string;
  replacement: string;
}

export type IFileParserConfigElem = {
  scopeDirname?: boolean;
  regex: string;
  matchesToUse?: number[];
  groupsToUse?: number[];
  splitter?: string;
  characterReplacement?: IReplacementCharacter[];
};

export type IFileParserConfig = {
  studioMatcher?: IFileParserConfigElem;
  nameMatcher?: IFileParserConfigElem;
  actorsMatcher?: IFileParserConfigElem;
  movieMatcher?: IFileParserConfigElem;
  labelsMatcher?: IFileParserConfigElem;
};
