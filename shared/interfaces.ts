// Interfaces shared across the app but not necessary going into database

export enum ScoreType {
  ORES_DAMAGING = 'ores_damaging',
  ORES_BADFAITH = 'ores_badfaith',
  STIKI = 'stiki',
  CLUEBOTNG = 'cbng',
  WIKITRUST = 'wikitrust'
}

export enum BasicJudgement {
  LOOKS_GOOD = 'LooksGood',
  NOT_SURE = 'NotSure',
  SHOULD_REVERT = 'ShouldRevert'
}

export interface Score {
  type: ScoreType,
  score: number,
  isBad: boolean,
  version: string,
}

export interface RevisionPanelItem {
  feed?: string,
  wiki: string,
  revId: number,
  title: string,
  summary: string,
  author: string,
  timestamp: number,
  diffHtml?: string,
}



