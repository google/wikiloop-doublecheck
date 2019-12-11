<!--
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<template>
  <section>
    <div v-bind:class="{
        'border-danger': ores ? ores.goodfaith.false > 0.5 : false,
        'border-warning': ores ? ores.damaging.true > 0.5 : false,
        'bg-light': revision ? revision.pageLatestRevId > revision.revid : false
        }"
         class="card shadow-sm h-100">
      <div v-if="revision" class="card-body d-flex flex-column small-screen-padding">
        <h5 class="card-title ">
          <div class="d-flex">
            <div class="flex-grow-1">
              [[<a :href="`${getUrlBaseByWiki(revision.wiki)}/wiki/${revision.title}`">{{ revision.title }}</a>]]
              <sup><a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/Special:Diff/${revision.wikiRevId.split(`:`)[1]}`">
                <small>rev.{{revision.wikiRevId.split(`:`)[1]}}</small>
              </a></sup>
            </div>
            <!-- TODO(xinbenlv) update the following text for for i18n -->
            <div v-if="revision ? revision.pageLatestRevId > revision.revid: false"> Overriden</div>
          </div>
        </h5>
        <div class="card-subtitle mb-2 text-muted">
          <div class="row p-2">
            <div class="col-lg-2">
              <i class="fas fa-pen"></i> {{$t(`EditedTimeLabel`)}}
              <timeago :datetime="getTimeString()" :auto-update="60" :locale="$i18n.locale"></timeago>
            </div>
            <div class="col-lg-2">
              <small><span>by <a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/User:${revision.user}`">{{ revision.user }}</a></span>
              </small>
            </div>
            <div v-if="ores" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top" title="Damaging Score by WMF ORES">
                <!-- TODO(xinbenlv) update the following text for for i18n -->
                <i v-bind:class="{ 'text-danger': ores ? ores.damaging.true > 0.5 : false }" class="fas fa-cloud-rain"></i> ORES Damaging: <a
                  :href="`https://ores.wikimedia.org/v3/scores/enwiki/?revids=${revision.revid}`">{{ damagingPercent() }}</a>
              </span>
            </div>
            <div v-if="ores" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top"
                    title="Bad-faith Score by WMF ORES (here Bad-faith = 100% - Goodfaith)">
                <!-- TODO(xinbenlv) update the following text for for i18n -->
                <i v-bind:class="{ 'text-warning': ores ? ores.goodfaith.false > 0.5: false }" class="fas fa-theater-masks"></i> ORES Badfaith:  <a
                  :href="`https://ores.wikimedia.org/v3/scores/enwiki/?revids=${revision.revid}`">{{ badfaithPercent() }}</a>
              </span>
            </div>
            <div v-if="stiki" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top"
                    title="Vandalism Score by STiki">
                <i v-bind:class="{ 'text-warning': stiki && stiki > 0.5 ? true : false }" class="fas fa-theater-masks"></i> STiki:  <a
                  :href="`/extra/stiki/${wikiRevId}`">{{ stikiPercent() }}</a>
              </span>
            </div>
            <div v-if="stiki" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top"
                    title="Vandalism Score by ClueBotNG">
                <i v-bind:class="{ 'text-warning': cbng && cbng > 0.5 ? true : false }" class="fas fa-theater-masks"></i> ClueBotNG:  <a
                  :href="`/extra/cbng/${wikiRevId}`">{{ cbngPercent() }}</a>
              </span>
            </div>
          </div>
        </div>
        <div v-if="revision" class="card-subtitle mb-2 text-muted">
          <div class="row p-2">
            <div class="col-12"><b>{{$t('EditSummaryLabel')}}:</b>
              <span>{{revision.comment || "(empty)}"}}</span>
            </div>
          </div>
        </div>
        <div class="card-text w-100 pl-sm-0">
          <diff-box v-if="diff && diff.compare && diff.compare['*']" v-bind:diffContent="diff.compare['*']"/>
          <!-- TODO(xinbenlv) update the following text for for i18n -->
          <h5 v-else>{{$t(`DiffNotAvailable`)}}
            <div v-on:click="loadDiff()" class="btn btn-outline-primary btn-small"><i class="fas fa-redo"></i></div>
            <!--TODO(zzn): v-if="revision.revision" might not be available, handle those cases better. -->
            <a v-if="revision.revision" class="btn btn-outline-primary" :href="`${getUrlBaseByWiki(revision.wiki)}/w/index.php?title=${revision.title}&diff=${revision.revision.new}&oldid=prev&diffmode=source`"><i class="fas fa-external-link-alt"></i></a>
          </h5>
        </div>

        <div v-if="interaction && interaction.judgements.length > 0" class="col-lg-12">
          <table class="b-table table mt-2 w-100">
            <tr class="row">
              <td class="col-4">User</td>
              <td class="col-4">Label</td>
              <td class="col-4">Time</td>
            </tr>
            <tr class="row" v-for="judgement of interaction.judgements">
              <td class="col-4">
                <router-link :to="`/marked/?userGaId=${judgement.userGaId}`" replace>
                  <object class="avatar-object" v-bind:data="`/api/avatar/${judgement.userGaId}`" ></object>
                  <span v-if="$cookiez.get('_ga') === judgement.userGaId ">{{$t("Me")}}</span>
                  <span v-else>{{$t("Someone")}}</span>
                </router-link>
              </td>
              <td class="col-4">{{judgement.judgement}}</td>
              <td class="col-4">{{new Date(judgement.timestamp * 1000).toISOString()}} <br/> (<timeago :locale="$i18n.locale" :datetime="new Date(interaction.lastTimestamp * 1000).toString()" :auto-update="60"></timeago>)</td>
            </tr>
          </table>
        </div>
        <div class="mt-4 d-flex justify-content-center">
          <div v-if="interaction" class="btn-group mx-1">
            <button
                v-on:click="interactionBtn(`LooksGood`)"
                class="btn btn-sm"
                v-bind:class="{ 'btn-success':getMyJudgement() ===`LooksGood`, 'btn-outline-success': getMyJudgement() !==`LooksGood` }"
            >{{$t(`LooksGoodBtnLabel`)}} {{getJudgementCount(`LooksGood`)}}
            </button>
            <button
                v-on:click="interactionBtn(`NotSure`)"
                v-bind:class="{ 'btn-secondary':getMyJudgement() ===`NotSure`, 'btn-outline-secondary':getMyJudgement() !==`NotSure` }"
                class="btn btn-sm"
            >{{$t(`NotSureBtnLabel`)}}
            <template v-if="!interaction"><span class="sr-only"></span></template>
            <template v-else>{{getJudgementCount(`NotSure`)}}</template>

            </button>
            <button
                v-on:click="interactionBtn(`ShouldRevert`)"
                v-bind:class="{ 'btn-danger':getMyJudgement() ===`ShouldRevert`, 'btn-outline-danger':getMyJudgement() !== `ShouldRevert` }"
                class="btn btn-sm" target="_blank"
            >{{$t(`ShouldRevertBtnLabel`)}} {{getJudgementCount(`ShouldRevert`)}}
            </button>
            <transition name="fade">
              <template v-if="enableRevertRedirect()">
                <button v-if="$store.state.flags.useDirectRevert && $store.state.user && $store.state.user.profile"
                        v-on:click="directRevert()"
                        class="btn btn-outline-primary">
                  <i class="fas fa-broom"></i>
                </button>
                <button v-else
                        v-on:click="redirectToRevert()"
                        class="btn btn-outline-primary">
                  <i class="fas fa-broom"></i>
                </button>
              </template>
            </transition>
          </div>
          <div v-if="myJudgement" class="btn-group mx-1">
          <button
            v-on:click="$emit(`next-card`)"
            v-if="myJudgement"
            class="btn btn-outline-primary"
          ><i class="fas fa-arrow-right"></i> {{$t(`NextBtnLabel`)}}
          </button>
          </div>
        </div>
      </div>
      <div v-else class="card-body d-flex flex-column small-screen-padding">
        <div class="spinner-border" role="status">
          <span class="sr-only">{{$t(`Loading`)}}...</span>
        </div>
      </div>
    </div>
  </section>

