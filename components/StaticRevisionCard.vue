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
        <div v-if="interaction && interaction.judgements.length > 0" class="col-lg-12">
          <table class="b-table table mt-2 w-100">
            <tbody>
            <tr class="row">
              <td class="col-4">User</td>
              <td class="col-4">Label</td>
              <td class="col-4">Time</td>
            </tr>
            <tr class="row" v-for="judgement of interaction.judgements">
              <td class="col-4">
                <router-link v-if="judgement.wikiUserName" :to="`/marked/?wikiUserName=${judgement.wikiUserName}`" replace>
                  <object class="avatar-object" v-bind:data="`/api/avatar/${judgement.wikiUserName}`" ></object>
                  <span v-if="isMine(judgement)">{{$t("Me")}} ({{judgement.wikiUserName}})</span>
                  <span v-else>{{judgement.wikiUserName || $t("SomeoneAnonymous")}}</span>
                </router-link>
                <router-link v-else :to="`/marked/?userGaId=${judgement.userGaId}`" replace>
                  <object class="avatar-object" v-bind:data="`/api/avatar/${judgement.userGaId}`" ></object>
                  <span v-if="$cookiez.get('_ga') === judgement.userGaId ">{{$t("Me")}}</span>
                  <span v-else>{{$t("Someone")}}</span>
                </router-link>
              </td>
              <td class="col-4">{{judgement.judgement}}</td>
              <td class="col-4">{{new Date(judgement.timestamp * 1000).toISOString()}} <br/> (<timeago :locale="$i18n.locale" :datetime="new Date(interaction.lastTimestamp * 1000).toString()" :auto-update="60"></timeago>)</td>
            </tr>
            </tbody>
          </table>
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
    data() {
      return {myJudgement: null}
    },
    props: {
      wikiRevId: {
        type: String,
        required: true
      },
      ores: {
        type: Object,
        default: null
      },
      revision: {
        type: Object,
        default: null
      },
      interaction: {
        type: Object,
        default: null
      },
      diff: {
        type: Object,
        default: null
      },
    },
    methods: {
      isMine: function(judgement) {
        if (judgement.wikiUserName && this.$store.state.user && this.$store.state.user.profile) {
          return judgement.wikiUserName === this.$store.state.user.profile.displayName;
        } else {
          return this.$cookiez.get('_ga') === judgement.userGaId;
        }
      },
      getTimeString: function () {
        const timestamp = isNaN(this.revision.timestamp) ? this.revision.timestamp : this.revision.timestamp * 1000
        return new Date(timestamp).toString();
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
          let myWikiUserName = null;
          if (this.$store.state.user && this.$store.state.user.profile) {
            myWikiUserName = this.$store.state.user.profile.displayName;
          }
          let result = this.interaction.judgements.filter(j => {
            if (myWikiUserName && myWikiUserName === j.wikiUserName) return true;
            else return j.userGaId === myGaId;
          });
          if (result.length === 1) {
            return result[0].judgement;
          } else return null;
        } else {
          return null;
        }
      },
      enableRevertRedirect: function() { },
      directRevert: function() {  },
      redirectToRevert: function() {  },
      interactionBtn:  function (myJudgement) {  },
      damagingPercent: function () {
        return `${this.ores !== null ? Math.floor(parseFloat(this.ores.damaging.true) * 100) : "??"}%`;
      },
      badfaithPercent: function () {
        return `${this.ores !== null ? Math.floor(parseFloat(this.ores.goodfaith.false) * 100) : "??"}%`;
      },
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

