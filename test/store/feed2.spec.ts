import _ from 'lodash';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { FeedResponse } from '../../server/routers/api/feed';
describe('store/feed2', () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  let NuxtStore;
  let store;

  beforeAll(async () => {
    // note the store will mutate across tests
    const storePath = `${process.env.buildDir}/store.js`;
    NuxtStore = await import(storePath);
  });

  beforeEach(async () => {
    store = await NuxtStore.createStore();
  });

  describe('after setup', () => {
    test('has current default value.', () => {
      const feed = store.state.feed2.feed;
      expect(feed).toEqual('lastbad');
      const reviewQueue = store.state.feed2.reviewQueue;
      expect(_.isArray(reviewQueue)).toBe(true);
      expect((reviewQueue as []).length).toBe(0);
    });

    test('can setFeed', () => {
      expect(store.state.feed2.feed).toEqual('lastbad');
      store.commit('feed2/setFeed', 'recent');
      expect(store.state.feed2.feed).toEqual('recent');
    });
  });

  describe('loadMoreWikiRevIds', () => {

    function mockFeed(feed, wikiRevIds) {
      const axios = require('axios');
      const MockAdapter = require('axios-mock-adapter');
      const mock = new MockAdapter(axios);
      const mockedRes = {
        useMixer: false,
        feed,
        wikiRevIds,
      } as FeedResponse;

      mock
          .onGet('/api/feed/lastbad', {
            params: {
              wiki: 'enwiki',
              limit: 10,
            },
          })
          .reply(function(_) {
            return [200, mockedRes];
          });
      mock.onAny(/.*/).reply(500); // Any other response are going to yield 500
    }

    test('can loadMoreWikiRevIds', async () => {
      mockFeed('lastbad', [
        'enwiki:9990001',
        'enwiki:9990002',
        'enwiki:9990003',
        'enwiki:9990004',
        'enwiki:9990005',
        'enwiki:9990006',
        'enwiki:9990007',
        'enwiki:9990008',
        'enwiki:9990009',
        'enwiki:9990010',
      ]);
      expect(store.state.feed2.reviewQueue.length).toBe(0);
      await store.dispatch('feed2/loadMoreWikiRevIds');
      expect(store.state.feed2.reviewQueue.length).toBe(10);
      expect(store.state.feed2.reviewQueue[0]).toBe('enwiki:9990001');
      expect(store.state.feed2.reviewQueue[9]).toBe('enwiki:9990010');
    });

    test('can clear wikiRevIds', () => { 
      expect(store.state.feed2.reviewQueue.length).toBe(0);
      store.commit('feed2/addToReviewQueue', [
        'enwiki:9990001',
        'enwiki:9990002',
        'enwiki:9990003'
      ]);
      expect(store.state.feed2.reviewQueue.length).toBe(3);
      store.commit('feed2/clearReviewQueue');
      expect(store.state.feed2.reviewQueue.length).toBe(0);
    });

    test('(TODO implement) should skip revisions that is already reviewed or should be skipped.', async () => { });
    test('(TODO implement) should merge WikiRevIds should there be already existing.', async () => { });
    test('(TODO implement) should kickoff prefetching', async () => { });
  });
});