</template>
<script>
  import utility from '~/shared/utility';
  import DiffBox from '~/components/DiffBox.vue';
  import socket from '~/plugins/socket.io.js';
  export default {
    components: {
      DiffBox
    },
    props: {
      wikiRevId: {
        type: String,
        required: true
      },
      oresProp: {
        type: Object,
        default: null
      },
      revisionProp: {
        type: Object,
        default: null
      },
      interactionProp: {
        type: Object,
        default: null
      },
      stikiProp: {
        type: Number,
        default: null
      },
      cbngProp: {
        type: Number,
        default: null
      },
      diffProp: {
        type: Object,
        default: null
      },
    },
    data() {
      return {
        ores: null,
        diff: null,
        interaction: null,
        revision: null,
        myJudgement: null,
        stikiRetryRemains: 3,
        stiki: null,
        cbng: null,
      }
    },
    methods: {
      loadDiff: async function () {
        this.diff = await this.fetchDiffWithWikiRevId(this.wikiRevId);
      },
      loadStiki: async function() {
        console.info(`Load Stiki`);
        let stikiRemote = [];
        if (this.stikiProp) {
          stikiRemote = this.stikiProp;
        } else {
          try {
            await this.$axios.$get(`/extra/stiki/${this.wikiRevId}`);
          } catch(err) {
            // ignoring
            stikiRemote = [];
          }
        }
        if (stikiRemote.length) {
          this.stiki = parseFloat(stikiRemote[0].SCORE);
        } else {
          if (this.stikiRetryRemains) setTimeout(this.loadStiki, 5000);
        }
        this.stikiRetryRemains --;
      },
      loadCbng: async function() {
        console.info(`Load CBNG for ${this.wikiRevId}`);
        let cbngRemote = [];
        if (this.cbngProp) {
          cbngRemote = this.cbngProp;
        } else {
          try {
            await this.$axios.$get(`/extra/cbng/${this.wikiRevId}`);
          } catch(err) {
            // ignoring
            cbngRemote = [];
          }
        }
        if (cbngRemote.length) {
          this.cbng = parseFloat(cbngRemote[0].SCORE);
        } else {
          if (this.cbngRetryRemains) setTimeout(this.loadCbng, 5000);
        }
        this.cbngRetryRemains --;
      },
      getTimeString: function () {
        return new Date(this.revision.timestamp * 1000).toString();
      },
      getJudgementCount: function (judge) {
        return this.interaction.counts[judge];
      },
      isOverriden: function () {
        return false;
        // return this.revision.pageLatestRevId > this.revision.revid;
      },
      getMyJudgement: function() {
        if (this.interaction) {
          let myGaId = this.$cookiez.get("_ga");
          let result = this.interaction.judgements.filter(j => j.userGaId === myGaId);
          if (result.length === 1) {
            return result[0].judgement;
          } else return null;
        } else {
          return null;
        }
      },
      enableRevertRedirect: function() {
        this.$ga.event({
          eventCategory: 'wp-edit',
          eventAction: 'go-revert',
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
        return this.myJudgement === `ShouldRevert` && !this.isOverriden();
      },
      directRevert: async function() {
      try {
        this.$ga.event({
          eventCategory: 'interaction',
          eventAction: 'direct-revert-initiate',
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
        let ret = await this.$axios.$get(`/api/auth/revert/${this.wikiRevId}`);
        if (ret && ret.edit && ret.edit.result ===`Success`) {
          this.$bvToast.toast(
                  `Congrats! you've successfully reverted ${this.wikiRevId}`, {
                    title: 'Revert succeeded!',
                    autoHideDelay: 3000,
                    appendToast: true
                  });
          this.$ga.event({
            eventCategory: 'interaction',
            eventAction: 'direct-revert-success',
            eventValue: {
              wikiRevId: this.wikiRevId
            }
          });
        } else {
          console.warn(`Direct revert result unknown`, ret);
          this.$ga.event({
            eventCategory: 'interaction',
            eventAction: 'direct-revert-unknown',
            eventValue: {
              wikiRevId: this.wikiRevId
            }
          });
        }

      } catch(e) {
        // TODO show failure message.
        this.$ga.event({
          eventCategory: 'interaction',
          eventAction: 'direct-revert-failure',
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
      }
      },
      redirectToRevert: async function() {
        if (this.myJudgement === `ShouldRevert` && !this.isOverriden()) {
          const version = await this.$axios.$get(`/api/version`);
          let revertUrl = `${this.getUrlBaseByWiki(this.revision.wiki)}/w/index.php?title=${this.revision.title}&action=edit&undoafter=${this.revision.revision.old}&undo=${this.revision.revision.new}&summary=Identified as test/vandalism using [[:m:WikiLoop Battlefield]](version ${version}). See it or provide your opinion at http://battlefield.wikiloop.org/marked?wikiRevIds=${this.wikiRevId}`;
          let historyUrl = `${this.getUrlBaseByWiki(this.revision.wiki)}/w/index.php?title=${this.revision.title}&action=history`;
          let result = await this.$axios.$get(`/api/mediawiki`, {params: {
            wiki: this.revision.wiki,
            apiQuery: {
              action: "query",
              format: "json",
              prop: "revisions",
              titles: this.revision.title,
              rvlimit: 10,
            }
          }});
          let revisions = Object.values(result.query.pages)[0].revisions;
          if (revisions[1].user === revisions[0].user) {
            window.open(historyUrl, '_blank');
            this.$ga.event({
              eventCategory: 'interaction',
              eventAction: 'go-to-history',
              eventValue: {
                wikiRevId: this.wikiRevId
              }
            });
          } else {
            window.open(revertUrl, '_blank');
            this.$ga.event({
              eventCategory: 'interaction',
              eventAction: 'go-to-revert',
              eventValue: {
                wikiRevId: this.wikiRevId
              }
            });
          }

        }
      },
      interactionBtn: async function (myJudgement) {
        this.myJudgement = myJudgement;
        let revision = this.revision;
        let gaId = this.$cookiez.get("_ga");
        let postBody = {
          gaId: gaId, // Deprecated
          userGaId: gaId,
          judgement: myJudgement,
          timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
          wikiRevId: revision.wikiRevId,
          recentChange: {
            title: revision.title,
            namespace: revision.namespace,
            revision: revision.revision,
            ores: this.ores,
            user: revision.user,
            wiki: revision.wiki,
            timestamp: new Date(revision.timestamp).getTime()/1000
          }
        };

        if (this.$store.state.user && this.$store.state.user.profile) {
          let wikiUserName = this.$store.state.user.profile.displayName;
          postBody.wikiUserName = wikiUserName;
        }

        await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
        document.dispatchEvent(new Event("stats-update"));
        this.$emit('judgement-event', postBody);
        this.$ga.event({
          eventCategory: 'interaction',
          eventAction: 'judgement',
          eventLabel: myJudgement,
          eventValue: {
            wikiRevId: this.wikiRevId
          }
        });
      },
      damagingPercent: function () {
        return `${this.ores !== null ? Math.floor(parseFloat(this.ores.damaging.true) * 100) : "??"}%`;
      },
      badfaithPercent: function () {
        return `${this.ores !== null ? Math.floor(parseFloat(this.ores.goodfaith.false) * 100) : "??"}%`;
      },
      stikiPercent: function() {
        return `${this.stiki !== null ? Math.floor(parseFloat(this.stiki) * 100) : "??"}%`;
      },
      cbngPercent: function() {
        return `${this.cbng !== null ? Math.floor(parseFloat(this.cbng) * 100) : "??"}%`;
      }
    },
    async beforeMount() {
      console.info(`Mounted NewRevisionCard wikiRevId=${this.wikiRevId},
        Set props: interactionProp:${this.interactionProp!=null},
        revisionProp:${this.revisionProp!=null},
        oresProp:${this.oresProp!=null}
        diffProp:${this.diffProp!=null}
        `);
      this.interaction = this.interactionProp || await this.$axios.$get(`/api/interaction/${this.wikiRevId}`);
      this.revision = this.revisionProp || await this.$axios.$get(`/api/revision/${this.wikiRevId}`);
      this.ores = this.oresProp ||  await this.$axios.$get(`/api/ores/${this.wikiRevId}`);
      this.diff = this.diffProp || await this.$axios.$get(`/api/diff/${this.wikiRevId}`);
      if (this.stikiProp) {
        this.stiki = this.stikiProp;
      } else if (this.$store.state.flags.useStiki) {
        await this.loadStiki();
      }
      if (this.cbngProp) {
        this.cbng = this.cbngProp;
      } else if (this.$store.state.flags.useStiki/*Cbng shares the same flag with STiki*/) {
        await this.loadCbng();
      } // TODO(xinbenlv) merge duplicated logic

      // TODO(xinbenlv): after marking "shouldRevert" query to see if this revesion is top and can be reverted.
      socket.on('interaction', async (interaction) => {
        if(interaction.wikiRevId === this.wikiRevId) {
          this.interaction = interaction;
        }
      });
    },
    async mounted() {
      this.$ga.event({
        eventCategory: 'display',
        eventAction: 'NewRevisionCard',
        eventValue: {
          wikiRevId: this.wikiRevId
        }
      });
    },
    beforeCreate() {
      this.getUrlBaseByWiki = utility.getUrlBaseByWiki.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
      this.fetchDiffWithWikiRevId = utility.fetchDiffWithWikiRevId.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
    },
  }

</script>

<style>
  .diff-context {
    word-break: break-all;
    width: 50%;
  }

  .diff-deletedline, .diff-addedline {
    word-break: break-all;
    width: 50%
  }

  .blue-link {
    color: blue
  }
  .bg-darker-light {
    background-color: #F5F5F5;
  }

  #metainfo {
    font-size:12px;
  }

  .avatar-object {
    width: 48px;
    height: 48px;
    margin-top: -18px;
    margin-bottom: -18px;
  }
</style>

