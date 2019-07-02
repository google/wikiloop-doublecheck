<!--eslint-disable-->
<template>

  <section>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
        <a class="navbar-brand" href="https://github.com/xinbenlv/wikiloop-battlefield-vue">Battlefield <sup>v{{version}}</sup></a>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item class="active" href="/">Home</b-nav-item>
            <b-nav-item href="/marked">Marked</b-nav-item>
            <b-nav-item href="/api/stats">Stats (<i class="fas fa-smile-wink"></i> {{stats.totalMyJudgement}}/ <i
                class="fas fa-globe-europe"></i> {{stats.totalJudgement}})
            </b-nav-item>
            <b-nav-item href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop">About</b-nav-item>
            <b-nav-item href="https://github.com/xinbenlv/wikiloop-battlefield-vue/issues">Issues</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </nav>
    <div class="container small-screen-padding" style="margin-top:60px">
      <div v-for="recentChange of markedRecentChanges"
           v-bind:key="recentChange._id"
           class="col-12 p-2"
      >
        <RecentChangeCard :item="recentChange"></RecentChangeCard>
      </div>
    </div>
  </section>

</template>
<script>
  import RecentChangeCard from '~/components/RecentChangeCard.vue';
  import utility from '../shared/utility';

  export default {
    components: {
      RecentChangeCard
    },
    data() {
      return {
        markedRecentChanges: []
      }
    },
    async asyncData({$axios}) {
      const prefetchMarked = await $axios.$get(`/api/marked`);
      const version = await $axios.$get(`/api/version`);
      const stats = await $axios.$get(`/api/stats`);
      return { prefetchMarked, version, stats };
    },
    methods: {},
    beforeCreate() {
      this.getUrlBase = utility.getUrlBase.bind(this); // now you can call this.getUrlBase() (in your functions/template)
      this.fetchDiff = utility.fetchDiff.bind(this); // now you can call this.fetchDiff() (in your functions/template)
    },
    mounted() {
      Promise.all(this.prefetchMarked.map((async (rc) => await this.fetchDiff(rc)))).then(() => {
        this.markedRecentChanges = this.prefetchMarked;
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
