// Copyright 2020 Google LLC
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

import { MwActionApiClient2 } from '~/shared/mwapi2';
import { parseWikiRevId } from '~/shared/utility-shared';
export const state = () => ({
  wikiRevId: null,
  item: {},
  infoLoaded: false,
  diffLoaded: false,
  errorMsg: null,
  errorRawObj: null,
});

export const mutations = {
  setWikiRevId(state, value) {
    state.wikiRevId = value;
  },
  setInfoLoaded(state, value) {
    state.infoLoaded = value;
  },
  setDiffLoaded(state, value) {
    state.diffLoaded = value;
  },
  clearItem(state) {
    state.item = {};
  },
  mergeItem(state, itemObj) {
    state.item = { ...state.item, ...itemObj };
  },
  mergeDiff(state, diffHtml) {
    state.item = { ...state.item, ...{ diffHtml } };
  },
  setErrorRawObj(state, errorRawObj) {
    state.errorRawObj = errorRawObj;
  },
  setErrorMsg(state, errorMsg) {
    state.errorRawObj = errorMsg;
  },
  clearError(state) {
    state.errorMsg = null;
    state.errorRawObj = null;
  },
};

export const actions = {
  async loadInfo({ commit, state, axios }) {
    commit('setInfoLoaded', false);
    try {
      const revision = (await axios.get(`/api/revision/${state.wikiRevId}`)).data;
      const item = {
        wiki: revision.wiki,
        revId: revision.revid,
        title: revision.title,
        pageId: revision.pageId,
        summary: revision.comment,
        author: revision.user,
        timestamp: new Date(revision.timestamp).getTime() / 1000,
      };
      commit('mergeItem', item);
    } catch (err) {
      commit('setErrorMsg', 'Loading revision from WikiLoop DoubleCheck API has encountered error.');
      commit('setErrorRawObj', err);
    } finally {
      commit('setInfoLoaded', true);
    }
  },
  async loadDiff({ commit, state, axios }) {
    const [wiki, revId] = parseWikiRevId(state.wikiRevId);
    const mwapi2 = new MwActionApiClient2(this.$axios);
    commit('setDiffLoaded', false);
    try {
      const diff = await mwapi2.fetchDiff(wiki, revId);
      commit('setDiff', diff);
    } catch (err) {
      commit('setDiff', null);
      commit('setErrorMsg', 'Loading diff from Wikipedia API encountered error');
      commit('setErrorRawObj', err);
    } finally {
      commit('setDiffLoaded', true);
    }
  },
};
