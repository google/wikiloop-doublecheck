<template>
  <section class="wldc-legacy-review w-100 h-100">
    <template v-if="currentWikiRevId">
      <RevisionCard
        ref="revisionCard"
        :key="currentWikiRevId"
        :wiki-rev-id="currentWikiRevId"
        :diff-prop="currentDiff"
        :ores-prop="currentOres"
        :interaction-prop="currentInteraction"
        :revision-prop="currentRevision"
        :feed-name-prop="`index`"
        class="wldc-review-card container-sm"
        @next-card="showNext()"
      />
    </template>

    <b-modal id="modal-promote-login" :title="$t('Label-PromptLogin')">
      {{ $t('Message-PromptLogin') }} <br>
      <template #modal-footer="{ ok, hide }">
        <a class="btn-sm btn btn-primary" href="/auth/mediawiki/login">{{
          $t('Label-Login')
        }}</a>
        <b-button size="sm" variant="secondary" @click="snoozeTipLogin()">
          {{ $t('Label-Snooze') }}
        </b-button>
      </template>
    </b-modal>
  </section>
</template>

<script lang="ts">
import RevisionCard from '@/components/RevisionCard.vue';
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export default {
  components: {
    RevisionCard,
  },
  data() {
    return {
      title: 'WikiLoop Battlefield',
      currentWikiRevId: null,
      tipLoginCountDown: 0,
    };
  },
  computed: {
    currentDiff: {
      get() {
        return this.$store.state.revisions.wikiRevIdToMeta[
            this.currentWikiRevId
        ].diff;
      },
    },
    currentRevision: {
      get() {
        return this.$store.state.revisions.wikiRevIdToMeta[
            this.currentWikiRevId
        ];
      },
    },
    currentInteraction: {
      get() {
        return this.$store.state.revisions.wikiRevIdToMeta[
            this.currentWikiRevId
        ].interaction;
      },
    },
    currentOres: {
      get() {
        const ores = this.$store.state.revisions.wikiRevIdToMeta[
            this.currentWikiRevId
        ].ores;
        return ores;
      },
    },
  },
  async beforeMount() {
    const dice = Math.random() * 100;
    const threshold = parseInt(this.$env.MIXER_RAMP_UP_PERCENT) || 0;
    if (
      ['enwiki', 'testwiki'].includes(this.$store.state.wiki) &&
      dice < threshold
    ) {
      this.$router.push('/feed/mix');
      console.log(`Redirect to /feed/mix dice=${dice}, threshold=${threshold}`);
    }
  },
  async mounted() {
    await this.$store.dispatch('revisions/loadMoreWikiRevs');
    // when wiki changes, go to the next diff instead of
    // keeping the existing diff in the previously selected wiki
    document.addEventListener('wiki-change-completed', async () => {
      await this.showNext();
    });
    this.showNext();

    document.addEventListener('judgement-event', async () => {
      if (!(this.$store.state.user && this.$store.state.user.profile)) {
        if (this.tipLoginCountDown === 0) {
          this.$bvModal.show('modal-promote-login');
        } else {
          this.tipLoginCountDown--;
        }
      }
    });

    window.addEventListener('keyup', async (e) => {
      switch (e.code) {
      case 'KeyV':
        await this.$refs.revisionCard.interactionBtn('ShouldRevert');
        break;
      case 'KeyG':
        await this.$refs.revisionCard.interactionBtn('LooksGood');
        break;
      case 'KeyP':
        await this.$refs.revisionCard.interactionBtn('NotSure');
        break;
      case 'KeyR':
        await this.$refs.revisionCard.performRevert();
        break;
      case 'ArrowRight':
        if (this.$refs.revisionCard && this.$refs.revisionCard.myJudgement) {this.showNext();} else {await this.$refs.revisionCard.interactionBtn('NotSure');}
        break;
      case 'PageUp':
        this.$refs.revisionCard.$el
            .querySelector('.diff-card')
            .scrollBy(0, -200);
        break;
      case 'PageDown':
        this.$refs.revisionCard.$el
            .querySelector('.diff-card')
            .scrollBy(0, 200);
        break;
      }
      if (e.key === '?') {
        // Show key screen
        this.$bvModal.show('modal-keymap');
      }
    });
  },
  methods: {
    async showNext() {
      this.currentWikiRevId = this.$store.state.revisions.nextWikiRevIdsHeap.peek();
      this.$store.commit('revisions/pop');
      // await this.$store.dispatch(`revisions/loadMoreWikiRevs`).then();
      /* unawait */ this.$store.dispatch('revisions/preloadAsyncMeta').then();
    },
    snoozeTipLogin() {
      this.tipLoginCountDown = 15;
      this.$bvModal.hide('modal-promote-login');
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'bootstrap/scss/_functions.scss';
@import 'bootstrap/scss/_variables.scss';
@import 'bootstrap/scss/_mixins.scss';
.wldc-legacy-review {
  display: grid;
  align-items: center;
  justify-items: center;
}
.wldc-review-card {
  min-height: 80%;
  max-height: 100%;
  display: grid;
  align-items: center;
  justify-items: center;

  @include media-breakpoint-down(lg) {
    min-height: 90%;
  }
  @include media-breakpoint-down(md) {
    min-height: 100%;
  }
}
</style>
