<template>
    <section>
        <h1 v-if="feedName"> Review Feed<sup class="text-warning">β</sup> {{feedName}} </h1>
        <template v-if="currentWikiRevId">
          <div class="card shadow h-100">
            <RevisionPanel
              :key="currentWikiRevId"
              :item="currentRevisionPanelItem"
              :feed-name="currentFeedItem.feed"
            >
            </RevisionPanel>
            <ActionPanel ref="actionPanel"
              :key="`action-panel-${currentWikiRevId}`"
              :wikiRevId="currentWikiRevId"
              :title="currentRevisionPanelItem.title"
              @next-card="showNext()"/>
          </div>
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
    import {RevisionPanelItem} from "@/shared/interfaces";
    import RevisionPanel from "~/components/RevisionPanel.vue";
    import ActionPanel from "~/components/ActionPanel.vue";

    export default {
    components: {
      RevisionPanel,
      ActionPanel
    },
    data() {
      return {
          title: 'WikiLoop Battlefield',
          currentWikiRevId: null,
          currentFeedItem: null,
          currentRevisionPanelItem: <RevisionPanelItem>null,
          nextFeedItem: null,
          nextWikiRevId: null,
          nextRevisionPanelItem: null,
          tipLoginCountDown: 5,
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
        if (this.nextWikiRevId) {
          this.currentFeedItem = this.nextFeedItem;
          this.currentWikiRevId = this.nextWikiRevId;
          this.currentRevisionPanelItem = this.nextRevisionPanelItem;
        } else {
          let newFeedItem = await this.$axios.$get(`/api/feed/${this.feedName}?limit=1`);
          let newWikiRevId = `enwiki:${newFeedItem.revIds[0]}`;
          let newRevisionPanelItem = await this.fetchRevisionPanelItem(newWikiRevId);
          this.currentFeedItem = newFeedItem;
          this.currentWikiRevId = newWikiRevId;
          this.currentRevisionPanelItem = newRevisionPanelItem;
        }

        let newFeedItem = await this.$axios.$get(`/api/feed/${this.feedName}?limit=1`);
        let newWikiRevId = `enwiki:${newFeedItem.revIds[0]}`;
        let newRevisionCardItem = await this.fetchRevisionPanelItem(newWikiRevId);
        this.nextFeedItem = newFeedItem;
        this.nextWikiRevId = newWikiRevId;
        this.nextRevisionPanelItem = newRevisionCardItem;
      },
      fetchRevisionPanelItem: async function(wikiRevId):Promise<RevisionPanelItem> {
        let [revision, diff] = await Promise.all([
          await this.$axios.$get(`/api/revision/${wikiRevId}`),
          await this.$axios.$get(`/api/diff/${wikiRevId}`)
        ]);
        let diffHtml = diff?.compare['*'] || '';
        return <RevisionPanelItem> {
          wiki: revision.wiki,
          revId: revision.revid,
          title: revision.title,
          pageId: revision.wki,
          summary: revision.comment,
          author: revision.user,
          timestamp: new Date(revision.timestamp).getTime()/1000,
          diffHtml: diffHtml,
        };
      },
      snoozeTipLogin: function() {
        this.tipLoginCountDown = 15;
        this.$bvModal.hide(`modal-promote-login`);
      },

    },
    validate ({ params }) {
      return (['us2020', 'covid19', 'recent', 'ores', 'mix', 'wikitrust'].indexOf(params.feed) >= 0);
    },

    async asyncData ({ params, $axios }) {
      return { feedName: params.feed };
    },
    async beforeMount() {
        await this.showNext();
    },
    async mounted() {
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
            await this.$refs.actionPanel.interactionBtn(`ShouldRevert`);
            break;
          case 'KeyG':
            await this.$refs.actionPanel.interactionBtn(`LooksGood`);
            break;
          case 'KeyP':
            await this.$refs.actionPanel.interactionBtn(`NotSure`);
            break;
          case 'KeyR':
            await this.$refs.actionPanel.performRevert();
            break;
          case 'ArrowLeft':
            this.$refs.actionPanel.undo();
            break;
          case 'ArrowRight':
            if (this.$refs.actionPanel && this.$refs.actionPanel.myJudgement) this.showNext();
            else await this.$refs.actionPanel.interactionBtn(`NotSure`);
            break;
          case 'PageUp':
            this.$refs.actionPanel.$el.querySelector(`.diff-card`).scrollBy(0, -200);
            break;
          case 'PageDown':
            this.$refs.actionPanel.$el.querySelector(`.diff-card`).scrollBy(0, 200);
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
