<!--eslint-disable-->
<template>

  <section>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
      <a class="navbar-brand" href="https://github.com/xinbenlv/wikiloop-battlefield-vue">Battlefield <sup>v{{version}}</sup></a>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop">Our WikiProject</b-nav-item>
          <b-nav-item href="https://github.com/xinbenlv/wikiloop-battlefield-vue/issues">Issues</b-nav-item>

          <b-nav-item href="/api/stats">Stats (<i class="fas fa-smile-wink"></i>{{stats.totalMyJudgement}}/<i class="fas fa-globe-europe"></i>{{stats.totalJudgement}})</b-nav-item>
          <b-nav-item href="#">Online: {{ liveUserCount }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
      </div>
    </nav>
    <div class="container small-screen-padding" style="margin-top:60px">
      <h5>
        {{showCounter}} out of {{revisionCounter}} revisions matches <span class="btn btn-sm btn-outline-primary" v-b-modal.filter-modal>filters</span>
      </h5>
      <div class="m-auto" v-if="newRecentChangDbIds.length === 0">
        <h1 class="m-auto">Please wait for the first vandal edit to show up....</h1>
      </div>
      <div
        v-for="newRecentChangDbId of newRecentChangDbIds"
        v-bind:key="newRecentChangDbId"
        class="col-12 p-2"
      >
        <div v-bind:class="{
        'border-danger': badfaith(newRecentChangDbId),
        'border-warning': damaging(newRecentChangDbId),
        'bg-light': isOverridden(newRecentChangDbId)
        }"
             class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column small-screen-padding">
            <h5 class="card-title ">
              <div class="d-flex">
                <div class="flex-grow-1">
                  <a v-bind:href="`${getUrlBase(dbIdToRecentChangeMap[newRecentChangDbId])}/wiki/Special:Diff/${dbIdToRecentChangeMap[newRecentChangDbId].revision.new}`">{{ dbIdToRecentChangeMap[newRecentChangDbId].title }}</a>
                </div>
                <div v-if="isOverridden(newRecentChangDbId)"> Overriden </div>
              </div>

            </h5>

            <h6>
              <small><i class="fas fa-clock"></i> <timeago :datetime="getTimeString(newRecentChangDbId)" :auto-update="60"></timeago></small>
            </h6>
            <h6 class="card-subtitle mb-2 text-muted">
              <small class="row">
                <div class="col-sm-12 col-6">by <a v-bind:href="`${getUrlBase(dbIdToRecentChangeMap[newRecentChangDbId])}/wiki/User:${dbIdToRecentChangeMap[newRecentChangDbId].user}`">{{ dbIdToRecentChangeMap[newRecentChangDbId].user }}</a></div>
                <div class="col-sm-12 col-6">
                  <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                    <i v-bind:class="{ 'text-danger': badfaith(newRecentChangDbId) }" class="fas fa-theater-masks"></i>: {{ damagingPercent(newRecentChangDbId) }},
                  </span>
                  <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                    <i v-bind:class="{ 'text-warning': damaging(newRecentChangDbId) }" class="fas fa-cloud-rain"></i>: {{ badfaithPercent(newRecentChangDbId) }}
                  </span>
                </div>
              </small>

            </h6>
            <div class="card-text w-100 pl-sm-0">
              <diff-box v-bind:diffContent="dbIdToRecentChangeMap[newRecentChangDbId].diff.compare['*']" />
            </div>
            <div class="mt-4 d-flex justify-content-center">
              <div class="btn-group">
                <button
                  v-on:click="interactionBtn(`LooksGood`, newRecentChangDbId)"
                  class="btn btn-sm"
                  v-bind:class="{ 'btn-success':dbIdToRecentChangeMap[newRecentChangDbId].judgement === 'LooksGood', 'btn-outline-success':dbIdToRecentChangeMap[newRecentChangDbId].judgement !== 'LooksGood' }"
                >Looks good {{getJudgementCount(newRecentChangDbId, `LooksGood`)}}</button>
                <button
                  v-on:click="interactionBtn(`NotSure`, newRecentChangDbId)"
                  v-bind:class="{ 'btn-secondary':dbIdToRecentChangeMap[newRecentChangDbId].judgement === 'NotSure', 'btn-outline-secondary':dbIdToRecentChangeMap[newRecentChangDbId].judgement !== 'NotSure' }"
                  class="btn btn-sm"
                >Not sure {{getJudgementCount(newRecentChangDbId, `NotSure`)}}</button>
                <button
                  v-on:click="interactionBtn(`ShouldRevert`, newRecentChangDbId)"
                  v-bind:class="{ 'btn-danger':dbIdToRecentChangeMap[newRecentChangDbId].judgement === 'ShouldRevert', 'btn-outline-danger':dbIdToRecentChangeMap[newRecentChangDbId].judgement !== 'ShouldRevert' }"
                  class="btn btn-sm" target="_blank"
                >Should revert {{getJudgementCount(newRecentChangDbId, `ShouldRevert`)}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal id="filter-modal" title="Filters">
      <b-form-group label="Require">
        <b-form-checkbox v-model="requireEnWiki" >en-wiki</b-form-checkbox>
        <b-form-checkbox v-model="requireNonBot" >non-bot</b-form-checkbox>
        <b-form-checkbox v-model="requireArticleNamespace" >article namespace</b-form-checkbox>
        <b-form-checkbox v-model="requireBadfaith" >bad-faith (by WMF ORES score)</b-form-checkbox>
        <b-form-checkbox v-model="requireDamaging">damaging (by WMF ORES score)</b-form-checkbox>
        <span for="thresold">Threshold: </span>
        <button v-on:click="changeThreshold(0.1)" class="btn btn-sm"><i class="fas fa-chevron-up"></i></button>
        <span id="thresold"> {{threshold || "(default)" }}</span>
        <button v-on:click="changeThreshold(-0.1)" class="btn btn-sm"><i class="fas fa-chevron-down"></i></button>
        <button v-on:click="resetThreshold()" class="btn btn-sm"><i class="fas fa-reset"></i></button>
      </b-form-group>
    </b-modal>
  </section>

</template>
<script>
import BootstrapVue from 'bootstrap-vue';
import DiffBox from '~/components/DiffBox.vue';
import socket from '~/plugins/socket.io.js';
import VueTimeago from 'vue-timeago'

const $ = require('jquery');

export default {
  comments: {
    BootstrapVue,
    VueTimeago
  },
  components: {
    DiffBox
  },
  data() {
    return {
      title: 'WikiLoop Battlefield',
      newRecentChangDbIds: [],
      dbIdToRecentChangeMap: {},
      titleToDbIds: {},
      requireEnWiki: true,
      requireDamaging: true,
      requireBadfaith: true,
      requireArticleNamespace: true,
      requireNonBot: true,
      threshold: null,
      revisionCounter: 0,
      basicFilterCounter: 0,
      liveUserCount: 1,
      showCounter: 0,
      pause: false
      // loaded: false
    }
  },
  async asyncData ({ $axios }) {
    const initRecentChanges = await $axios.$get(`/api/latest?serverUrl=http://en.wikipedia.org/`);
    const version = await $axios.$get(`/api/version`);
    const stats = await $axios.$get(`/api/stats`);
    return { initRecentChanges, version, stats };
  },
  methods: {
    isOverridden: function(dbId) {
      let newRecentChange = this.dbIdToRecentChangeMap[dbId];
      return newRecentChange.overriden;
    },
    getTimeString: function(dbId) {
      let newRecentChange = this.dbIdToRecentChangeMap[dbId];
      return new Date(newRecentChange.timestamp * 1000).toString();
    },
    getJudgementCount: function (dbId, judge) {
      let newRecentChange = this.dbIdToRecentChangeMap[dbId];
      if (newRecentChange.judgementCounts) {
        return newRecentChange.judgementCounts[judge] ? `(${newRecentChange.judgementCounts[judge]})`: ``;
      } else {
        return "";
      }
    },
    getUrlBase: function (newRecentChange) {
      let lang = {
        'enwiki': 'en',
        'frwiki': 'fr',
        'ruwiki': 'ru'
      };
      return `http://${lang[newRecentChange.wiki]}.wikipedia.org`;
    },
    damaging: function (newRecentChangeId) {
      return this.dbIdToRecentChangeMap[newRecentChangeId].ores.damaging;
    },
    damagingPercent: function (newRecentChangeId) {
      return `${Math.floor(this.dbIdToRecentChangeMap[newRecentChangeId].ores.damagingScore * 100)}%` ;
    },
    badfaith: function (newRecentChangeId) {
      return this.dbIdToRecentChangeMap[newRecentChangeId].ores.badfaith;
    },
    badfaithPercent: function (newRecentChangeId) {
      return `${Math.floor(this.dbIdToRecentChangeMap[newRecentChangeId].ores.badfaithScore * 100)}%` ;
    },
    interactionBtn: async function(judgement, newRecentChangeId) {
      let newRecentChange = this.dbIdToRecentChangeMap[newRecentChangeId];
      let url = `${this.getUrlBase(newRecentChange)}/w/index.php?title=${newRecentChange.title}&action=edit&undoafter=${newRecentChange.revision.old}&undo=${newRecentChange.revision.new}&summary=Reverted%20with%20[[:m:WikiLoop Battlefield]](v${this.version}) at battlefield.wikiloop.org .`;
      let gaId = this.$cookies.get("_ga");
      console.log(`gaId`, gaId);
      let postBody = {
        gaId: gaId,
        judgement: judgement,
        timestamp: Math.floor(new Date().getTime()/1000),
        newRecentChange: {
          _id: newRecentChange._id,
          title: newRecentChange.title,
          namespace: newRecentChange.namespace,
          id: newRecentChange.id,
          revision: newRecentChange.revision,
          ores: newRecentChange.ores,
          user: newRecentChange.user,
          wiki: newRecentChange.wiki,
          timestamp: newRecentChange.timestamp
        }
      };
      console.log(`postBody`, postBody);
      if (judgement === `ShouldRevert` && !this.isOverridden(newRecentChange._id)) window.open(url, '_blank');
      let ret = await $.post(`/api/interaction`, postBody);
      newRecentChange.judgement = judgement;
      this.$bvToast.toast(
        `Your judgement for ${newRecentChange.title} at revision ${newRecentChange.id} is logged.`, {
        title: 'Congrats!',
        autoHideDelay: 3000,
        appendToast: true
      });
      console.log(`interaction ret:`, ret);
    },
    meetThreshold: function(newRecentChange) {
      if (this.threshold !== null)
        return (newRecentChange.ores.damagingScore >= this.threshold ||  !this.requireDamaging) &&
                (newRecentChange.ores.badfaithScore >= this.threshold || !this.requireBadfaith);
      else return (newRecentChange.ores.damaging || !this.requireDamaging) &&
        (newRecentChange.ores.badfaith || !this.requireBadfaith);
    },
    resetThreshold: function() {
      this.threshold = null;
    },
    changeThreshold: function(change) {
      if (this.threshold === null) this.threshold = 0.7;
      this.threshold += change;
      if (this.threshold >= 1.0) this.threshold = 1.0;
      else if (this.threshold <= 0) this.threshold = 0.0;
    },
    maybeShowRecentChange: async function(newRecentChange) {
      let title = newRecentChange.title;
      if (this.titleToDbIds[title]) {
        let existingDbIds = this.titleToDbIds[title];
        console.log(`existingDbIds = ${JSON.stringify(existingDbIds, null, 2)}`);
        for (let dbId of existingDbIds) {
          let recentChange = this.dbIdToRecentChangeMap[dbId];
          if (newRecentChange.timestamp > recentChange.timestamp)
            recentChange.overriden = true;
        }
      }

      this.revisionCounter++;
      if (
              (newRecentChange.namespace === 0 || !this.requireArticleNamespace) &&
              (newRecentChange.nonbot === true || !this.requireNonBot) &&
              (newRecentChange.wiki === 'enwiki' || !this.requireEnWiki) &&
              this.meetThreshold(newRecentChange)
      ) {
        this.showCounter++;
        let diffApiUrl = `/api/diff?serverUrl=${this.getUrlBase(newRecentChange)}/&revId=${newRecentChange.revision.new}`;
        let diffJson = await this.$axios.$get(diffApiUrl);
        newRecentChange.diff = diffJson;
        this.dbIdToRecentChangeMap[newRecentChange._id] = newRecentChange;
        this.newRecentChangDbIds.unshift(newRecentChange._id); // TODO the list becomes larger and larger as time goes....
        if (!this.titleToDbIds[newRecentChange.title]) this.titleToDbIds[newRecentChange.title] = [];
        this.titleToDbIds[newRecentChange.title].push(newRecentChange._id);
      } else {
        // Do nothing for not showing recent changes.
      }
    }
  },
  mounted() {
    // Use the init recent chang to fill the screen
    this.initRecentChanges.forEach((async (rc) => await this.maybeShowRecentChange(rc)));

    socket.on('recent-change', async (newRecentChange) => {
      await this.maybeShowRecentChange(newRecentChange);
    });
    socket.on('client-activity', async (clientActivity) => {
      console.log(`client activity: ${clientActivity}`);
      this.liveUserCount = clientActivity.liveUserCount;
    });
    socket.on('interaction', async (interaction) => {
      this.stats.totalJudgement ++;
      let myGaId = this.$cookies.get("_ga");
      if (interaction.userGaId === myGaId) {
        this.stats.totalMyJudgement++;
      }
      console.log(`Received interaction: ${JSON.stringify(interaction, null, 2)}`);
      let dbId = interaction.recentChange._id;
      let newRecentChange = this.dbIdToRecentChangeMap[dbId];
      if (newRecentChange) {
        newRecentChange.judgementCounts = interaction.judgementCounts;
      } else {
        console.warn(`Some interaction for dbId=${dbId} is on changes not visible on this session, ignored....`);
      }
    });
  }
}
</script>

<style>
  .bg-darker-light {
    background-color: #F5F5F5;
  }
  .diff-context {
    word-break: break-all;
    width: 50%;
  }
  .diff-deletedline,.diff-addedline {
    word-break: break-all;
    width: 50%
  }
  .blue-link {
    color:blue
  }
  @media (max-width: 576px) {
    .small-screen-padding {
      padding-left: 6px;
      padding-right: 6px;
    }
  }
</style>
