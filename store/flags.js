export const state = () => ({
  flags: null
});

export const mutations = {
  setFlags (state, flagObject) {
    state.flags = flagObject;
  },
  clearFlags (state, ) {
    state.flags = null
  },

};

export const actions = {
  async nuxtServerInit({ commit, state }) {
    const flags = await this.$axios.$get(`/api/flags`);
    commit('setFlags', flags);
  }
};
