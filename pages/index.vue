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
<!--eslint-disable-->
<template>

  <section>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
        <div class="version">
          <div class="demo version-section"><a href="https://github.com/google/wikiloop-battlefield" class="github-corner">
            <svg width="56" height="56" viewBox="0 0 250 250" style="fill:#64CEAA; color:#fff; position: absolute; top: 0; border: 0; left: 0; transform: scale(-1, 1);">
              <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
              <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
              <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
            </svg></a>
          </div>
        </div>
        <a class="navbar-brand" href="#">WikiLoop Battlefield</a>
        <b-navbar-toggle  target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item class="active" href="/">Home</b-nav-item>
            <b-nav-item href="/marked">Marked</b-nav-item>
            <b-nav-item href="/api/stats">Stats (<i class="fas fa-smile-wink"></i> {{stats.totalMyJudgement}}/ <i
                class="fas fa-globe-europe"></i> {{stats.totalJudgement}})
            </b-nav-item>
            <b-nav-item href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop">About</b-nav-item>
            <b-nav-item href="https://github.com/google/wikiloop-battlefield/issues">Issues</b-nav-item>
            <b-nav-item href="#">Online: {{ liveUserCount }}</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </nav>
    <div class="container small-screen-padding" style="margin-top:60px">
      <h5>
        {{showCounter}} out of {{revisionCounter}} revisions matches <span
          class="btn btn-sm btn-outline-primary" v-b-modal.filter-modal>filters</span> or <span v-on:click="pause = !pause" class="btn btn-sm btn-outline-primary">pause</span> it.
      </h5>
      <div class="m-auto" v-if="newRecentChangDbIds.length === 0">
        <h1 class="m-auto">Please wait for the first vandal edit to show up....</h1>
      </div>
      <div
          v-for="newRecentChangDbId of newRecentChangDbIds"
          v-bind:key="newRecentChangDbId"
          class="col-12 p-2">
          <NewRevisionCard
            :wikiRevId="`${dbIdToRecentChangeMap[newRecentChangDbId].wiki}:${dbIdToRecentChangeMap[newRecentChangDbId].revision.new}`"
            ></NewRevisionCard>
      </div>
    </div>
    <b-modal id="filter-modal" title="Filters">
      <b-form-group label="Require">
        <b-form-checkbox v-model="requireEnWiki">en-wiki</b-form-checkbox>
        <b-form-checkbox v-model="requireNonBot">non-bot</b-form-checkbox>
        <b-form-checkbox v-model="requireArticleNamespace">article namespace</b-form-checkbox>
        <b-form-checkbox v-model="requireBadfaith">bad-faith (by WMF ORES score)</b-form-checkbox>
        <b-form-checkbox v-model="requireDamaging">damaging (by WMF ORES score)</b-form-checkbox>
        <span for="thresold">Threshold: </span>
        <button v-on:click="changeThreshold(0.1)" class="btn btn-sm"><i class="fas fa-chevron-up"></i></button>
        <span id="thresold"> {{ threshold ? threshold.toFixed(2) : "(default)" }}</span>
        <button v-on:click="changeThreshold(-0.1)" class="btn btn-sm"><i class="fas fa-chevron-down"></i>
        </button>
        <button v-on:click="resetThreshold()" class="btn btn-sm"><i class="fas fa-sync-alt"></i></button>
      </b-form-group>
    </b-modal>
  </section>

