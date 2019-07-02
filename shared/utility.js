export default {
  getUrlBase: function (newRecentChange) {
    let lang = {
      'enwiki': 'en',
      'frwiki': 'fr',
      'ruwiki': 'ru'
    };
    return `http://${lang[newRecentChange.wiki]}.wikipedia.org`;
  },
  fetchDiff: async function(recentChange) {
    let diffApiUrl = `/api/diff?serverUrl=${this.getUrlBase(recentChange)}/&revId=${recentChange.revision.new}`;
    let diffJson = await this.$axios.$get(diffApiUrl);
    recentChange.diff = diffJson;
  },
}
