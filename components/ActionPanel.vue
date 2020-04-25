import {WikiActionType} from "~/shared/interfaces";
<template>
  <section>
    <div class="card-body">
      <div class="d-flex justify-content-center">
        <template v-if="!myJudgement">
          <div class="btn-group mx-1">
            <button
              v-on:click="interactionBtn(`LooksGood`)"
              class="btn btn-sm btn-outline-success"
            >{{$t(`LooksGoodBtnLabel`)}} (g)
            </button>
            <button
              v-on:click="interactionBtn(`NotSure`)"
              class="btn btn-sm btn-outline-secondary">
              {{$t(`NotSureBtnLabel`)}} (p)
            </button>
            <button
              v-on:click="interactionBtn(`ShouldRevert`)"
              class="btn btn-sm btn-outline-danger" target="_blank"
            >{{$t(`ShouldRevertBtnLabel`)}} (v)
            </button>
          </div>
        </template>
        <template v-else>
          <button :class="judgementBtnClass" disabled>
            {{ myJudgement }}
          </button>
          <div class="btn-group mx-1">

            <button
              @click="undo()"
              class="btn btn-outline-secondary"
            >{{$t(`UndoBtnLabel`)}}(←)
            </button>
            <button v-if="enableRevert"
                    @click="performRevert()"
                    class="btn btn-outline-primary">
              {{$t(`RevertNowBtnLabel`)}} (r)
            </button>
            <button
              @click="$emit(`next-card`)"
              class="btn btn-success"
            >{{$t(`NextBtnLabel`)}}(→)
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {BasicJudgement, WikiActionType} from "~/shared/interfaces";
    import {NuxtCookies} from "~/node_modules/cookie-universal-nuxt";
    import {NuxtAxiosInstance} from "~/node_modules/@nuxtjs/axios";
    import {InteractionItem, WikiActionItem} from "~/shared/schema";
    import {getUrlBaseByWiki} from "~/shared/utility-shared";
    import {InteractionProps} from "~/shared/models/interaction-item.model";

    @Component
    export default class ActionPanel extends Vue {
        @Prop({type: String, required: true}) readonly wikiRevId!: string;
        @Prop({type: String, required: true}) readonly title!: string;
        @Prop({type: String, required: true}) readonly feed!: string;

        $cookiez: NuxtCookies; // TODO remove after dep resolved https://github.com/microcipcip/cookie-universal/issues/63
        $axios: NuxtAxiosInstance;
        $t:any;
        $bvModal:any;

        myJudgement: BasicJudgement = null;

        private wiki: string;
        private revId: number;
        private page2ndLastRevision = null;
        private page1stLastRevision = null;

        async mounted() {
            this.wiki = this.wikiRevId.split(':')[0];
            this.revId = parseInt(this.wikiRevId.split(':')[1]);
            await this.fetchLatestRevs(); // No wait
        }

        async fetchLatestRevs() {
            let result = await this.$axios.$get(`/api/mediawiki`, {
                params: {
                    wiki: this.wiki,
                    apiQuery: {
                        action: "query",
                        format: "json",
                        prop: "revisions",
                        titles: this.title,
                        rvlimit: 2,
                    }
                }
            });
            let revisions = Object.values(result.query.pages)[0]['revisions'];
            this.page1stLastRevision = revisions[0];
            this.page2ndLastRevision = revisions[1];
        }

        public async interactionBtn(judgement: string) {
            this.myJudgement = BasicJudgement[judgement];
            let userGaId = this.$cookiez.get("_ga");
            let postBody = <InteractionProps> {
                userGaId: userGaId,
                judgement: this.myJudgement,
                timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
                wikiRevId: this.wikiRevId,
                feed: this.feed,
                title: this.title,
                wiki: this.wiki
            };

            if (this.$store.state?.user?.profile) {
                let wikiUserName = this.$store.state.user.profile.displayName;
                postBody.wikiUserName = wikiUserName;
            }
            await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
            document.dispatchEvent(new Event("stats-update"));
            document.dispatchEvent(new Event("judgement-event"));
            this.$emit('judgement-event', postBody);
        }

        public async performRevert() {
            if (this.isRevIdCurrent) {
                const version = await this.$axios.$get(`/api/version`);
                let revertEditSummary = this.$t(
                    `RevertEditSummary`,
                    [
                        `[[:m:WikiLoop Battlefield]]`,
                        `${version}`,
                        `http://${process.env.PUBLIC_HOST || "battlefield.wikiloop.org"}/revision/${this.wiki}/${this.revId}`
                    ]);
                if (this.isConsecutive) {
                    let historyUrl = `${getUrlBaseByWiki(this.wiki)}/w/index.php?title=${this.title}&action=history`;
                    window.open(historyUrl, '_blank');
                    let wikiActionItem:WikiActionItem = {
                        fromUserGaId: this.$cookiez.get('_ga'),
                        type: WikiActionType.RedirectToHistory,
                        wiki: this.wiki,
                        revId: this.revId,
                        title: this.title,
                    };
                    if (this.$store.state.user?.profile?.displayName) wikiActionItem.fromWikiUserName = this.$store.state.user.profile.displayName;
                    await this.$axios.$post('/api/action/revert', wikiActionItem);
                } else {
                    let revertUrl = `${getUrlBaseByWiki(this.wiki)}/w/index.php?title=${this.title}&action=edit&undoafter=prev&undo=${this.revId}&summary=${revertEditSummary}`;
                    window.open(revertUrl, '_blank');

                    let wikiActionItem:WikiActionItem = {
                        fromUserGaId: this.$cookiez.get('_ga'),
                        type: WikiActionType.RedirectToRevert,
                        wiki: this.wiki,
                        revId: this.revId,
                        title: this.title,
                    };
                    if (this.$store.state.user?.profile?.displayName) wikiActionItem.fromWikiUserName = this.$store.state.user.profile.displayName;
                    await this.$axios.$post('/api/action/revert', wikiActionItem);
                }

            }
        }

        public undo() {
          this.myJudgement = null;
        }

        get isRevIdCurrent(): boolean {
            return this.revId === this.page1stLastRevision.revid;
        }

        get isConsecutive(): boolean {
            return this.page1stLastRevision.user === this.page2ndLastRevision.user;
        }

        get enableRevert(): boolean {
            return this.myJudgement === BasicJudgement.ShouldRevert && this.isRevIdCurrent;
        }

        get judgementBtnClass(): string {
          return {
            ShouldRevert: 'btn btn-danger',
            LooksGood: 'btn btn-success',
            NotSure: 'btn btn-secondary'
          }[this.myJudgement];
        }
    }
</script>
