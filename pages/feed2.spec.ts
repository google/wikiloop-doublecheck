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
  test('is a Vue instance', () => {
    const getters = {
      'feed2/getHead': (state) => () => {}
    };

    const store = new Vuex.Store({
      getters,
      actions: { 'feed2/loadMoreWikiRevIds': () => { } }
    });
    const wrapper = shallowMount(FeedPage2, {
      store, localVue,
      stubs: ['pure-feed-2']
    });
    expect(wrapper.isVisible()).toBe(true);
  });
});
