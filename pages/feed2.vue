<template>
  <div class="card">
    <pure-revision-panel
      :info-loaded="infoLoaded"
      :diff-loaded="diffLoaded"
      :item="item"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import PureRevisionPanel from '~/components/PureRevisionPanel.vue';

  @Component({
    components: {
      PureRevisionPanel,
    },
  })
export default class FeedPage2 extends Vue {
  // wikiRevId = "enwiki:989699374" // TODO update
  async asyncData({ store }) {
    store.commit('revpan2/setWikiRevId', 'enwiki:989699374');
    await store.dispatch('revpan2/loadInfo');
    await store.dispatch('revpan2/loadDiff');
  }

  get infoLoaded() {
    // TODO it seems it takes a while after mounted for this.$store to be defined.
    return this.$store?.state.revpan2.infoLoaded;
  }

  get diffLoaded() {
    // TODO it seems it takes a while after mounted for this.$store to be defined.
    return this.$store?.state.revpan2.diffLoaded;
  }

  get item() {
    return this.$store?.state.revpan2.item;
  }
}
</script>

<style lang="scss" scoped>

</style>
