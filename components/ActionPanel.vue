<template>
  <section>
    <div class="card-body">
      <div class="d-flex justify-content-center">
        <template v-if="!myJudgement">
          <div class="btn-group mx-1">
            <button
              class="btn btn-sm btn-outline-success"
              @click="interactionBtn(`LooksGood`)"
            >
              {{ $t(`Label-LooksGood`) }} (g)
            </button>
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="interactionBtn(`NotSure`)"
            >
              {{ $t(`Label-NotSure`) }} (p)
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              target="_blank"
              @click="interactionBtn(`ShouldRevert`)"
            >
              {{ $t(`Label-ShouldRevert`) }} (v)
            </button>
          </div>
        </template>
        <template v-else>
          <button :class="judgementBtnClass" disabled>
            {{ myJudgement }}
          </button>
          <div class="btn-group mx-1">
            <button
              class="btn btn-outline-secondary"
              @click="undo()"
            >
              {{ $t(`Button-Undo`) }}(←)
            </button>
            <template v-if="enableRevert">
              <button
                v-if="!wikiActionProps"
                class="btn btn-outline-primary"
                @click="performRevert()"
              >
                <span>{{ $t(`Button-RevertNow`) }} (r)</span>
              </button>
              <button
                v-else-if="wikiActionProps.type == `RedirectRevert`"
                class="btn btn-success"
              >
                {{ $t(`Button-OpenedUrlToRevert`) }}
              </button>
              <button
                v-else-if="wikiActionProps.type == `RedirectToHistory`"
                class="btn btn-success"
              >
                {{ $t(`Button-OpenedUrlToRevert`) }}
              </button>
              <button
                v-else-if="wikiActionProps.type == `DirectRevert` && wikiActionProps._meta && !(wikiActionProps._meta.hasError)"
                class="btn btn-success"
              >
                {{ $t(`Label-DirectReverted`) }}
              </button>
              <button
                v-else-if="wikiActionProps.type == `DirectRevert` && wikiActionProps._meta && wikiActionProps._meta.hasError"
                class="btn btn-danger"
              >
                {{ $t(`Label-DirectRevertFailed`) }}
              </button>
            </template>
            <button
              v-if="feed!=`direct-revision`"
              class="btn btn-success"
              @click="$emit(`next-card`)"
            >
              {{ $t(`Button-Next`) }}(→)
            </button>
          </div>
        </template>
      </div>

      <template v-if="wikiActionProps && wikiActionProps.type ==`DirectRevert`">
        <h5>{{ $t('Label-Result') }}</h5>
        <template v-if="wikiActionProps.resultRevId">
          <i class="text-success fas fa-check-circle mr-1" /><span>
            <!-- eslint-disable vue/no-v-html -->
            <span
              v-html="$t('Message-TheRevisionIsSuccessfullyRevertedAs',
                         [
                           `<a href='${getDiffLinkByRevId(revId)}'>${revId}</a>`,
                           `<a href='${getDiffLinkByRevId(wikiActionProps.resultRevId)}'>${wikiActionProps.resultRevId}</a>`
                         ])"
            />
            <!-- eslint-enable vue/no-v-html -->
          </span>
        </template>
        <template v-else-if="wikiActionProps && wikiActionProps._meta && wikiActionProps._meta.hasError">
          <i class="text-danger fas fa-times-circle mr-1" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="$t(`Message-SorryWeFailedToRevert`,[`<a href='${getDiffLinkByRevId(revId)}'>${revId}</a>`])" />
          <span v-if="wikiActionProps._meta.rawResult && wikiActionProps._meta.rawResult.error">
            {{ $t('Label-Reason') }}(<b>{{ wikiActionProps._meta.rawResult.error.code }}</b>) {{ wikiActionProps._meta.rawResult.error.info }}
          </span>
          <span v-else>.</span>
        </template>
      </template>
      <div v-if="isPending" class="spinner-border" role="status">
        <span class="sr-only">{{ $t('Label-Loading') }}...</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BasicJudgement, WikiActionType } from '~/shared/interfaces';
import { NuxtCookies } from '~/node_modules/cookie-universal-nuxt';
import { NuxtAxiosInstance } from '~/node_modules/@nuxtjs/axios';
import { WikiActionProps } from '~/shared/models/wiki-action.model';
import { getUrlBaseByWiki } from '~/shared/utility-shared';
import { InteractionProps } from '~/shared/models/interaction-item.model';

    @Component
export default class ActionPanel extends Vue {
        @Prop({ type: String, required: true }) readonly wikiRevId!: string;
        @Prop({ type: String, required: true }) readonly title!: string;
        @Prop({ type: String, required: true }) readonly feed!: string;

