<template>
    <section>
        <h1 v-if="feedName"> {{$t('Label-ReviewFeed')}}<sup class="text-warning">β</sup> {{feedName}} </h1>
        <template v-if="!loading">
          <div v-if="currentWikiRevId && revisionPanelItems[currentWikiRevId]" class="card shadow h-100">
            <RevisionPanel
              :key="currentWikiRevId"
              :item="revisionPanelItems[currentWikiRevId]"
              :feed-name="wikiRevIdfromFeeds[currentWikiRevId]"
            >
            </RevisionPanel>

            <ActionPanel ref="actionPanel"
              :key="`action-panel-${currentWikiRevId}`"
              :wikiRevId="currentWikiRevId"
              :title="revisionPanelItems[currentWikiRevId].title"
              :feed="wikiRevIdfromFeeds[currentWikiRevId]"
              @judgement-event="$refs.judgementPanel && $refs.judgementPanel.refresh()"
              @next-card="showNext()"/>
            <template v-if="currentWikiRevId && revisionPanelItems[currentWikiRevId]">
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
                <h5 m-5> <span v-html="$t('Message-FeedHasNoNewRevisionsClickNextBelow', [
                  `<div class='badge badge-success'>${wikiRevIdfromFeeds[currentWikiRevId] || feedName}</div>`])"></span> </h5>
                <button v-if="feedName==='mix'" @click="showNext()" class="m-5 btn btn-outline-success">
                  {{$t(`Button-Next`)}}(→)
                </button>
                <a v-else class="btn btn-primary" href="/">
                  {{$t('Label-Home')}}
                </a>
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
    import { fetchRevisionPanelItem } from '~/shared/utility-shared';
    const QUEUE_LIMIT = 3;
    export default {
    components: {
      RevisionPanel,
      ActionPanel,
      JudgementPanel
    },
    data() {
      return {
          title: 'WikiLoop DoubleCheck',
          currentWikiRevId: null,
          feedQueue: [],
          revisionPanelItems: {},
          wikiRevIdfromFeeds: {},
          tipLoginCountDown: 5,
          loading:true,
          showJudgementPanel: false,
      }
    },
    computed: {
    },
    methods: {
      async showNext() {
        this.loading = true;
        this.showJudgementPanel = false;
        if (this.feedQueue.length <= 1) {
          await this.refillQueue();
        }
        this.currentWikiRevId = this.feedQueue.shift();
        this.loading = false;
        this.refillQueue().then(()=>{console.log(`Quietly refilled the queue.`)});
      },
      clearQueue: async function() {
        this.loading = true;
        this.showJudgementPanel = false;
        this.feedQueue = [];
        this.revisionPanelItems = {};
      },
      fetchAndClaimRevisions: async function(numToFetch:number):Promise<string[]/*wikiRevIds*/> {
        let queryObj:any = {
            limit:numToFetch,
            wiki:this.$store.state.wiki,
            feed: this.feedName,
            userGaId:this.$cookiez.get('_ga'),
        };
        if (this.$store.state.user?.profile?.displayName) queryObj.wikiUserName = this.$store.state.user?.profile?.displayName;
        let params = new URLSearchParams(queryObj);
        let result = await this.$axios.$get(`/api/feed/${this.feedName}?${params.toString()}`);
        let feed = result.feed;
        result.wikiRevIds.forEach(wikiRevId => this.wikiRevIdfromFeeds[wikiRevId] = feed);
        return result.wikiRevIds;
      },
      refillQueue: async function() {
        let numToFetch = QUEUE_LIMIT-this.feedQueue.length;
        let wikiRevIds = await this.fetchAndClaimRevisions(numToFetch);
        this.feedQueue.push(...wikiRevIds);
        await Promise.all(wikiRevIds.map( async wikiRevId => {
          let item = await fetchRevisionPanelItem(wikiRevId, this.$axios);
          this.revisionPanelItems[wikiRevId] = item;
        }));
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
    },
    async mounted() {
      document.addEventListener(`wiki-change-started`, async() => {
        await this.clearQueue();
      });
      document.addEventListener(`wiki-change-completed`, async () => {
        await this.refillQueue();
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

      await this.showNext();
    }
  }
</script>

<style>

</style>
