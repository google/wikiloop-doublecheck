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
import { parseWikiRevId } from '~/shared/utility-shared';
import { MwActionApiClient2 } from '~/shared/mwapi2';

export const state = () => ({
  feed: 'lastbad', // TODO consider use enum
  reviewQueue: [],
  /**
   * Seen wikiRevIds in a map. Used like a Set
   */
  skipMap: {},

  /**
   * Cached key value pair
   */
  cache: {},
});

export const getters =  {
  getFromCache: (state) => (key) => {
    return state.cache[key];
  },
  getHead: (state) => () => {
    const head = state.reviewQueue[0];
    return state.cache[head];
  }
};

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
  addToCache(state, pair) {
    state.cache[pair.key] = pair.value;
  },
  removeFromCache(state, key) {
    delete state.cache[key];
  },
  clearCache(state) {
    state.cache = {};
  },
  cacheDiffHtml(state, payload) {
    const wikiRevId = payload.wikiRevId;
    const diffHtml = payload.diffHtml;
    state.cache[wikiRevId] = {... state.cache[wikiRevId], diffHtml};
  },
  cacheInteractions(state, payload) {
    const wikiRevId = payload.wikiRevId;
    const interactions = payload.interactions;
    state.cache[wikiRevId] = {... state.cache[wikiRevId], interactions};
  }
};

export const actions = {
  async fetchInteractions({commit, state}, wikiRevId) {
    // await axios.get('/api/judgement/')
    const interactions = await this.$axios.get(`/api/interaction/beta/${wikiRevId}`);
    return interactions;
  },
  async fetchDiff({commit, state}, wikiRevId) {
    const mwapi2 = new MwActionApiClient2(this.$axios);
    const [wiki, revId] = parseWikiRevId(wikiRevId);
    const diffHtml = await mwapi2.fetchDiff(wiki, revId);
    return diffHtml;
  },

  async fetchRevision({commit, state, dispatch}, wikiRevId) {
    try {
      const revision = (await this.$axios.get(`/api/revision/${wikiRevId}`)).data;
      const item = {
        wiki: revision.wiki,
        revId: revision.revid,
        title: revision.title,
        // pageId: revision.pageid, TODO add back pageId if exist
        summary: revision.comment,
        author: revision.user,
        timestamp: new Date(revision.timestamp).getTime() / 1000,
      };
      /* no await */ dispatch('fetchDiff', wikiRevId)
          .then(diffHtml=> {
            commit('cacheDiffHtml', {wikiRevId, diffHtml});
          }).catch(err => {
            console.log(`fetchDiff ${wikiRevId} encountered an issue`, err.response?.status || err);
          }); 
      /* no await */ dispatch('fetchInteractions', wikiRevId)
          .then(interactions=> {
            commit('cacheInteractions', {wikiRevId, interactions});
          }).catch(err => {
            console.log(`fetchInteractions ${wikiRevId} encountered an issue`, err.response?.status || err);
          }); 
      return item;
    } catch(err) {
      // TODO: add test for handling error
      console.log('fetch revision returns error: ',err.response?.status || err);
      return null;
    }
  },
  async loadMoreWikiRevIds({ commit, state, dispatch, getters }) {
    const params = {
      wiki: 'enwiki', // TODO update to the current Wiki selected by users
      limit: 10, // TODO update feed
    };

    try {
      const feedResponse = (await this.$axios.get(`/api/feed/${state.feed}`, { params })).data;
      const wikiRevIds = feedResponse.wikiRevIds;
      if (wikiRevIds) {
        commit('addToReviewQueue', wikiRevIds);
        /* no await */ wikiRevIds
            .filter(wikiRevId => !getters.getFromCache(wikiRevId))
            .map(async (wikiRevId) => {
              const item = await dispatch('fetchRevision', wikiRevId);
              if (item) commit('addToCache', { key: `${item.wiki}:${item.revId}`, value: item });
            });
      }
    } catch (err) {
      console.log('We encountered a issue in prefetching,', err.response?.status || err);
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
