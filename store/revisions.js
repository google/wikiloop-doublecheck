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
import axios from 'axios';
const Heap = require('heap');
const _populatePriority = function(meta, bumpPriority) {
  // TODO(zzn): implement this function according to
  // the design discussion of https://github.com/google/wikiloop-doublecheck/issues/112

  // Approach: using RevId as the quantifying measure.
  let priority = parseInt(meta.wikiRevId.split(':')[1]);

  // For simplicity, we currently discourage people to review any latest
  // recent changes that are already reviewed, regardless whether such review
  // is by the user themselves, so we don't have to
  // populate the individual userGaId or wikiUserName.
  //
  // TODO(xinbenlv): revisit this design decision after we consolidate the
  // feed algorithm.
  if (meta.interactions.length > 0) priority -= (2 * bumpPriority);

  // For 20% of time, we will ask the reviewer to review a randomly generated revision
  // first somewhere, therefore, regardless.
  if (Math.random() <= 0.2/*20%*/) {
    priority += (bumpPriority); // and we don't consider any other factors.
    meta.random = true;
  } else {
      // The more suspicious, the more priority. We have not yet honored "hardcase" so far.
      if (meta.ores && meta.ores.damaging && meta.ores.damaging.true >= 0.5) {
        priority += (bumpPriority);
      }
      if (meta.ores && meta.ores.damaging && meta.ores.goodfaith.false >= 0.5) {
        priority += (bumpPriority);
      }
  }
  meta.priority = priority;
};

const getDefaultState = () => {
  return {
    wikiRevIdToMeta: {},
    nextWikiRevIdsHeap: null, // a heap
    reviewedWikiRevIdSet: new Set(),
    maxTimestamp: Math.floor(new Date().getTime() / 1000),
    minTimestamp: null,
    maxQueueSize: 500,
  }
};

export const state = () => {
  return getDefaultState();
};

export const mutations = {
  initHeap(state) {
    state.nextWikiRevIdsHeap = new Heap(function(wikiRevId1, wikiRevId2) {
      return state.wikiRevIdToMeta[wikiRevId2].priority - state.wikiRevIdToMeta[wikiRevId1].priority;
    });
  },
  addRecentChange (state, recentChange) {
    state.wikiRevIdToMeta[recentChange.wikiRevId] = recentChange;
    if (recentChange.ores instanceof Array) recentChange.ores = null; // an empty ORES
    _populatePriority(state.wikiRevIdToMeta[recentChange.wikiRevId], state.maxQueueSize);
    if (!state.reviewedWikiRevIdSet.has(recentChange.wikiRevId)) {
      state.nextWikiRevIdsHeap.push(recentChange.wikiRevId);
    }
  },
  pop(state) {
    state.nextWikiRevIdsHeap.pop();
  },
  markAsReviewed(state, wikiRevId) {
    state.reviewedWikiRevIdSet.add(wikiRevId);
  },
  updateTimestamps(state, timestamps) {
    state.maxTimestamp = Math.max(state.maxTimestamp,...timestamps);
    state.minTimestamp = Math.min(state.minTimestamp,...timestamps);
  },
  field(state, payload) {
    console.info(`committing value of ${payload.fieldName}`);
    let wikiRevId = payload.wikiRevId;
    let fieldName = payload.fieldName;
    let fieldValue = payload.fieldValue;
    state.wikiRevIdToMeta[wikiRevId][fieldName] = fieldValue;
  },
  resetState (state) {
    Object.assign(state, getDefaultState())
  }
};


export const actions = {
  /**
   * @param limit a number of limit of revisions to be returned.
   * @param  if new, we are querying newer revisions of our time window,
   * else we are querying more older revisions.
   *   ----------------------------------------
   *  older <-||   revisions cached client  ||-> newer
   *     minTimestamp                maxTimestamp
   *   ----------------------------------------
   * @param commit
   * @param state
   * @param payload = {
   *   limit // limit of new WikiRevIds
   *   direction // newer and older as in `rcdir` of https://www.mediawiki.org/wiki/API:Lists/All#Recentchanges
   * }
   * @return {Promise<*>}
   */
  async fetchNewWikiRevIds({ commit, state, rootState }, payload) {
    let urlParams = new URLSearchParams();
    urlParams.set(`wiki`, rootState.wiki);
    urlParams.set(`limit`, payload.limit);
    urlParams.set("direction", payload.direction);
    urlParams.set("timestamp",
      payload.direction === "newer" ? state.maxTimestamp : state.minTimestamp);
    let apiPage = (await axios.get(`/api/recentchanges/list?${urlParams.toString()}`)).data;
    let _timestamps = apiPage.map(item => item.timestamp);
    commit(`updateTimestamps`, _timestamps);
    apiPage.forEach(item => {
          // skip if already in list:
      if (!(item.wikiRevId in state.wikiRevIdToMeta)
          // skip reviewing one's own edit:
          && (!item.user || (rootState.user.profile || {}).displayName !== item.user)) {
        commit(`addRecentChange`, item);
      }
    });
    return apiPage.map(item => item.wikiRevId);
  },
  async loadMoreWikiRevs( { commit, state, dispatch}) {
    if (!state.nextWikiRevIdsHeap) commit(`initHeap`);
    let limit = state.maxQueueSize - state.nextWikiRevIdsHeap.size();
    // Consider revisions in `nextWikiRevIdsHeap` as a time window
    // Extend the time window by fetching both before and after the time window
    if (state.nextWikiRevIdsHeap.size() <= state.maxQueueSize) {
      await dispatch('fetchNewWikiRevIds',
        {limit, direction: `newer`}); // fetching revisions after (newer than)the time window
    }
    if (state.nextWikiRevIdsHeap.size() <= state.maxQueueSize) {
      await dispatch('fetchNewWikiRevIds',
        {limit, direction: `older`}); // fetching revisions after (older than) the time window
    }
  },
  async preloadAsyncMeta( {state, dispatch}) {
    await Promise.all([state.nextWikiRevIdsHeap.peek()].map(wikiRevId => {
      return Promise.all([dispatch(`loadDiff`, wikiRevId), dispatch(`loadInteraction`, wikiRevId)]);
    }));
  },
  async loadDiff( {commit, state, dispatch}, wikiRevId ) {
    if (state.wikiRevIdToMeta && state.wikiRevIdToMeta[wikiRevId] && state.wikiRevIdToMeta[wikiRevId].diff) {
      console.info(`ignoring existing diff preloadAsyncMeta for wikiRevId = `, wikiRevId);
      return;
    } else {
      console.info(`loading diff preloadAsyncMeta for wikiRevId = `, wikiRevId);
      let diff = await this.$axios.$get(`/api/diff/${wikiRevId}`);
      commit(`field`, {wikiRevId, fieldName: "diff", fieldValue: diff})
    }
  },
  async loadInteraction( {commit, state, dispatch}, wikiRevId ) {
    if (state.wikiRevIdToMeta[wikiRevId].interactions) {
      console.info(`ignoring existing interactions preloadAsyncMeta for wikiRevId = `, wikiRevId);
    } else {
      console.info(`loading interactions preloadAsyncMeta for wikiRevId = `, wikiRevId);
      let interaction = await this.$axios.$get(`/api/interaction/${wikiRevId}`);
      commit(`field`, {wikiRevId, fieldName: "interaction", fieldValue: interaction})
    }
  },
};
