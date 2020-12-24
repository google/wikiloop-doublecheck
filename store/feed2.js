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

const axios = require('axios');
export const state = () => ({
  feed: 'lastbad', // TODO consider use enum
  reviewQueue: [],
  /**
   * Seen wikiRevIds in a map. Used like a Set
   */
  skipMap: {},

  /**
   * Cached 
   */
  cached: {},
});

export const mutations = {
  _dequeue(state) {
    state.reviewQueue.shift();
  },
  setFeed(state, feed) {
    state.feed = feed;
  },
  /**
   * 
   * @param {any} state vue state
   * @param {string} wikiRevIds strings in format of WikiRevId to be enqued.
   */
  addToReviewQueue(state, wikiRevIds) {
    const unseenWikiRevIds = wikiRevIds.filter(wikiRevId => !state.skipMap[wikiRevId]);
    state.reviewQueue.push(...unseenWikiRevIds);
    unseenWikiRevIds.forEach( (id) => {
      state.skipMap[id]=true;
    });
  },
  clearReviewQueue(state) {
    state.reviewQueue = [];
  },
  addToSkipMap(state, wikiRevId) {
    state.skipMap[wikiRevId] = true;
  },
  removeFromSkipMap(state, wikiRevId) {
    delete state.skipMap[wikiRevId];
  },
  clearSkipMap(state) {
    state.skipMap = {};
  },
  addToCache(state, item) {
    state.cached[`${item.wiki}:${item.revId}`] = item;
  },
  clearCache(state) {
    state.cached = {};
  }
};

export const actions = {
  async prefetchQueueHead({commit, state}) {
    const wikiRevId = state.reviewQueue[0];
    const revision = (await axios.get(`/api/revision/${wikiRevId}`)).data;
    const item = {
      wiki: revision.wiki,
      revId: revision.revid,
      title: revision.title,
      pageId: revision.pageId,
      summary: revision.comment,
      author: revision.user,
      timestamp: new Date(revision.timestamp).getTime() / 1000,
    };
    commit('addToCache', item);
    return item;
  },
  async loadMoreWikiRevIds({ commit, state, dispatch }) {
    const params = {
      wiki: 'enwiki', // TODO update to the current Wiki selected by users
      limit: 10, // TODO update feed
    };

    try {
      const feedResponse = (await axios.get(`/api/feed/${state.feed}`, { params })).data;
      const wikiRevIds = feedResponse.wikiRevIds;
      if (wikiRevIds) {
        commit('addToReviewQueue', wikiRevIds);
        await dispatch('prefetchQueueHead');
      }
    } catch (err) {
      console.log('We encountered a problem in prefetching,', err);
    }
  },

  /**
   * Dequeue from reviewQueue and return the head wikiRevId
   * It assumes the reviewQueue is not empty
   */
  // eslint-disable-next-line require-await
  async deReviewQueue({commit, state}) {
    const head = state.reviewQueue[0];
    commit('_dequeue');
    return head;
  }
};
