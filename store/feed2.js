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
});

export const mutations = {
  setFeed(state, feed) {
    state.feed = feed;
  },
  addToReviewQueue(state, wikiRevIds) {
    state.reviewQueue.push(...wikiRevIds);
  },
  clearReviewQueue(state) {
    state.reviewQueue = [];
  },
};

export const actions = {

  async loadMoreWikiRevIds({ commit, state }) {
    const params = {
      wiki: 'enwiki', // TODO update to the current Wiki selected by users
      limit: 10, // TODO update feed
    };

    try {
      const feedResponse = (await axios.get(`/api/feed/${state.feed}`, { params })).data;
      const wikiRevIds = feedResponse.wikiRevIds;
      commit('addToReviewQueue', wikiRevIds);
    } catch (err) {
      console.error(err);
    }
  },
};
