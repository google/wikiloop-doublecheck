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

// TODO(xinbenlv): merge with urlMap on the server side.
// blocked by https://github.com/google/wikiloop-battlefield/issues/105
const _wikiToDomain = {
  "enwiki": "en.wikipedia.org",
  "frwiki": "fr.wikipedia.org",
  "dewiki": "de.wikipedia.org",
  "wikidatawiki": "wikidata.org",
  "zhwiki": "zh.wikipedia.org",
};

export default {
  getUrlBaseByWiki: function(wiki) {
    return `http://${_wikiToDomain[wiki]}`;
  },

  /**
   * @param wikiRevId a string of wiki:revId
   * @returns {Promise<String>}
   */
  fetchDiffWithWikiRevId: async function(wikiRevId, $axios) {
    let wiki = wikiRevId.split(`:`)[0];
    let revId = wikiRevId.split(`:`)[1];
    let diffApiUrl = `/api/diff/${wiki}:${revId}`;
    let diffJson = await $axios.$get(diffApiUrl);
    return diffJson;
  },
  supportedWikis: Object.keys(_wikiToDomain)
};
