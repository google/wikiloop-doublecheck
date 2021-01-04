import _ from 'lodash';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { FeedResponse } from '~/server/routers/api/feed';
import { parseWikiRevId } from '~/shared/utility-shared';

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

  describe('reviewQueue', () => {
    test('can add and clear reviewQueue', () => {
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

    test('should skip revisions that is already in the queue.', () => {
      // The test beging with an empty queue.
      expect(store.state.feed2.reviewQueue.length).toBe(0);
      store.commit('feed2/addToReviewQueue', [
        'enwiki:9990001',
        'enwiki:9990002',
        'enwiki:9990003'
      ]);

      // After adding 3 revisions, the reviewQueue becomes an array of 3.
      expect(store.state.feed2.reviewQueue.length).toBe(3);
      expect(store.state.feed2.reviewQueue).toEqual([
        'enwiki:9990001',
        'enwiki:9990002',
        'enwiki:9990003'
      ]);

      store.commit('feed2/addToReviewQueue', [
        'enwiki:9990002',
      ]);

      // The review queue maintains the same length after adding a repeated revision
      expect(store.state.feed2.reviewQueue.length).toBe(3);
      expect(store.state.feed2.reviewQueue).toEqual([
        'enwiki:9990001',
        'enwiki:9990002',
        'enwiki:9990003'
      ]);

      store.commit('feed2/addToReviewQueue', [
        'enwiki:9990004',
      ]);

      expect(store.state.feed2.reviewQueue.length).toBe(4);
      expect(store.state.feed2.reviewQueue).toEqual([
        'enwiki:9990001',
        'enwiki:9990002',
        'enwiki:9990003',
        'enwiki:9990004',
      ]);
    });

    test('should handle enqueue and dequeue', async () => {
      store.commit('feed2/addToReviewQueue', ['enwiki:9990001']);
      store.commit('feed2/addToReviewQueue', ['enwiki:9990002']);
      const wikiRevId1 = await store.dispatch('feed2/deReviewQueue');
      expect(wikiRevId1).toBe('enwiki:9990001');
      const wikiRevId2 = await store.dispatch('feed2/deReviewQueue');
      expect(wikiRevId2).toBe('enwiki:9990002');
    });
  });

  describe('MOCK loadMoreWikiRevIds', () => {
    const axios = require('axios');
    const MockAdapter = require('axios-mock-adapter');
    const mock = new MockAdapter(axios);

    function mockFeed(feed, wikiRevIds) {
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
    }

    function mockRevision(wikiRevId, { title, pageId, comment, user, timestampStr }) {
      const [wiki, revid] = parseWikiRevId(wikiRevId);
      const mockedRes = {
        wiki,
        revid,
        title,
        pageId,
        comment,
        user,
        timestamp:timestampStr
      };

      mock
          .onGet(`/api/revision/${wikiRevId}`)
          .reply(function(_) {
            return [200, mockedRes];
          });
    }


    test('MOCK can load more wikiRevIds', async () => {
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

      mockRevision('enwiki:9990001', {
        title: 'John Smith',
        pageId: 10001,
        comment: 'Some good edits',
        user: 'GoodGuy',
        timestampStr: '2020-11-10T00:18:07‎'
      });

      expect(store.state.feed2.reviewQueue.length).toBe(0);
      await store.dispatch('feed2/loadMoreWikiRevIds');
      expect(store.state.feed2.reviewQueue.length).toBe(10);
      expect(store.state.feed2.reviewQueue[0]).toBe('enwiki:9990001');
      expect(store.state.feed2.reviewQueue[9]).toBe('enwiki:9990010');
    });

    test('MOCK should kickoff prefetching for reviewQueueHead', async (done) => {
      mockFeed('lastbad', [
        'enwiki:9990001',
        'enwiki:9990002',
      ]);

      mockRevision('enwiki:9990001', {
        title: 'John Smith',
        pageId: 10001,
        comment: 'Some good edits',
        user: 'GoodGuy',
        timestampStr: '2020-11-10T00:18:07‎'
      });

      mockRevision('enwiki:9990002', {
        title: 'Second John Smith',
        pageId: 10002,
        comment: 'Second Some good edits',
        user: 'GoodGuy 2',
        timestampStr: '2020-11-20T00:18:07‎'
      });
      const commits = [];
      store.subscribe((mutation, state) => {
        commits.push(mutation);
      });

      expect(store.state.feed2.reviewQueue.length).toBe(0);
      await store.dispatch('feed2/loadMoreWikiRevIds');
      expect(store.state.feed2.reviewQueue.length).toBe(2);
      expect(store.state.feed2.reviewQueue).toStrictEqual([
        'enwiki:9990001',
        'enwiki:9990002'
      ]);

      setTimeout(function() {
        expect(commits.length).toBe(3);
        expect(commits[0].type).toBe('feed2/addToReviewQueue');
        expect(commits[0].payload).toStrictEqual([ 'enwiki:9990001', 'enwiki:9990002' ]);

        expect(commits[1].type).toBe('feed2/addToCache');
        expect(commits[1].payload).toStrictEqual({
          key: 'enwiki:9990001',
          value:{
            title: 'John Smith',
            wiki: 'enwiki',
            revId: 9990001,
            summary: 'Some good edits',
            author: 'GoodGuy',
            timestamp: NaN
          }});
        done();
      }, 1000);

    });

  });

  describe('cache', () => {
    test('should handle caching', async (done) => {
      const item = {
        wiki: 'enwiki',
        revId: 9990001,
        title: 'John Smith',
        pageId: 10001,
        summary: 'Some good edits',
        author: 'GoodGuy',
        timestamp: new Date('2020-11-10T00:18:07‎').getTime() / 1000
      };

      const [mutation, state] = await new Promise((resolve, reject) => {
        const unsubscribe = store.subscribe((mutation, state) => {
          unsubscribe();
          resolve([mutation, state]);
        });
        store.commit('feed2/addToCache', { key: 'enwiki:9990001', value: item });
      });
      expect(mutation.type).toBe('feed2/addToCache');
      expect(mutation.payload.key).toBe('enwiki:9990001');
      expect(mutation.payload.value).toStrictEqual(item);
      expect(state.feed2.cache['enwiki:9990001']).toStrictEqual(item);

      const wikiRevId = 'enwiki:9990001';
      const cachedItem = store.getters['feed2/getFromCache'](wikiRevId);
      expect(wikiRevId).toBe('enwiki:9990001');
      expect(cachedItem.pageId).toBe(10001);
      expect(cachedItem.summary).toBe('Some good edits');
      const [mutation2, state2] = await new Promise((resolve, reject) => {
        const unsubscribe = store.subscribe((mutation, state) => {
          unsubscribe();
          resolve([mutation, state]);
        });
        store.commit('feed2/clearCache');
      });
      expect(mutation2.type).toBe('feed2/clearCache');
      expect(mutation2.payload).toBe(undefined);
      expect(state2.feed2.cache).toStrictEqual({});

      const nullItem = store.getters['feed2/getFromCache'](wikiRevId);
      expect(nullItem).toBe(undefined);
      done();
    });
  });

});
