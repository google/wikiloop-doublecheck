import {Score} from "~/shared/interfaces";

/**
 * Schema of Database
 */
export interface WatchCollectionItem {
  wiki: string,
  title: string,
  revIds: number[] // revert order
}

