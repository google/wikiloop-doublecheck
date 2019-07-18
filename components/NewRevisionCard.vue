<template>
  <section>
    <div><h1>WikiRevId:</h1>{{wikiRevId}}</div>
    <div><h2>Interaction:</h2>{{interaction}}</div>
    <div><h3>Revision:</h3>{{revision}}</div>
    <div><h3>Ores:</h3>{{ores}}</div>
    <div><h3>Diff:</h3>{{diff}}</div>
  </section>

</template>
<script>
  export default {
    props: {
      wikiRevId: String,
      ores: {
        type: Object,
        default: null
      },
      diff: {
        type: Object,
        default: null
      },
      interaction: {
        type: Object,
        default: null
      },
      revision: {
        type: Object,
        default: null
      },
    },
    data() {
      return {
      }
    },

    async mounted() {
      if (!this.interaction) {
        let interactions = await this.$axios.$get(`/api/interaction/${this.wikiRevId}`);
        if (interactions.length > 0) this.interaction = interactions[0];
      }
      if (!this.revision) {
        this.revision = await this.$axios.$get(`/api/revision/${this.wikiRevId}`);
      }
      if (!this.diff) {
        this.diff = await this.$axios.$get(`/api/diff/${this.wikiRevId}`);
      }
      if (!this.ores) {
        this.ores = await this.$axios.$get(`/api/ores/${this.wikiRevId}`);
      }
    },
  }

</script>
<style>

</style>
