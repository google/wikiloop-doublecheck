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
import { NuxtCookies } from '~/node_modules/cookie-universal-nuxt';
import { BasicJudgement } from '~/shared/interfaces';
import { InteractionProps } from '~/shared/models/interaction-item.model';

  @Component({
    name: 'FeedPage2',
    components: {
      PureRevisionPanel,
    },
  })
export default class FeedPage2 extends Vue {
  public feed:string; // TODO add feed
  public judgement:string = '';
  public judgementPending:boolean = false;
  public showJudgementPanel:boolean = false;
  public interactions = []; // TODO get interactions;
  public unsubscribe = null;
  public item = null;
  $t: any;
  $config: any;
  $cookiez: NuxtCookies; // TODO remove after dep resolved https://github.com/microcipcip/cookie-universal/issues/63

  private beforeMount() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      this.item = this.$store.getters['feed2/getHead']();
    });
    this.item = this.$store.getters['feed2/getHead']();
  }

  async mounted() {
    await this.$store.dispatch('feed2/loadMoreWikiRevIds');
    
  }

  beforeDestroy() {
    this.unsubscribe();
  }

  get wikiRevId() {
    return this.item ? `${this.item.wiki}:${this.item.revId}` : null;
  }

  get infoLoaded() {
    return !!this.item;
  }

  get diffLoaded() {
    return !!(this.item?.diffHtml); // TODO: add Diff.
  }

  get eligibleForRevert() {
    // TODO add logic to check that 
    //   1. the revision is the last revision
    //   2. the 2nd last revision is not from the same author.
    return this.judgement === 'ShouldRevert';
  }

  get gCanDirectEdit() {
    return false; // TODO determine whether we can direct edit;
  }

  private getRevertUrl() {
    const revertEditSummary = this.$t(
      'Message-RevertEditSummary',
      [
        '[[:m:WikiLoop DoubleCheck]]',
        `${this.$store.state.version}`, // TODO set version
        `http://${this.$config?.PUBLIC_HOST || 'doublecheck.wikiloop.org'}/revision/${this.item.wiki}/${this.item.revId}`,
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

  async onJudgement(judgement) {
    this.judgementPending = true;
    await this.postJudgement(judgement);
    this.judgementPending = false;
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

  private async postJudgement(judgement: string) {
    const userGaId = this.$cookiez.get('_ga');

    // TODO: should we require so much information? Or should we just use simplified data
    const postBody = {
      userGaId,
      judgement,
      timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
      wikiRevId: this.wikiRevId,
      feed: this.$store.state.feed2.feed,
      title: this.item.title,
      wiki: this.item.wiki,
    } as InteractionProps;

    if (this.$store.state?.user?.profile) {
      const wikiUserName = this.$store.state.user.profile.displayName;
      postBody.wikiUserName = wikiUserName;
    }
    
    await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
  }
}
</script>

<style lang="scss" scoped></style>
