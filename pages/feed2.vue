<template>
  <div>
    <pure-feed-2
      :infoLoaded="infoLoaded"
      :diffLoaded="diffLoaded"
      :item="item"
      :judgement="judgement"
      :judgementPending="judgementPending"
      :interactions="interactions"
      :showJudgementPanel="showJudgementPanel"
      :eligibleForRevert="eligibleForRevert"
      :gCanDirectEdit="gCanDirectEdit"
      @judgement="onJudgement"
      @revert="onRevert"
      @next="onNext"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import PureRevisionPanel from '~/components/PureRevisionPanel.vue';
import { MwActionApiClient2 } from '~/shared/mwapi2';
import { wikiToDomain } from '~/shared/utility-shared';

  @Component({
    components: {
      PureRevisionPanel,
    },
  })
export default class FeedPage2 extends Vue {
  public judgement:string = '';
  public judgementPending:boolean = false;
  public showJudgementPanel:boolean = false;
  public interactions = []; // TODO get interactions;
  public unsubscribe = null;
  public item = null;
  $t: any;
  $env: any;

  private beforeCreate() {

  }

  async mounted() {
    const started = new Date();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      this.item = this.$store.getters['feed2/getHead']();
    });
    this.item = this.$store.getters['feed2/getHead']();
    await this.$store.dispatch('feed2/loadMoreWikiRevIds');
  }

  beforeDestroy() {
    this.unsubscribe();
  }

  get infoLoaded() {
    return !!this.item;
  }

  get diffLoaded() {
    return !!(this.item?.diffHtml); // TODO: add Diff.
  }

  get eligibleForRevert() {
    return this.judgement === 'ShouldRevert'; // TODO add
  }

  get gCanDirectEdit() {
    return false; // TODO determine whether we can direct edit;
  }

  private getRevertUrl() {
    const revertEditSummary = this.$t(
      'Message-RevertEditSummary',
      [
        '[[:m:WikiLoop DoubleCheck]]',
        `${'v5.0.0'}`, // TODO set version
        `http://${this.$env?.PUBLIC_HOST || 'doublecheck.wikiloop.org'}/revision/${this.item.wiki}/${this.item.revId}`,
      ]);
    const params = new URLSearchParams({
      title: this.item.title,
      action: 'edit',
      undoafter: 'prev',
      /* TODO(xinbenlv): this is a hack, until we standardize the revision interface */
      undo:this.item.revId,
      summary: revertEditSummary
    });
    return `${MwActionApiClient2.webEndPoint(this.item.wiki)}?${params.toString()}`;
  }

  onJudgement(judgement) {
    this.judgement = judgement;
  }

  onRevert() {
    if (this.gCanDirectEdit) {
      // TODO do direct revert
    } else {
      window.open(this.getRevertUrl(), '_blank');
    }
  }

  onNext() {
    // TODO send next request
  }
}
</script>

<style lang="scss" scoped></style>
