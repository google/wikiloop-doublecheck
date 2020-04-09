
<template>
    <section>
        <h1 v-if="feedName"> Review Feed<sup class="text-warning">β</sup> {{feedName}} </h1>
        <template v-if="currentWikiRevId">
            <RevisionCard ref="revisionCard"
                          :wikiRevId="currentWikiRevId"
                          :key="currentWikiRevId"
                          :feed-name-prop="`${feedItem.feed}`"
                          :from-mixer-prop="`${feedItem.userMixer}`"
                          v-on:next-card="showNext()"
            ></RevisionCard>
        </template>

        <b-modal id="modal-promote-login" title="Tip: Login">
            Do you know you could Login and preserve your labels under your name?
            We support Login with Wikipedia account through Oauth. <br/>
            <template v-slot:modal-footer="{ ok, hide }">
                <a class="btn-sm btn btn-primary" href="/auth/mediawiki/login">Login</a>
                <b-button size="sm" variant="secondary" @click="snoozeTipLogin()">
                    Snooze
                </b-button>
            </template>
        </b-modal>
    </section>
</template>

<script lang="ts">
  import RevisionCard from '~/components/RevisionCard.vue';
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  export default {
    components: {
      RevisionCard
    },
    data() {
      return {
        title: 'WikiLoop Battlefield',
        currentWikiRevId: null,
        tipLoginCountDown: 0,
        feedItem: null,
      }
    },
    computed: {
      currentRevision: {
        get () {
          return this.$store.state.revisions.wikiRevIdToMeta[this.currentWikiRevId];
        }
      },
    },
    methods: {
      showNext: async function() {
        this.feedItem = await this.$axios.$get(`/api/feed/${this.feedName}?limit=1`);
        this.currentWikiRevId = `enwiki:${this.feedItem.revIds[0]}`;
      },
      snoozeTipLogin: function() {
        this.tipLoginCountDown = 15;
        this.$bvModal.hide(`modal-promote-login`);
      },

    },
    validate ({ params }) {
      return (['us2020', 'covid19', 'recent', 'ores', 'mix'].indexOf(params.feed) >= 0);
    },

    async asyncData ({ params }) {
      return { feedName: params.feed };
    },
    async mounted() {
      this.showNext();

      document.addEventListener('judgement-event', async () => {
        if (!(this.$store.state.user &&this.$store.state.user.profile)) {
          if (this.tipLoginCountDown === 0) {
            this.$bvModal.show(`modal-promote-login`);
          } else {
            this.tipLoginCountDown --;
          }
        }
      });

      window.addEventListener("keyup", async e => {
        switch (e.code) {
          case 'KeyV':
            await this.$refs.revisionCard.interactionBtn(`ShouldRevert`) ;
            break;
          case 'KeyG':
            await this.$refs.revisionCard.interactionBtn(`LooksGood`);
            break;
          case 'KeyP':
            await this.$refs.revisionCard.interactionBtn(`NotSure`);
            break;
          case 'KeyR':
            await this.$refs.revisionCard.performRevert();
            break;
          case 'ArrowRight':
            if (this.$refs.revisionCard && this.$refs.revisionCard.myJudgement) this.showNext();
            else await this.$refs.revisionCard.interactionBtn(`NotSure`);
            break;
          case 'PageUp':
            this.$refs.revisionCard.$el.querySelector(`.diff-card`).scrollBy(0, -200);
            break;
          case 'PageDown':
            this.$refs.revisionCard.$el.querySelector(`.diff-card`).scrollBy(0, 200);
            break;

        }
        if (e.key === '?') {
          // Show key screen
          this.$bvModal.show(`modal-keymap`);
        }
      });
    }
  }
</script>

<style>

</style>
