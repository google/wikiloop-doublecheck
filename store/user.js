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

export const state = () => ({
  profile: null,
  preferences: null,
});

export const mutations = {
  setProfile(state, value) {
    state.profile = value;
  },
  clearProfile(state) {
    state.profile = null;
  },
  setPreferences(state, value) {
    state.preferences = value;
  },
};

export const actions = {
  async updateWikiPreference({ commit }, wiki) {
    const preferences = await this.$axios.$post(
      '/api/auth/user/preferences', { wiki });
    commit('setPreferences', preferences);
  },
};
