<template>
  <section class="container">
    <div class="">
      <h1>
        {{ title }}
      </h1>
      <div>
        <table class="table table-bordered">
          <tr>
            <td>Page</td>
            <td>Wiki</td>
            <td>Bot</td>
            <td>Type</td>
            <td>Id</td>
            <td>Author</td>
          </tr>
          <tr
            v-for="recentChange of recentChanges"
            v-bind:key="recentChange.id"
          >
            <td><a v-bind:href="recentChange.meta.uri">{{ recentChange.title }}</a></td>
            <td>{{ recentChange.wiki }}</td>
            <td>{{ recentChange.bot }}</td>
            <td>{{ recentChange.type }}</td>
            <td>{{ recentChange.id }}</td>
            <td>{{ recentChange.user }}</td>
          </tr>
        </table>
      </div>
    </div>
  </section>
</template>
<script>
export default {
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

    eventSource.onmessage = (event) => {
      let filter = function(data) {
        // let oresUrl = ` http://ores.wmflabs.org/v3/scores/enwiki/?models=draftquality|wp10&revids=` + data.id;
        // const oresJson = await this.$axios.$get(oresUrl);
        return (
          data.wiki === "enwiki" &&
          data.bot === false &&
          data.type === "edit" &&
          data.namespace === 0
        );
      }

      let newData = JSON.parse(event.data);
      if (filter(newData)) {
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
