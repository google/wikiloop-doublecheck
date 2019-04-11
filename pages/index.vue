<template>
  <section class="container">
    <div class="w-100">
      <h1>
        {{ title }}
      </h1>
      <div class="d-flex flex-wrap ">
        <div
           class="col-lg-4 col-md-6 col-xs-12 p-2"
           v-for="recentChange of recentChanges"
           v-bind:key="recentChange.id">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">
                <a v-bind:href="`${recentChange.server_url}/wiki/Special:Diff/${recentChange.revision.new}`">{{ recentChange.title }}</a>
              </h5>
              <h6 class="card-subtitle mb-2 text-muted">
                <small>Editor: <a v-bind:href="`${recentChange.server_url}/wiki/User:${recentChange.user}`">{{ recentChange.user }}</a></small>
                <!--<a class="badge badge-secondary" v-bind:href="`https://xtools.wmflabs.org/ec/${recentChange.server_name}/${recentChange.user}`">Xtools</a>-->
              </h6>
              <div class="card-text flex-grow-1"></div>
              <div>
                <a href="#" class="card-link">Looks good</a>
                <a href="#" class="card-link">Should revert</a>
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
export default {
  comments: {
    BootstrapVue
  },
  data() {
    return {
      title: 'WikiLoop Battlefield',
      recentChanges: []
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
      let filter = async (data) => {
        let basicFilter = (
          data.wiki === "enwiki" &&
          data.bot === false &&
          data.type === "edit" &&
          data.namespace === 0
        );
        if (basicFilter) {
          let url = `https://ores.wmflabs.org/v3/scores/enwiki/?models=damaging|goodfaith&revids=${data.revision.new}`;
          let oresJson = await $.get(url);
          newData.ores = oresJson;
          // console.log(oresJson.enwiki.scores);
        }

        return basicFilter;
      };

      let newData = JSON.parse(event.data);
      if (await filter(newData)) {
        this.recentChanges.unshift(newData);
        if (this.recentChanges.length === 9) eventSource.close();
        this.recentChanges = this.recentChanges.slice(0, Math.min(this.recentChanges.length, 9));
        console.log(newData);
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
