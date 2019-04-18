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
            <a href="#" class="nav-link" v-b-modal.my-modal>Filters</a>
            <!-- Modal Component -->
            <b-modal id="my-modal" title="Filters">
              <b-form-group label="Edit type">
                <b-form-checkbox-group id="checkbox-group-2" name="flavour-2">
                  <b-form-checkbox value="orange">bot</b-form-checkbox>
                  <b-form-checkbox value="apple">article namespace</b-form-checkbox>
                </b-form-checkbox-group>
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
      <div
        v-for="recentChange of recentChanges"
        v-bind:key="recentChange.id"
        class="col-12 p-2 animated fadeIn"
      >
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">
              <a v-bind:href="`${recentChange.server_url}/wiki/Special:Diff/${recentChange.revision.new}`">{{ recentChange.title }}</a>
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
              <small>by <a v-bind:href="`${recentChange.server_url}/wiki/User:${recentChange.user}`">{{ recentChange.user }}</a>
                <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                  <i v-bind:class="{ 'text-danger': badfaith(recentChange) }" class="fas fa-theater-masks"></i>: {{ (1 - recentChange.ores.enwiki.scores[recentChange.revision.new].goodfaith.score.probability.true).toLocaleString("en", {style: "percent"}) }},
                </span>
                <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                  <i v-bind:class="{ 'text-danger': damaging(recentChange) }" class="fas fa-cloud-rain"></i>: {{ recentChange.ores.enwiki.scores[recentChange.revision.new].damaging.score.probability.true.toLocaleString("en", {style: "percent"}) }}
                </span>
              </small>
            </h6>
            <div class="card-text w-100">
              <diff-box v-bind:diffContent="recentChange.diff.compare['*']" />
            </div>
            <div class="mt-4 d-flex justify-content-center">
              <div class="btn-group">
                <button href="#" class="btn btn-sm btn-outline-success">Looks good</button>
                <button href="#" class="btn btn-sm btn-outline-secondary">Not sure</button>
                <a v-bind:href="`https://en.wikipedia.org/w/index.php?title=${recentChange.title}&action=edit&undoafter=prev&undo=${recentChange.revision.new}`"
                  class="btn btn-sm btn-outline-danger" target="_blank">Should revert</a>
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
      requireDamaging: false,
      requireBadfaith: false,
      requireBasicFilter: true,
      revisionCounter: 0,
      basicFilterCounter: 0,
      showCounter: 0,
      pause: false
      // loaded: false
    }
  },
  methods: {
    damaging: function (recentChange) {
      console.log(`XXX recentChange`, recentChange);
      let wiki = recentChange.wiki;
      return recentChange.ores[wiki].scores[recentChange.revision.new].damaging.score.prediction;
    },
    badfaith: function (recentChange) {
      let wiki = recentChange.wiki;
      return !recentChange.ores[wiki].scores[recentChange.revision.new].goodfaith.score.prediction;
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

    const $ = require('jquery');
    eventSource.onmessage = async (event) => {
      if (this.pause) return;
      this.revisionCounter += 1;
      let filter = async (data) => {
        let basicFilter = (
          data.wiki === "enwiki" &&
          data.bot === false &&
          data.type === "edit" &&
          data.namespace === 0
        );
        if (basicFilter || !this.requireBasicFilter) {
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
</style>
