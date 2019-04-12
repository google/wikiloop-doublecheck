<template>
  <section class="container">
    <div class="w-100">
      <h1>
        {{ title }}
      </h1>
      <div>
        <diff-box>Hello</diff-box>
      </div>
      <h3>
        Fight vandalism together.
      </h3>

      <h3> Read {{ revisionCounter }} revisions, {{ basicFilterCounter }} passed basic filter, displayed {{ showCounter }} revisions. </h3>
      <div v-if="recentChanges.length === 0" class="my-2 spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="form-check">
        <input id="defaultCheck1" v-model="requireBasicFilter" class="form-check-input" type="checkbox" value="">
        <label class="form-check-label" for="defaultCheck1">Require basic filter (enwiki, type=edit, non-bot)
        </label>
      </div>
      <div class="form-check">
        <input id="defaultCheck2" v-model="requireDamaging" class="form-check-input" type="checkbox" value="">
        <label class="form-check-label" for="defaultCheck1">Require damaging
        </label>
      </div>
      <div class="form-check">
        <input id="defaultCheck3" v-model="requireBadfaith" class="form-check-input" type="checkbox" value="">
        <label class="form-check-label" for="defaultCheck2">Require badfaith
        </label>
      </div>
      <div class="d-flex flex-wrap ">
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
                <small>Editor: <a v-bind:href="`${recentChange.server_url}/wiki/User:${recentChange.user}`">{{ recentChange.user }}</a></small>
                <!--<a class="badge badge-secondary" v-bind:href="`https://xtools.wmflabs.org/ec/${recentChange.server_name}/${recentChange.user}`">Xtools</a>-->
              </h6>
              <div class="card-text">
                <diff-box v-bind:diffContent="recentChange.diff.compare['*']" />
              </div>
              <div class="card-text flex-grow-1">
                <div class="row border">
                  <div class="col-4 border" />
                  <div class="col-4 border">badfaith</div>
                  <div class="col-4 border">damaging</div>
                </div>
                <div class="row border">
                  <div class="col-4 border">result</div>
                  <div class="col-4 border">{{ !recentChange.ores.enwiki.scores[recentChange.revision.new].goodfaith.score.prediction }}</div>
                  <div class="col-4 border">{{ recentChange.ores.enwiki.scores[recentChange.revision.new].damaging.score.prediction }}</div>
                </div>
                <div class="row border">
                  <div class="col-4 border">prob</div>
                  <div class="col-4 border">{{ (1 - recentChange.ores.enwiki.scores[recentChange.revision.new].goodfaith.score.probability.true).toLocaleString("en", {style: "percent"}) }}</div>
                  <div class="col-4 border">{{ recentChange.ores.enwiki.scores[recentChange.revision.new].damaging.score.probability.true.toLocaleString("en", {style: "percent"}) }}</div>
                </div>
              </div>
              <div class="mt-2">
                <div class="btn-group">
                  <button href="#" class="btn btn-sm btn-outline-success">Looks good</button>
                  <button href="#" class="btn btn-sm btn-outline-secondary">Not sure</button>
                  <button href="#" class="btn btn-sm btn-outline-danger">Should revert</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--<table class="table table-light table-responsive table-hover table-bordered">-->
          <!--<thead>-->
            <!--<tr class="row">-->
              <!--<th scope="col" class="col-6">Page by Author</th>-->
              <!--<th scope="col" class="col-6">ORES</th>-->
            <!--</tr>-->
          <!--</thead>-->
          <!--<tbody>-->
            <!--<tr-->
              <!--class="row"-->
              <!--v-for="recentChange of recentChanges"-->
              <!--v-bind:key="recentChange.id"-->
            <!--&gt;-->
              <!--<th class="col-6" scope="row">-->
                <!--<a v-bind:href="recentChange.meta.uri">{{ recentChange.title }}</a><br/>-->
                <!--<small>by User:<a v-bind:href="`${recentChange.server_url}/wiki/User:${recentChange.user}`">{{ recentChange.user }}</a></small>-->
                <!--<a class="badge badge-secondary" v-bind:href="`https://xtools.wmflabs.org/ec/${recentChange.server_name}/${recentChange.user}`">Xtools</a>-->
              <!--</th>-->
              <!--<td class="col-6">-->
                <!--Damaging: {{ recentChange.ores.enwiki.scores[recentChange.revision.new].damaging.score.prediction}}<br/>-->
                <!--Goodfaith: {{ recentChange.ores.enwiki.scores[recentChange.revision.new].goodfaith.score.prediction}}-->
              <!--</td>-->
            <!--</tr>-->
          <!--</tbody>-->
        <!--</table>-->
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
      requireDamaging: true,
      requireBadfaith: true,
      requireBasicFilter: true,
      revisionCounter: 0,
      basicFilterCounter: 0,
      showCounter: 0
      // loaded: false
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
          console.log(`damaging`, damaging, `badfaith`, badfaith);

          let vandalFilter = (damaging || !this.requireDamaging) &&
            (badfaith || !this.requireBadfaith);
          let diffJson = await $.get("/api/diff");
          console.log(`XXX diff=${data.revision.new}, diff=${diffJson}`, diffJson);
          data.diff = diffJson;
          // }
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
  .container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .subtitle {
    font-weight: 300;
    font-size: 42px;
    color: #526488;
    word-spacing: 5px;
    padding-bottom: 15px;
  }

  .links {
    padding-top: 15px;
  }
</style>
