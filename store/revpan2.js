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

import { MwActionApiClient } from '~/shared/mwapi';
import axios from 'axios';
import { parseWikiRevId } from '~/shared/utility-shared';

export const state = () => ({
  wikiRevId: null,
  item: {},
  infoLoaded: true,
  diffLoaded: true,
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
  mergeDiff(state, diffHtml) {
    state.item = {...state.item, ...{ diffHtml: diffHtml }};
  },
  mergeItem(state, itemObj) {
    state.item = {...state.item, ...itemObj};
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
  }
}

export const actions = {
   async loadInfo({ commit, state },) {
    commit(`setInfoLoaded`, false);
    try {
      let revision = (await axios.get(`/api/revision/${state.wikiRevId}`)).data;
      let item = {
        wiki: revision.wiki,
        revId: revision.revid,
        title: revision.title,
        pageId: revision.pageId,
        summary: revision.comment,
        author: revision.user,
        timestamp: new Date(revision.timestamp).getTime() / 1000,
      };
      commit(`mergeItem`, item);
    } catch (err) {
      commit(`setErrorMsg`, `Loading revision from WikiLoop DoubleCheck API has encountered error.`);
      commit(`setErrorRawObj`, err);
    } finally {
      commit(`setInfoLoaded`, true);
    }
  },
  async loadDiff({ commit, state }){
    let [wiki, revId] = parseWikiRevId(state.wikiRevId);
    commit(`setDiffLoaded`, false);
    try {
      let diff = await MwActionApiClient.getDiffByWikiRevId(wiki, revId);
      commit(`mergeDiff`, diff);
    } catch (err) {
      commit(`setErrorMsg`, `Loading diff from Wikipedia API encountered error`);
      commit(`setErrorRawObj`, err);
    }
    finally {
      commit(`setDiffLoaded`, true);
    }
  }
};