        $cookiez: NuxtCookies; // TODO remove after dep resolved https://github.com/microcipcip/cookie-universal/issues/63
        $config:any;
        $axios: NuxtAxiosInstance;
        $t:any;
        $bvModal:any;
        $ga:any;
        $bvToast:any;
        wikiActionProps:WikiActionProps = null;
        myJudgement: BasicJudgement = null;
        isPending:boolean = false;
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
          const result = await this.$axios.$get('/api/mediawiki', {
            params: {
              wiki: this.wiki,
              apiQuery: {
                action: 'query',
                format: 'json',
                prop: 'revisions',
                titles: this.title,
                rvlimit: 2,
              },
            },
          });
          const revisions = (Object.values(result.query.pages)[0] as any).revisions;
          this.page1stLastRevision = revisions[0];
          this.page2ndLastRevision = revisions[1];
        }

        public async interactionBtn(judgement: string) {
          this.myJudgement = BasicJudgement[judgement];
          const userGaId = this.$cookiez.get('_ga');

          const postBody = {
            userGaId,
            judgement: this.myJudgement,
            timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
            wikiRevId: this.wikiRevId,
            feed: this.feed,
            title: this.title,
            wiki: this.wiki,
          } as InteractionProps;

          if (this.$store.state?.user?.profile) {
            const wikiUserName = this.$store.state.user.profile.displayName;
            postBody.wikiUserName = wikiUserName;
          }
          await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
          document.dispatchEvent(new Event('stats-update'));
          document.dispatchEvent(new Event('judgement-event'));
          this.$emit('judgement-event', postBody);
        }

        getDiffLinkByRevId(revId) {
          return `${getUrlBaseByWiki(this.wiki)}/wiki/Special:Diff/${revId}`;
        }

        public async performRevert() {
          if (this.isRevIdCurrent) {
            const version = await this.$axios.$get('/api/version');
            const revertEditSummary = this.$t(
              'Message-RevertEditSummary',
              [
                '[[:m:WikiLoop DoubleCheck]]',
                `${version}`,
                `http://${this.$config.PUBLIC_HOST || 'doublecheck.wikiloop.org'}/revision/${this.wiki}/${this.revId}`,
              ]);
            this.wikiActionProps = {
              fromUserGaId: this.$cookiez.get('_ga'),
              type: WikiActionType.RedirectToRevert,
              wiki: this.wiki,
              revId: this.revId,
              title: this.title,
              _meta: {},
            } as WikiActionProps;
            if (this.isConsecutive) {
              const historyUrl = `${getUrlBaseByWiki(this.wiki)}/w/index.php?title=${this.title}&action=history`;
              this.wikiActionProps.type = WikiActionType.RedirectToHistory;
              window.open(historyUrl, '_blank');
            } else if (this.$store.state.flags.useDirectRevert && this.$store.state.user && this.$store.state.user.profile) {
              this.wikiActionProps.type = WikiActionType.DirectRevert;
              this.isPending = true;
              await this.directRevert();
              this.isPending = false;
            } else {
              const revertUrl = `${getUrlBaseByWiki(this.wiki)}/w/index.php?title=${this.title}&action=edit&undoafter=${this.page2ndLastRevision.revid/* a hack due to #238 before we roll out combined diff #225 */}&undo=${this.revId}&summary=${revertEditSummary}`;
              this.wikiActionProps.type = WikiActionType.RedirectToRevert;
              window.open(revertUrl, '_blank');
            }
            if (this.$store.state.user?.profile?.displayName) {this.wikiActionProps.fromWikiUserName = this.$store.state.user.profile.displayName;}
            await this.$axios.$post('/api/action/revert', this.wikiActionProps);
          }
        }

        async directRevert() {
          try {
            this.$ga.event({
              eventCategory: 'interaction',
              eventAction: 'direct-revert-initiate',
              eventValue: {
                wikiRevId: this.wikiRevId,
              },
            });
            const ret = await this.$axios.$get(`/api/auth/revert/${this.wikiRevId}`);
            this.wikiActionProps._meta.rawResult = ret;
            if (ret && ret.edit && ret.edit.result === 'Success') {
              this.wikiActionProps.resultRevId = parseInt(ret.edit.newrevid);
              this.$bvToast.toast(
                `Congrats! you've successfully reverted directly ${this.wikiRevId}`, {
                  title: 'Revert succeeded!',
                  autoHideDelay: 3000,
                  appendToast: true,
                });

              this.$ga.event({
                eventCategory: 'interaction',
                eventAction: 'direct-revert-success',
                eventValue: {
                  wikiRevId: this.wikiRevId,
                },
              });
            } else {
              this.wikiActionProps._meta.rawResult = ret;
              this.wikiActionProps._meta.hasError = true;
              this.$ga.event({
                eventCategory: 'interaction',
                eventAction: 'direct-revert-unknown',
                eventValue: {
                  wikiRevId: this.wikiRevId,
                },
              });
            }
          } catch (e) {
            // TODO show failure message.
            this.wikiActionProps._meta.rawResult = e;
            this.wikiActionProps._meta.hasError = true;
            this.$ga.event({
              eventCategory: 'interaction',
              eventAction: 'direct-revert-failure',
              eventValue: {
                wikiRevId: this.wikiRevId,
              },
            });
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
            NotSure: 'btn btn-secondary',
          }[this.myJudgement];
        }
}
</script>
