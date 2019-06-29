<!--eslint-disable-->
<template>

  <section>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
      <a class="navbar-brand" href="#">Battlefield <sup>beta</sup></a>
      <button class="navbar-toggler" type="button" data-toggle="collapse"
              data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <b-form-checkbox
        id="checkbox-pause"
        v-model="pause"
        name="checkbox-pause"
        value="true"
        unchecked-value="false"
      >
        Pause
      </b-form-checkbox>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home</a>
          </li>
          <li class="nav-item active">
            <!-- Modal Component -->
            <b-modal id="filter-modal" title="Filters">
              <b-form-group label="Require">
                <b-form-checkbox v-model="requireEnWiki" >en-wiki</b-form-checkbox>
                  <b-form-checkbox v-model="requireNonBot" >non-bot</b-form-checkbox>
                  <b-form-checkbox v-model="requireArticleNamespace" >article namespace</b-form-checkbox>
                  <b-form-checkbox v-model="requireBadfaith" >bad-faith (by WMF ORES score)</b-form-checkbox>
                  <b-form-checkbox v-model="requireDamaging">damaging (by WMF ORES score)</b-form-checkbox>
              </b-form-group>
            </b-modal>
          </li>
        </ul>
        <div>Online: {{ liveUserCount }}</div>
      </div>
      </div>
    </nav>
    <div class="container" style="margin-top:60px">
      <h3>
        {{showCounter}} out of {{revisionCounter}} revisions matches <span class="btn btn-outline-primary" v-b-modal.filter-modal>filters</span>
        or you can  <span class="btn btn-outline-primary" v-on:click="pause = !pause">pause it</span>
      </h3>
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
          <div class="card-body d-flex flex-column">
            <h5 class="card-title ">
              <div class="d-flex">
                <div class="flex-grow-1">
                  <a v-bind:href="`${getUrlBase(dbIdToRecentChangeMap[newRecentChangDbId])}/wiki/Special:Diff/${dbIdToRecentChangeMap[newRecentChangDbId].revision.new}`">{{ dbIdToRecentChangeMap[newRecentChangDbId].title }}</a>
                </div>
                <div v-if="isOverridden(newRecentChangDbId)"> Overriden </div>
              </div>

            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
              <small>
                <div>by <a v-bind:href="`${getUrlBase(dbIdToRecentChangeMap[newRecentChangDbId])}/wiki/User:${dbIdToRecentChangeMap[newRecentChangDbId].user}`">{{ dbIdToRecentChangeMap[newRecentChangDbId].user }}</a></div>
                <div>
                  <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                    <i v-bind:class="{ 'text-danger': badfaith(newRecentChangDbId) }" class="fas fa-theater-masks"></i>: {{ damagingPercent(newRecentChangDbId) }},
                  </span>
                  <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                    <i v-bind:class="{ 'text-warning': damaging(newRecentChangDbId) }" class="fas fa-cloud-rain"></i>: {{ badfaithPercent(newRecentChangDbId) }}
                  </span>
                </div>
                <div><i class="fas fa-clock"></i> <timeago :datetime="getTimeString(newRecentChangDbId)" :auto-update="60"></timeago></div>

              </small>
            </h6>
            <div class="card-text w-100">
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
      recentChanges: [],
      newRecentChangDbIds: [],
      dbIdToRecentChangeMap: {},
      titleToDbIds: {},
      requireEnWiki: true,
      requireDamaging: true,
      requireBadfaith: true,
      requireArticleNamespace: true,
      requireNonBot: true,
      revisionCounter: 0,
      basicFilterCounter: 0,
      liveUserCount: 1,
      showCounter: 0,
      pause: false
      // loaded: false
    }
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
      let url = `${this.getUrlBase(newRecentChange)}/w/index.php?title=${newRecentChange.title}&action=edit&undoafter=${newRecentChange.revision.old}&undo=${newRecentChange.revision.new}&summary=Reverted%20with%20[[:m:WikiLoop Battlefield]] tool (https://battlefield.wikiloop.org).`;
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
      console.log(`interaction ret:`, ret);
    }
  },
  mounted() {
    socket.on('recent-change', async (newRecentChange) => {
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
        (newRecentChange.ores.damaging || !this.requireDamaging) &&
        (newRecentChange.ores.badfaith || !this.requireBadfaith)
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
      }
    });
    socket.on('client-activity', async (clientActivity) => {
      console.log(`client activity: ${clientActivity}`);
      this.liveUserCount = clientActivity.liveUserCount;
    });
    socket.on('interaction', async (interaction) => {
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
</style>
