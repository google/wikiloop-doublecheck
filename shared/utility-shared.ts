// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export enum WikiEnum {
  afwiki,
  bgwiki,
  cawiki,
  dewiki,
  enwiki,
  eswiki,
  frwiki,
  hewiki,
  idwiki,
  itwiki,
  jawiki,
  kowiki,
  lvwiki,
  nlwiki,
  plwiki,
  ptwiki,
  ruwiki,
  trwiki,
  thwiki,
  zhwiki,
  wikidatawiki,
  testwiki
}

export enum UserTier {
  Blocked = -1, // -10
  Anonymous = 0, // 1 = 1e0
  User = 1, // 10 = 1e1
  Confirmed = 2, // 100 = 1e2
  ExtendedConfirmed = 3, // 1000 = 1e3
  Rollbacker = 4, // 10000 = 1e4
  Admin = 5 // 100000 = 1e5
}


export const wikiToDomain = {
  "afwiki": "af.wikipedia.org",
  "bgwiki": "bg.wikipedia.org",
  "cawiki": "ca.wikipedia.org",
  "dewiki": "de.wikipedia.org",
  "enwiki": "en.wikipedia.org",
  "eswiki": "es.wikipedia.org",
  "frwiki": "fr.wikipedia.org",
  "hewiki": "he.wikipedia.org",
  "idwiki": "id.wikipedia.org",
  "itwiki": "it.wikipedia.org",
  "jawiki": "ja.wikipedia.org",
  "kowiki": "ko.wikipedia.org",
  "lvwiki": "lv.wikipedia.org",
  "nlwiki": "nl.wikipedia.org",
  "plwiki": "pl.wikipedia.org",
  "ptwiki": "pt.wikipedia.org",
  "ruwiki": "ru.wikipedia.org",
  "trwiki": "tr.wikipedia.org",
  "thwiki": "th.wikipedia.org",
  "wikidatawiki": "wikidata.org",
  "zhwiki": "zh.wikipedia.org",
  "testwiki": "test.wikipedia.org",
};
export let getUrlBaseByWiki = function(wiki) {
    return `http://${wikiToDomain[wiki]}`;
};

  /**
   * @param wikiRevId a string of wiki:revId
   * @returns {Promise<String>}
   */
export let fetchDiffWithWikiRevId = async function(wikiRevId, $axios) {
    let wiki = wikiRevId.split(`:`)[0];
    let revId = wikiRevId.split(`:`)[1];
    let diffApiUrl = `/api/diff/${wiki}:${revId}`;
    let diffJson = await $axios.$get(diffApiUrl);
    return diffJson;
};
export const supportedWikis = Object.keys(wikiToDomain);

export const parseWikiRevId = (wikiRevId: string): [string,number] => {
  return [wikiRevId.split(':')[0], parseInt(wikiRevId.split(':')[1])];
}

export const percent = (num:number) => {
  return `${Math.round(num * 100)}%`;
}
