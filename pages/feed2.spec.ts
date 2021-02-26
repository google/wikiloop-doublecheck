// Copyright 2021 Google LLC
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
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import FeedPage2 from '@/pages/feed2.vue';
import { InteractionProps } from '~/shared/models/interaction-item.model';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('FeedPage2', () => {
  
  describe('upon Mount', () => {
    let store;
    let wrapper;
    let getters;
    let getHeadItemMock = jest.fn();

    test('should load revision from store', () => {
      getHeadItemMock = jest.fn();
      getters = {
        'feed2/getHeadItem': (state) => getHeadItemMock
      };

      store = new Vuex.Store({
        getters,
        actions: { 'feed2/loadMoreWikiRevIds': () => { } }
      });

      wrapper = shallowMount(FeedPage2, {
        store, localVue,
        stubs: ['pure-feed-2']
      });

      expect(getHeadItemMock.mock.calls.length > 0)
          .toBe(true); // one from initialization and one from subscribe to mutation

    });

    test('should props based on the revision on getHeadItem from store cache', () => {
      getHeadItemMock = jest.fn();

      getHeadItemMock.mockReturnValue({
        wiki: 'fakewiki',
        revId: 99900123, // fake revId
        title: 'Fake article',
        // pageId: revision.pageid, TODO add back pageId if exist
        summary: 'Fake edit summary',
        author: 'FakeEditor',
        timestamp: 1614284382, // fake Unix Epoch
        diffHtml: '<tr></tr>',
        interactions: [
          {
            feed: 'fakeFeed',
            wikiRevId: 'fakewiki:99900123', // fakeWikiRevId
            userGaId: 'fakeReviewer1GaId',
            wikiUserName: 'FakeReviewer1',
            judgement: 'ShouldRevert',
            timestamp: 1614284382,
            title: 'Fake article',
            wiki: 'fakewiki',
          } as InteractionProps,
          {
            feed: 'fakeFeed',
            wikiRevId: 'fakewiki:99900123', // fakeWikiRevId
            userGaId: 'fakeReviewer2GaId',
            wikiUserName: 'FakeReviewer2',
            judgement: 'LooksGood',
            timestamp: 1614284382,
            title: 'Fake article',
            wiki: 'fakewiki',
          } as InteractionProps,
        ],
      });

      getters = {
        'feed2/getHeadItem': (state) => getHeadItemMock
      };

      store = new Vuex.Store({
        getters,
        actions: { 'feed2/loadMoreWikiRevIds': () => { } }
      });

      wrapper = shallowMount(FeedPage2, {
        store, localVue,
        stubs: ['pure-feed-2']
      });

      expect(wrapper.vm.interactions.length).toBe(2);
      expect(wrapper.vm.interactions[0].wikiUserName).toBe('FakeReviewer1');
      expect(wrapper.vm.interactions[0].judgement).toBe('ShouldRevert');
      expect(wrapper.vm.interactions[1].wikiUserName).toBe('FakeReviewer2');
      expect(wrapper.vm.interactions[1].judgement).toBe('LooksGood');
    });

  });

  describe('upon judgement', () => {
    it.todo('should post API to api and show next button.');

    describe('with different Judgement type', () => {
      it.todo('should handle LooksGood judgement by request PureFeed2 to display thankful button.');

      it.todo('should handle NotSure judgement and show an option for second opinion.');

      describe('for ShouldRevert judgement', () => {
        it.todo('should show "Revert Now" button.');

        it.todo('should display link if this WLDC instance cannot edit directly.');

        it.todo('should not display a link if this WLDC instance can edit directly.');
      });
    });
  });
  
  describe('upon interaction in store', () => {
    it.todo('should update the interactions on the page');
  });
});
