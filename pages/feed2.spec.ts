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

const localVue = createLocalVue();

localVue.use(Vuex);

describe('FeedPage2', () => {
  
  describe('upon Mount', () => {
    let store;
    let wrapper;
    let getters;
    let getHeadMock = jest.fn();

    beforeEach(() => {
      getHeadMock = jest.fn();
      getters = {
        'feed2/getHead': (state) => getHeadMock
      };

      store = new Vuex.Store({
        getters,
        actions: { 'feed2/loadMoreWikiRevIds': () => { } }
      });

      wrapper = shallowMount(FeedPage2, {
        store, localVue,
        stubs: ['pure-feed-2']
      });
    });

    test('should appear as visible.', () => {
      expect(wrapper.isVisible()).toBe(true);
    });

    [
      'should load revision from store',
      'should load revision diff from store',
      'should load interactions from store',
      'should load set props based on revision and interaction',
    ].forEach(desc => it.todo(desc));
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
