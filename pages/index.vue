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
      <div class="m-auto" v-if="newRecentChanges.length === 0">
        <h1 class="m-auto">Please wait for the first vandal edit to show up....</h1>
      </div>
      <div
        v-for="newRecentChange of newRecentChanges"
        v-bind:key="newRecentChange.id"
        class="col-12 p-2"
      >
        <div v-bind:class="{ 'border-danger': badfaith(newRecentChange), 'bg-gradient-danger': badfaith(newRecentChange), 'border-warning': damaging(newRecentChange), 'bg-gradient-danger': damaging(newRecentChange) }"
             class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">
              <a v-bind:href="`${getUrlBase(newRecentChange)}/wiki/Special:Diff/${newRecentChange.revision.new}`">{{ newRecentChange.title }}</a>
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
              <small>by <a v-bind:href="`${getUrlBase(newRecentChange)}/wiki/User:${newRecentChange.user}`">{{ newRecentChange.user }}</a>
                <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                  <i v-bind:class="{ 'text-danger': badfaith(newRecentChange) }" class="fas fa-theater-masks"></i>: {{ damagingPercent(newRecentChange) }},
                </span>
                <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                  <i v-bind:class="{ 'text-warning': damaging(newRecentChange) }" class="fas fa-cloud-rain"></i>: {{ badfaithPercent(newRecentChange) }}
                </span>
              </small>
            </h6>
            <div class="card-text w-100">
              <diff-box v-bind:diffContent="newRecentChange.diff.compare['*']" />
            </div>
            <div class="mt-4 d-flex justify-content-center">
              <div class="btn-group">
                <button
                  v-on:click="interactionBtn(`LooksGood`, newRecentChange)"
                  class="btn btn-sm btn-outline-success"
                  v-bind:class="{ 'btn-success':newRecentChange.judgement === 'LooksGood', 'btn-outline-success':newRecentChange.judgement !== 'LooksGood' }">Looks good</button>
                <button
                  v-on:click="interactionBtn(`NotSure`, newRecentChange)"
                  v-bind:class="{ 'btn-secondary':newRecentChange.judgement === 'NotSure', 'btn-outline-secondary':newRecentChange.judgement !== 'NotSure' }"
                  class="btn btn-sm btn-outline-secondary">Not sure</button>
                <button
                  v-on:click="interactionBtn(`ShouldRevert`, newRecentChange)"
                  v-bind:class="{ 'btn-danger':newRecentChange.judgement === 'ShouldRevert', 'btn-outline-danger':newRecentChange.judgement !== 'ShouldRevert' }"
                  class="btn btn-sm" target="_blank">Should revert</button>
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

const $ = require('jquery');

export default {
  comments: {
    BootstrapVue
  },
  components: {
    DiffBox
  },
  data() {
    return {
      title: 'WikiLoop Battlefield',
      recentChanges: [],
      newRecentChanges: [],
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
    getUrlBase: function (newRecentChange) {
      let lang = {
        'enwiki': 'en',
        'frwiki': 'fr',
        'ruwiki': 'ru'
      };
      return `http://${lang[newRecentChange.wiki]}.wikipedia.org`;
    },
    damaging: function (newRecentChange) {
      return newRecentChange.ores.damaging;
    },
    damagingPercent: function (newRecentChange) {
      return newRecentChange.ores.damagingScore;
    },
    badfaith: function (newRecentChange) {
      return newRecentChange.ores.badfaith;
    },
    badfaithPercent: function (newRecentChange) {
      return newRecentChange.ores.badfaithScore;
    },
    interactionBtn: async function(judgement, newRecentChange) {
      let url = `${this.getUrlBase(newRecentChange)}/w/index.php?title=${newRecentChange.title}&action=edit&undoafter=${newRecentChange.revision.old}&undo=${newRecentChange.revision.new}&summary=Reverted%20with%20[[:m:WikiLoop Battlefield]] tool (https://battlefield.wikiloop.org).`;
      let gaId = this.$cookies.get("_ga");
      console.log(`gaId`, gaId);
      let postBody = {
        gaId: gaId,
        judgement: judgement,
        newRecentChange: newRecentChange
      };
      console.log(`postBody`, postBody);
      if (judgement === `ShouldRevert`) window.open(url, '_blank');
      let ret = await $.post(`/api/interaction`, postBody);
      newRecentChange.judgement = judgement;
      console.log(`interaction ret:`, ret);
    }
  },
  mounted() {
    socket.on('recent-change', async (newRecentChange) => {
      this.revisionCounter++;
      if (
        (newRecentChange.namespace === 0 || !this.requireArticleNamespace) &&
        (newRecentChange.nonbot === true || !this.requireNonBot) &&
        (newRecentChange.wiki === 'enwiki' || !this.requireEnWiki) &&
        (newRecentChange.ores.damaging || !this.requireDamaging) &&
        (newRecentChange.ores.badfaith || !this.requireBadfaith)
      ) {
        this.showCounter++;
        console.warn(`doshowing newRecentChange ${JSON.stringify(newRecentChange)}`);
        let diffJson = await $.get(`/api/diff?serverUrl=${this.getUrlBase(newRecentChange)}/&revId=${newRecentChange.revision.new}`);
        newRecentChange.diff = diffJson;
        this.newRecentChanges.unshift(newRecentChange);
      } else {
        console.log(`notshowing newRecentChange ${JSON.stringify(newRecentChange)}`);
      }
    });
    socket.on('client-activity', async (clientActivity) => {
      console.log(`client activity: ${clientActivity}`);
      this.liveUserCount = clientActivity.liveUserCount;
    });
  }
}
</script>

<style>
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
