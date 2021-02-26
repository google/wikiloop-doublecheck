import _ from 'lodash';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { FeedResponse } from '~/server/routers/api/feed';
import { parseWikiRevId } from '~/shared/utility-shared';
import { InteractionProps } from '~/shared/models/interaction-item.model';
import { MwActionApiClient2 } from '~/shared/mwapi2';

describe('store/feed2', () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  let NuxtStore;
  let store;
  let mock;
  beforeAll(async () => {
    // note the store will mutate across tests
    const storePath = `${process.env.buildDir}/store.js`;
    NuxtStore = await import(storePath);
  });

  beforeEach(async () => {
    store = await NuxtStore.createStore();
    const axios = require('axios');
    const MockAdapter = require('axios-mock-adapter');
    mock = new MockAdapter(axios);
    store.$axios = axios;

    // axios.interceptors.request.use(request => {
    //   console.log('Starting Request', JSON.stringify(request, null, 2));
    //   return request;
    // });
    
    store.$mock = mock;
  });

  function mockFeed(feed, wikiRevIds) {
    const mockedRes = {
      useMixer: false,
      feed,
      wikiRevIds,
    } as FeedResponse;

    store.$mock
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

    store.$mock
        .onGet(`/api/revision/${wikiRevId}`)
        .reply(function(_) {
          return [200, mockedRes];
        });
  }

  function mockInteractions(wikiRevId, items:InteractionProps[]) {
    const mockedRes = items;
    store.$mock
        .onGet(`/api/interaction/beta/${wikiRevId}`)
        .reply(function(_) {
          return [200, mockedRes];
        });
  }

  function mockFetchDiff(wikiRevId, diffHtml) {
    const mockedRes = { compare: { '*' : diffHtml } };
    const [wiki, revId] = parseWikiRevId(wikiRevId);
    store.$mock
        .onGet(MwActionApiClient2.endPoint(wiki), {
          params: { 
            'action': 'compare',
            'format': 'json',
            'origin': '*',
            'fromrev': revId,
            'torelative': 'prev'
          } })
        .reply(function (_) {
          // const c = new MwActionApiClient2();
          // const ret = await c.fetchDiff(wiki, revId);

          return [200, mockedRes];
        });
  }

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
      expect(store.getters['feed2/getHeadItem']()).toBe(undefined);

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
      await new Promise((resolve, reject) => {
        const mutations = [];
        const unsubscribe = store.subscribe((mutation, state) => {
          unsubscribe();
          resolve(mutations);
        });
        store.dispatch('feed2/loadMoreWikiRevIds');
      });

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

    it('MOCK should handle failed loadMoreWikiRevIds', async () => {
      store.$mock
          .onAny()
          .reply(function(_) {
            return [404];
          });
      expect(store.state.feed2.reviewQueue.length).toBe(0);
      await store.dispatch('feed2/loadMoreWikiRevIds');
      expect(store.state.feed2.reviewQueue.length).toBe(0);
    });

    it('MOCK should handle loadMoreWikiRevIds when there is empty revIds', async () => {
      mockFeed('lastbad', []);
      expect(store.state.feed2.reviewQueue.length).toBe(0);
      await store.dispatch('feed2/loadMoreWikiRevIds');
      expect(store.state.feed2.reviewQueue.length).toBe(0);
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

      // Verify add to cache
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

      // Verify cached content
      const wikiRevId = 'enwiki:9990001';
      const cachedItem = store.getters['feed2/getFromCache'](wikiRevId);
      expect(wikiRevId).toBe('enwiki:9990001');
      expect(cachedItem.pageId).toBe(10001);
      expect(cachedItem.summary).toBe('Some good edits');

      expect(state.feed2.cache['enwiki:9990001']).toEqual(cachedItem);
      store.commit('feed2/removeFromCache', wikiRevId);
      expect(state.feed2.cache['enwiki:9990001']).toStrictEqual(undefined);
      expect(state.feed2.cache).toStrictEqual({});

      // re-add to Cache
      store.commit('feed2/addToCache', { key: 'enwiki:9990001', value: item });
      
      // Verify clearCache
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

  describe('Upon fetch revision action', () => {
    test('should dispatch action to fetching diff and interaction and commit them.', done => {
      const wikiRevId = 'enwiki:9990001';
      const actions = [];
      const mutations = [];

      store.subscribeAction((action, state) => actions.push(action));
      store.subscribe((mutation, state) => mutations.push(mutation));
      mockRevision('enwiki:9990001', {
        title: 'John Smith',
        pageId: 10001,
        comment: 'Some good edits',
        user: 'GoodGuy',
        timestampStr: '2020-11-10T00:18:07‎'
      });

      mockInteractions(wikiRevId, [{
        feed: 'lastbad',
        wikiRevId,
        judgement: 'ShouldRevert',
      } as InteractionProps]);

      mockFetchDiff(wikiRevId, '<tr></tr>');

      store.dispatch('feed2/fetchRevision', wikiRevId);
      setTimeout(() => {
        expect(mutations.length).toBe(2);
        expect(mutations[0].type).toBe('feed2/cacheInteractions');
        expect(mutations[1].type).toBe('feed2/cacheDiffHtml');

        expect(actions.length).toBe(3);
        expect(actions[0].type).toBe('feed2/fetchRevision');
        expect(actions[1].type).toBe('feed2/fetchDiff');
        expect(actions[2].type).toBe('feed2/fetchInteractions');

        done();
      }, 500);
    });
    test('should handle failure of fetchDiff.', (done) => {
      const wikiRevId = 'enwiki:9990001';
      const actions = [];
      const mutations = [];

      store.subscribeAction((action, state) => actions.push(action));
      store.subscribe((mutation, state) => mutations.push(mutation));

      store.dispatch('feed2/fetchRevision', wikiRevId);
      mockRevision('enwiki:9990001', {
        title: 'John Smith',
        pageId: 10001,
        comment: 'Some good edits',
        user: 'GoodGuy',
        timestampStr: '2020-11-10T00:18:07‎'
      });

      mockInteractions(wikiRevId, [{
        feed: 'lastbad',
        wikiRevId,
        judgement: 'ShouldRevert',
      } as InteractionProps]);

      // mockFetchDiff(wikiRevId, '<tr></tr>');  // we are obmitting the mockFetchDiff so it generate a 404
      setTimeout(() => {
        expect(mutations.length).toBe(1);
        expect(mutations[0].type).toBe('feed2/cacheInteractions');

        expect(actions.length).toBe(3);
        expect(actions[0].type).toBe('feed2/fetchRevision');
        expect(actions[1].type).toBe('feed2/fetchDiff');
        expect(actions[2].type).toBe('feed2/fetchInteractions');

        done();
      }, 1000);

    });
    it('should handle failure of fetchInteraction', (done) => {
      const wikiRevId = 'enwiki:9990001';
      const actions = [];
      const mutations = [];

      store.subscribeAction((action, state) => actions.push(action));
      store.subscribe((mutation, state) => mutations.push(mutation));

      store.dispatch('feed2/fetchRevision', wikiRevId);
      mockRevision('enwiki:9990001', {
        title: 'John Smith',
        pageId: 10001,
        comment: 'Some good edits',
        user: 'GoodGuy',
        timestampStr: '2020-11-10T00:18:07‎'
      });

      // We comment out the following
      // to EXPLICITLY obmit the mockFetchInteraction 
      // so it generate a 404
      // mockInteractions(wikiRevId, [{ 
      //   feed: 'lastbad',
      //   wikiRevId,
      //   judgement: 'ShouldRevert',
      // } as InteractionProps]);

      mockFetchDiff(wikiRevId, '<tr></tr>');  
      setTimeout(() => {
        expect(mutations.length).toBe(1);
        expect(mutations[0].type).toBe('feed2/cacheDiffHtml');

        expect(actions.length).toBe(3);
        expect(actions[0].type).toBe('feed2/fetchRevision');
        expect(actions[1].type).toBe('feed2/fetchDiff');
        expect(actions[2].type).toBe('feed2/fetchInteractions');

        done();
      }, 1000);
    });
  });

  describe('skipMap', () => { 
    it('should handle add, remove and clear skipMap', () => {
      const wikiRevId1 = 'enwiki:9901';
      const wikiRevId2 = 'enwiki:9902';
      const wikiRevId3 = 'enwiki:9903';
      
      expect(store.state.feed2.skipMap).toStrictEqual({});      
      
      store.commit('feed2/addToSkipMap', wikiRevId1);
      store.commit('feed2/addToSkipMap', wikiRevId2);
      store.commit('feed2/addToSkipMap', wikiRevId3);
      
      expect(store.state.feed2.skipMap[wikiRevId1]).toEqual(true);     
      expect(store.state.feed2.skipMap[wikiRevId2]).toEqual(true);      
      expect(store.state.feed2.skipMap[wikiRevId3]).toEqual(true);       
      
      store.commit('feed2/removeFromSkipMap', wikiRevId1);

      expect(store.state.feed2.skipMap[wikiRevId1]).toEqual(undefined);
      expect(store.state.feed2.skipMap[wikiRevId2]).toEqual(true);      
      expect(store.state.feed2.skipMap[wikiRevId3]).toEqual(true);     

      store.commit('feed2/clearSkipMap');
      expect(store.state.feed2.skipMap[wikiRevId1]).toEqual(undefined);
      expect(store.state.feed2.skipMap[wikiRevId2]).toEqual(undefined);
      expect(store.state.feed2.skipMap[wikiRevId3]).toEqual(undefined);
    });
  });
});