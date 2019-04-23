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
                  <b-form-checkbox v-model="requireBadfaith" >bad-faith (by WMF ORES™ score)</b-form-checkbox>
                  <b-form-checkbox v-model="requireDamaging">damaging (by WMF ORES™ score)</b-form-checkbox>
              </b-form-group>
            </b-modal>
          </li>
        </ul>
        <form class="form-inline mx-1 w-100 d-flex">
          <input class="form-control mr-sm-2 flex-grow-1" type="search" placeholder="Search"
                 aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
      </div>
    </nav>
    <div class="container" style="margin-top:60px">
      <h3>
        {{showCounter}} out of {{revisionCounter}} revisions matches <span class="btn btn-outline-primary" v-b-modal.filter-modal>filters</span>
        or you can  <span class="btn btn-outline-primary" v-on:click="pause = !pause">pause it</span>
      </h3>
      <div class="m-auto" v-if="recentChanges.length === 0">
        <h1 class="m-auto">Please wait for the first vandal edit to show up....</h1>
      </div>
      <div
        v-for="recentChange of recentChanges"
        v-bind:key="recentChange.id"
        class="col-12 p-2"
      >
        <div v-bind:class="{ 'border-danger': badfaith(recentChange), 'bg-gradient-danger': badfaith(recentChange), 'border-warning': damaging(recentChange), 'bg-gradient-danger': damaging(recentChange) }"
             class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">
              <a v-bind:href="`${recentChange.server_url}/wiki/Special:Diff/${recentChange.revision.new}`">{{ recentChange.title }}</a>
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
              <small>by <a v-bind:href="`${recentChange.server_url}/wiki/User:${recentChange.user}`">{{ recentChange.user }}</a>
                <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                  <i v-bind:class="{ 'text-danger': badfaith(recentChange) }" class="fas fa-theater-masks"></i>: {{ damagingPercent(recentChange) }},
                </span>
                <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                  <i v-bind:class="{ 'text-warning': damaging(recentChange) }" class="fas fa-cloud-rain"></i>: {{ badfaithPercent(recentChange) }}
                </span>
              </small>
            </h6>
            <div class="card-text w-100">
              <diff-box v-bind:diffContent="recentChange.diff.compare['*']" />
            </div>
            <div class="mt-4 d-flex justify-content-center">
              <div class="btn-group">
                <button
                  v-on:click="interactionBtn(`LooksGood`, recentChange)"
                  class="btn btn-sm btn-outline-success">Looks good</button>
                <button
                  v-on:click="interactionBtn(`NotSure`, recentChange)"
                  class="btn btn-sm btn-outline-secondary">Not sure</button>
                <button
                  v-on:click="interactionBtn(`ShouldRevert`, recentChange)"
                  class="btn btn-sm btn-outline-danger" target="_blank">Should revert</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import BootstrapVue from 'bootstrap-vue'
import DiffBox from '~/components/DiffBox.vue'

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
      requireEnWiki: true,
      requireDamaging: true,
      requireBadfaith: true,
      requireArticleNamespace: true,
      requireNonBot: true,
      revisionCounter: 0,
      basicFilterCounter: 0,
      showCounter: 0,
      pause: false
      // loaded: false
    }
  },
  methods: {
    damaging: function (recentChange) {
      let wiki = recentChange.wiki;
      return recentChange.ores[wiki].scores[recentChange.revision.new].damaging.score.prediction;
    },
    damagingPercent: function (recentChange) {
      let wiki = recentChange.wiki;
      return (1 - recentChange.ores[wiki].scores[recentChange.revision.new].goodfaith.score.probability.true).toLocaleString("en", { style: "percent" });
    },
    badfaith: function (recentChange) {
      let wiki = recentChange.wiki;
      return !recentChange.ores[wiki].scores[recentChange.revision.new].goodfaith.score.prediction;
    },
    badfaithPercent: function (recentChange) {
      let wiki = recentChange.wiki;
      return recentChange.ores[wiki].scores[recentChange.revision.new].damaging.score.probability.true.toLocaleString("en", { style: "percent" });
    },
    interactionBtn: async function(judgement, recentChange) {
      let url = `https://en.wikipedia.org/w/index.php?title=${recentChange.title}&action=edit&undoafter=${recentChange.revision.old}&undo=${recentChange.revision.new}`;
      let gaId = this.$cookies.get("_ga");
      console.log(`gaId`, gaId);
      let ret = await $.get(`/api/interaction`, {
        gaId: gaId,
        judgement: judgement,
        recentChange: recentChange
      });
      console.log(`interaction ret:`, ret);
      if (judgement === `ShouldRevert`) window.open(url, '_blank');
    }
  },
  mounted() {
    const url = 'https://stream.wikimedia.org/v2/stream/recentchange';
    console.log(`Connecting to EventStreams at ${url}`);

    const eventSource = new EventSource(url);
    eventSource.onopen = function(event) {
      console.log('--- Opened connection.');
    };

    eventSource.onerror = (event) => {
      console.error('--- Encountered error', event);
    };

    eventSource.onmessage = async (event) => {
      if (this.pause) return;
      this.revisionCounter += 1;
      let filter = async (data) => {
        let basicFilter = (
          data.type === "edit" &&
          // List should be a subset of from https://www.mediawiki.org/wiki/ORES/Support_table
          [`enwiki`, `frwiki`, `ruwiki`].indexOf(data.wiki) >= 0 &&
          (data.wiki === "enwiki" || !this.requireEnWiki) &&
          (data.bot === false || !this.requireNonBot) &&
          (data.namespace === 0 || !this.requireArticleNamespace)
        );
        if (basicFilter) {
          this.basicFilterCounter += 1;
          let oresUrl = `https://ores.wmflabs.org/v3/scores/${data.wiki}/?models=damaging|goodfaith&revids=${data.revision.new}`;
          let oresJson = await $.get(oresUrl);
          data.ores = oresJson;
          let damaging = data.ores.enwiki.scores[data.revision.new].damaging.score.prediction;
          let badfaith = !data.ores.enwiki.scores[data.revision.new].goodfaith.score.prediction;

          let vandalFilter = (damaging || !this.requireDamaging) &&
            (badfaith || !this.requireBadfaith);
          if (vandalFilter) {
            let diffJson = await $.get(`/api/diff?serverUrl=${data.server_url}&revId=${data.revision.new}`);
            data.diff = diffJson;
          }
          return vandalFilter;
          // console.log(oresJson.enwiki.scores);
        }

        return false;
      };

      let newData = JSON.parse(event.data);
      if (await filter(newData)) {
        this.showCounter += 1;
        this.recentChanges.unshift(newData);
        // if (this.recentChanges.length === 9) eventSource.close();
        this.recentChanges = this.recentChanges.slice(0, Math.min(this.recentChanges.length, 8));
        // console.log(newData);
        // this.loaded = true;
      }
    };
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
