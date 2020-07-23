<template>
    <section>
        <h1 v-if="feedName"> {{$t('Label-ReviewFeed')}}<sup class="text-warning">β</sup> {{feedName}} </h1>
        <template v-if="!loading">
          <div v-if="currentRevisionPanelItem" class="card shadow h-100">
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
              :feed="currentFeedItem.feed"
              @judgement-event="$refs.judgementPanel && $refs.judgementPanel.refresh()"
              @next-card="showNext()"/>
            <template v-if="currentWikiRevId">
              <button class="btn btn-outline-primary"
                v-if="!showJudgementPanel"
                @click="showJudgementPanel = !showJudgementPanel">{{$t('Button-ShowJudgements')}}</button>
              <JudgementPanel v-else ref="judgementPanel" class="card-body" :wikiRevId="currentWikiRevId" />
            </template>
          </div>
          <div v-else>
            <div class="card">
            <div class="card-body">
              <div class="card-body w-100 text-center">
                <h5 m-5>{{$t('Message-FeedHasNoNewRevisionsClickNextBelow', [
                  `<div class="badge badge-success">${currentFeedItem.feed}</div>`])}}</h5>
                <button @click="showNext()" class="m-5 btn btn-outline-success">
                  {{$t(`Button-Next`)}}(→)
                </button>
              </div>
            </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="card">
            <div class="card-body w-100 align-items-center d-flex" style="height: 500px;">
              <div class="w-100 text-center">
                <b-spinner label="Loading..."></b-spinner>
              </div>
            </div>
          </div>
        </template>

        <b-modal id="modal-promote-login" title="Tip: Login">
            {{$t('Message-Login')}}<br/>
            <template v-slot:modal-footer>
                <a class="btn-sm btn btn-primary" href="/auth/mediawiki/login">{{$t("Label-Login")}}</a>
                <b-button size="sm" variant="secondary" @click="snoozeTipLogin()">
                    {{$t("Label-Snooze")}}
                </b-button>
            </template>
        </b-modal>
    </section>
</template>

<script lang="ts">
    import {RevisionPanelItem} from "@/shared/interfaces";
    import RevisionPanel from "~/components/RevisionPanel.vue";
    import ActionPanel from "~/components/ActionPanel.vue";
    import JudgementPanel from "~/components/JudgementPanel.vue";

    export default {
    components: {
      RevisionPanel,
      ActionPanel,
      JudgementPanel
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
          loading:true,
          showJudgementPanel: false,
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
      getNewFeedItemAndInfo: async function() {
          let now = new Date();
          let newFeedItem = await this.$axios.$get(`/api/feed/${this.feedName}?limit=1&wiki=${this.$store.state.wiki}`);
          if (newFeedItem.wikiRevIds.length > 0) {
              let newWikiRevId = `${newFeedItem.wikiRevIds[0]}`;
              let newRevisionCardItem = await this.fetchRevisionPanelItem(newWikiRevId);
              return [newFeedItem, newWikiRevId, newRevisionCardItem];
          } else return [newFeedItem, null, null];
      },
      clearNext: async function() {
        this.loading = true;
        this.nextWikiRevId = null;
      },
      showNext: async function() {
        this.loading = true;
        if (this.nextWikiRevId) {
          // swap current with next
          [this.currentFeedItem, this.currentWikiRevId, this.currentRevisionPanelItem] =
          [this.nextFeedItem, this.nextWikiRevId, this.nextRevisionPanelItem];
        } else {
          [this.currentFeedItem, this.currentWikiRevId, this.currentRevisionPanelItem] = await this.getNewFeedItemAndInfo();
        }
        this.showJudgementPanel = false; // always set the show judgement panel to false when fetching a new revision.
        this.loading = false;
        [this.nextFeedItem, this.nextWikiRevId, this.nextRevisionPanelItem] = await this.getNewFeedItemAndInfo();

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
      return (['us2020', 'covid19', 'recent', 'ores', 'mix', 'wikitrust', 'lastbad'].indexOf(params.feed) >= 0);
    },
    async asyncData ({ params, $axios }) {
      return { feedName: params.feed };
    },
    async beforeMount() {
      await this.showNext();
    },
    async mounted() {
      document.addEventListener(`wiki-change-started`, async() => {
        await this.clearNext();
      });
      document.addEventListener(`wiki-change-completed`, async () => {
        await this.showNext();
      });

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
            await this.$refs.actionPanel?.interactionBtn(`ShouldRevert`);
            break;
          case 'KeyG':
            await this.$refs.actionPanel?.interactionBtn(`LooksGood`);
            break;
          case 'KeyP':
            await this.$refs.actionPanel?.interactionBtn(`NotSure`);
            break;
          case 'KeyR':
            await this.$refs.actionPanel?.performRevert();
            break;
          case 'ArrowLeft':
            this.$refs.actionPanel?.undo();
            break;
          case 'ArrowRight':
            await this.showNext();
            break;
          case 'PageUp':
            this.$refs.actionPanel?.$el.querySelector(`.diff-card`).scrollBy(0, -200);
            break;
          case 'PageDown':
            this.$refs.actionPanel?.$el.querySelector(`.diff-card`).scrollBy(0, 200);
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
