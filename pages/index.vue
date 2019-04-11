<template>
  <section class="container">
    <div class="w-100">
      <h1>
        {{ title }}
      </h1>
      <div>
        <!--<div-->
          <!--class="card col-4"-->
          <!--v-for="recentChange of recentChanges"-->
          <!--v-bind:key="recentChange.id"-->
        <!--&gt;-->
          <!--<div class="card-header">-->
            <!--<div>-->
              <!--{{ recentChange.title}}-->
            <!--</div>-->
          <!--</div>-->
          <!--<div class="card-body">-->
            <!--<p>{{ recentChange.id }}</p>-->
          <!--</div>-->
        <!--</div>-->
        <table class="table table-light table-responsive table-hover table-bordered">
          <tr>
            <th scope="col" class="col-6">Page</th>
            <th scope="col" class="col-1">Wiki</th>
            <th scope="col" class="col-1">Bot</th>
            <th scope="col" class="col-1">Type</th>
            <th scope="col" class="col-1">Id</th>
            <th scope="col" class="col-2">Author</th>
          </tr>
          <tr
            v-for="recentChange of recentChanges"
            v-bind:key="recentChange.id"
          >
            <th class="col-6" scope="row"><a v-bind:href="recentChange.meta.uri">{{ recentChange.title }}</a></th>
            <td class="col-1">{{ recentChange.wiki }}</td>
            <td class="col-1">{{ recentChange.bot }}</td>
            <td class="col-1">{{ recentChange.type }}</td>
            <td class="col-1">{{ recentChange.id }}</td>
            <td class="col-1"><a v-bind:href="`${recentChange.server_url}/wiki/User:${recentChange.user}`">{{ recentChange.user }}</a>
              <a
                class="badge badge-info"
                v-bind:href="`https://xtools.wmflabs.org/ec/${recentChange.server_name}/${recentChange.user}`"
              >Xtools
              </a>
            </td>
          </tr>
        </table>
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
        let ret = (
          data.wiki === "enwiki" &&
          data.bot === false &&
          data.type === "edit" &&
          data.namespace === 0
        );
        if (ret) {
          console.log(`Query!`);
          let revId = data.id;
          return new Promise((resolve, reject) => {
            let url = `https://ores.wmflabs.org/v3/scores/enwiki/?models=damaging|goodfaith&revids=${revId}`;
            console.log($);
            $.get(url, function(data) {
              console.log(data);
              resolve(ret);
            });
          });
        }
        return ret;
      };

      let newData = JSON.parse(event.data);
      if (await filter(newData)) {
        this.recentChanges.unshift(newData);
        this.recentChanges = this.recentChanges.slice(0, Math.min(this.recentChanges.length, 10));
        // console.log(newData);
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
