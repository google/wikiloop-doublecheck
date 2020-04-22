import {BasicJudgement, Score, WikiActionType} from "~/shared/interfaces";

/**
 * Schema of Database
 */
export interface WatchCollectionItem {
  wiki: string,
  title: string,
  revIds: number[] // revert order
}

export interface InteractionItem {
  feed?: string,
  wikiRevId: string,
  userGaId: string,
  wikiUserName?: string,
  judgement: BasicJudgement,
  timestamp: number, // int32 of Seconds from Unix Epoch of the interactions
  title: string,
}

export interface WikiActionItem {
  type: WikiActionType,
  fromWikiUserName?: string,
  fromUserGaId: string,
  wiki: string,
  revId: number,
  pageId?: number,
  title?: string,
  toWikiUserName?: string,
}
