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

export default {
  getUrlBaseByWiki: function(wiki) {
    let wikiToLang = {
      'enwiki': 'en',
      'frwiki': 'fr',
      'ruwiki': 'ru'
    };
    return `http://${wikiToLang[wiki]}.wikipedia.org`;
  },
  /**
   * @deprecated use getUrlBaseByWiki
   * @param newRecentChange
   * @returns {string}
   */
  getUrlBase: function (newRecentChange) {
    let lang = {
      'enwiki': 'en',
      'frwiki': 'fr',
      'ruwiki': 'ru'
    };
    return `http://${lang[newRecentChange.wiki]}.wikipedia.org`;
  },
  /**
   * @deprecated use fetchDiffWithWikiRevId
   * @param recentChange
   * @returns {Promise<void>}
   */
  fetchDiff: async function(recentChange) {
    let diffApiUrl = `/api/diff?serverUrl=${this.getUrlBase(recentChange)}/&revId=${recentChange.revision.new}`;
    let diffJson = await this.$axios.$get(diffApiUrl);
    recentChange.diff = diffJson;
  },

  /**
   * @deprecated
   * @param wikiRevId a string of wiki:revId
   * @returns {Promise<String>}
   */
  fetchDiffWithWikiRevId: async function(wikiRevId) {
    let wiki = wikiRevId.split(`:`)[0];
    let revId = wikiRevId.split(`:`)[1];
    let diffApiUrl = `/api/diff?serverUrl=${this.getUrlBaseByWiki(wiki)}/&revId=${revId}`;
    let diffJson = await this.$axios.$get(diffApiUrl);
    return diffJson;
  },
}
