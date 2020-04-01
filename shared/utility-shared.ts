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

enum GoodEnum {
  Good,
  VeryGood
}

export const wikiToDomain = {
  "afwiki": "af.wikipedia.org",
  "dewiki": "de.wikipedia.org",
  "enwiki": "en.wikipedia.org",
  "frwiki": "fr.wikipedia.org",
  "idwiki": "id.wikipedia.org",
  "lvwiki": "lv.wikipedia.org",
  "plwiki": "pl.wikipedia.org",
  "ruwiki": "ru.wikipedia.org",
  "trwiki": "tr.wikipedia.org",
  "wikidatawiki": "wikidata.org",
  "zhwiki": "zh.wikipedia.org",
};
export const getUrlBaseByWiki = function(wiki) {
    return `http://${wikiToDomain[wiki]}`;
};

  /**
   * @param wikiRevId a string of wiki:revId
   * @returns {Promise<String>}
   */
export const fetchDiffWithWikiRevId = async function(wikiRevId, $axios) {
    let wiki = wikiRevId.split(`:`)[0];
    let revId = wikiRevId.split(`:`)[1];
    let diffApiUrl = `/api/diff/${wiki}:${revId}`;
    let diffJson = await $axios.$get(diffApiUrl);
    return diffJson;
};
export const supportedWikis = Object.keys(wikiToDomain);

export const E_NUM = 2.76;

export const isItGood:GoodEnum = GoodEnum.Good;
