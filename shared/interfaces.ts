// Interfaces shared across the app but not necessary going into database

export enum ScoreType {
  ORES_DAMAGING,
  ORES_GOODFAITH,
  STIKI,
  CLUEBOTNG,
  WIKITRUST
}

export interface Score {
  type: ScoreType,
  score: number,
  isBad: boolean,
  version: string,
}

export interface RevisionCardItem {
  feed?: string,
  wiki: string,
  revId: number,
  title: string,
  summary: string,
  author: string,
  timestamp: number,
  diffHtml?: string,
  scores?: { key: Score},
}

export interface InteractionCardItem {
  feed: string,
  wikiRevId: number,
  title: number,
  timestamp: number,
  user: string,

  userGaId: string,
  wikiUserName: string,

  judgement: string,
  recentChange: string,
}



