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
export const state = () => ({
  wikiRevIdToMeta: {},
  nextWikiRevIdsHeap: null, // a heap
  prevWikiRevIds: [],
  maxTimestamp: Math.floor(new Date().getTime() / 1000),
  minTimestamp: null,
  maxQueueSize: 500,
});

export const getter = () => ({
  getNext: function(state) {
    console.log(`XXX getter called`);
    return state.nextWikiRevIdsHeap.peak();
  },

});

export const mutations = {
  initHeap(state) {
    state.nextWikiRevIdsHeap = new Heap(function(wikiRevId1, wikiRevId2) {
      // // TODO(zzn): implement this function according to
      // // the design discussion of https://github.com/google/wikiloop-battlefield/issues/112
      //
      // // Approach: using RevId as the quantifying measure.
      // let priority = parseInt(wikiRevId.split(':')[1]);
      // this.wikiRevIdToMeta[wikiRevId].meta = {};
      //
      // // For 20% of time, we will ask the reviewer to review a randomly generated revision
      // // first somewhere, therefore, regardless.
      // if (Math.random() <= 0.2) {
      //   priority += (REVIEW_QUEUE_SIZE); // and we don't consider any other factors.
      //   this.wikiRevIdToMeta[wikiRevId].meta.random = true;
      // } else {
      //   if (this.wikiRevIdToMeta[wikiRevId]) {
      //     let item = this.wikiRevIdToMeta[wikiRevId];
      //     // The more suspicious, the more priority. We have not yet honored "hardcase" so far.
      //     if (item.ores && item.ores.damaging && item.ores.damaging.true >= 0.5) {
      //       priority += (REVIEW_QUEUE_SIZE);
      //     }
      //     if (item.ores && item.ores.damaging && item.ores.goodfaith.false >= 0.5) {
      //       priority += (REVIEW_QUEUE_SIZE);
      //     }
      //   }
      // }
      // this.wikiRevIdToMeta[wikiRevId].meta.priority = priority;
      return wikiRevId2 - wikiRevId1;
    });
  },git
  addRecentChange (state, recentChange) {
    state.nextWikiRevIdsHeap.push(recentChange.wikiRevId);
  },
  updateScore (state, value) {
    state.profile = null;
  },
  updateTimestamps(state, timestamps) {
    state.maxTimestamp = Math.max(state.maxTimestamp,...timestamps);
    state.minTimestamp = Math.min(state.minTimestamp,...timestamps);
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
    apiPage.forEach(item => commit(`addRecentChange`, item));
    return apiPage.map(item => item.wikiRevId);
  },
  async loadMoreWikiRevs( { commit, state, dispatch}) {
    if (!state.nextWikiRevIdsHeap) commit(`initHeap`);
    if (state.nextWikiRevIdsHeap.size() <= state.maxQueueSize) {
      await dispatch('fetchNewWikiRevIds',
        {limit: state.maxQueueSize - state.nextWikiRevIdsHeap.size(), direction: `newer`});
    }
    if (state.nextWikiRevIdsHeap.size() <= state.maxQueueSize) {
      await dispatch('fetchNewWikiRevIds',
        {limit: state.maxQueueSize - state.nextWikiRevIdsHeap.size(), direction: `older`});
    }
  }
};
