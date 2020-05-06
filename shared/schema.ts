import {BasicJudgement} from "~/shared/interfaces";

/**
 * Schema of Database
 */
export interface WatchCollectionItem {
  wiki: string,
  title: string,
  revIds: number[] // revert order
}

/**
 * @deprecated: use {@interface InteractionProps}
 */
export interface InteractionItem {
  feed?: string,
  wikiRevId: string,
  userGaId: string,
  wikiUserName?: string,
  judgement: BasicJudgement,
  timestamp: number, // int32 of Seconds from Unix Epoch of the interactions
  title: string,
  wiki: string,
}