</template>
<script>
  import socket from '~/plugins/socket.io.js';
  import BootstrapVue from 'bootstrap-vue';
  import RecentChangeCard from '~/components/RecentChangeCard.vue';
  import NewRevisionCard from '~/components/NewRevisionCard.vue';
  import VueTimeago from 'vue-timeago';
  import utility from '../shared/utility';

  const $ = require('jquery');

  export default {
    comments: {
      BootstrapVue,
      VueTimeago
    },
    components: {
      RecentChangeCard,
      NewRevisionCard
    },
    computed: {
      getRecentChange: function(dbId) {
        return this.dbIdToRecentChangeMap[dbId];
      }
    },
    data() {
      return {
        title: 'WikiLoop Battlefield',
        wikiRevIds:[],
        newRecentChangDbIds: [],
        dbIdToRecentChangeMap: {},
        bufferNewRecentChange: {},
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
        stale: false,
        pause: false,
        timer: null,
        // loaded: false
      }
    },
    async asyncData({$axios}) {
      const initRecentChanges = await $axios.$get(`/api/latestRevs?serverUrl=http://en.wikipedia.org/`);
      const version = await $axios.$get(`/api/version`);
      const stats = await $axios.$get(`/api/stats`);
      return {initRecentChanges, version, stats};
    },
    methods: {
      refreshTimer: function() {
        clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
          this.stale = true;
        }, 15000);  // we at least allow 1 new card each 15 seconds.
      },
      meetThreshold: function (newRecentChange) {
        if (this.stale) return true;
        else if (this.threshold !== null) {
          return (newRecentChange.ores.damagingScore >= this.threshold || !this.requireDamaging) &&
              (newRecentChange.ores.badfaithScore >= this.threshold || !this.requireBadfaith);
        } else {
          return (newRecentChange.ores.damaging || !this.requireDamaging) &&
              (newRecentChange.ores.badfaith || !this.requireBadfaith);
        }
      },
      resetThreshold: function () {
        this.threshold = null;
      },
      changeThreshold: function (change) {
        if (this.threshold === null) this.threshold = 0.7;
        this.threshold = (this.threshold + change);
        if (this.threshold >= 1.0) {
          this.threshold = 1.0;
        } else if (this.threshold <= 0) this.threshold = 0.0;
      },

      maybeShowRecentChange: async function (newRecentChange) {
        if (this.dbIdToRecentChangeMap[newRecentChange._id]) {
          // ignore existing recent change. - could be prefetched
          return;
        }
        let title = newRecentChange.title;
        if (this.titleToDbIds[title]) {
          let existingDbIds = this.titleToDbIds[title];
          for (let dbId of existingDbIds) {
            let recentChange = this.dbIdToRecentChangeMap[dbId];
            if (newRecentChange.timestamp > recentChange.timestamp) {
              recentChange.overriden = true;
            }
          }
        }

        this.revisionCounter++;
        if (
            (newRecentChange.namespace === 0 || !this.requireArticleNamespace) &&
            (newRecentChange.nonbot === true || !this.requireNonBot) &&
            (newRecentChange.wiki === 'enwiki' || !this.requireEnWiki) &&
            this.meetThreshold(newRecentChange)
        ) {
          this.stale = false; // resets the stale
          this.showCounter++;
          await this.fetchDiff(newRecentChange);
          this.dbIdToRecentChangeMap[newRecentChange._id] = newRecentChange;
          this.newRecentChangDbIds.unshift(newRecentChange._id); // TODO the list becomes larger and larger as time goes....
          if (!this.titleToDbIds[newRecentChange.title]) this.titleToDbIds[newRecentChange.title] = [];
          this.titleToDbIds[newRecentChange.title].push(newRecentChange._id);
          this.refreshTimer();

        } else {
          // Do nothing for not showing recent changes.
        }
      }
    },
    beforeMount() {
      this.getUrlBase = utility.getUrlBase.bind(this); // now you can call this.getUrlBase() (in your functions/template)
      this.fetchDiff = utility.fetchDiff.bind(this); // now you can call this.fetchDiff() (in your functions/template)
    },
    mounted() {
      // Use the init recent chang to fill the screen
      this.initRecentChanges.forEach((async (rc) => await this.maybeShowRecentChange(rc)));
      socket.on('recent-change', async (newRecentChange) => {
        // This is a hack fix of an existing Vue caveat: a new data will not have "reactivity"
        // if not being added to Vue data. https://vuejs.org/v2/guide/list.html#Caveats
        // Related bug https://github.com/google/wikiloop-battlefield/issues/22
        // By assigning it to a Vue data, it gets reactivity and we are good. But it's a hack...
        // Until Vue fixes this....
        this.bufferNewRecentChange = newRecentChange;
        await this.maybeShowRecentChange(this.bufferNewRecentChange);
        this.stats = await this.$axios.$get(`/api/stats`);
      });
      socket.on('client-activity', async (clientActivity) => {
        console.log(`client activity: ${clientActivity}`);
        this.liveUserCount = clientActivity.liveUserCount;
      });
      document.addEventListener('stats-update', async () => {
        console.log(`stats-update:`);
        this.stats = await this.$axios.$get(`/api/stats`);
      });
    }
  }
</script>

<style>
  @media (max-width: 576px) {
    .small-screen-padding {
      padding-left: 6px;
      padding-right: 6px;
    }
  }
</style>
