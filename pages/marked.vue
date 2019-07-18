<!--
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
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
      <h4>You can also download a CSV file <a href="/api/marked.csv">here</a> </h4>
      <div v-for="markedRevision of markdRevisions"
           v-bind:key="markedRevision.wikiRevId"
           class="col-12 p-2"
      >
        <NewRevisionCard :wikiRevId="markedRevision.wikiRevId"></NewRevisionCard>
      </div>
      <div v-if="!markdRevisions || markdRevisions.length === 0">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </section>

</template>
<script>
  import NewRevisionCard from '~/components/NewRevisionCard.vue';

  export default {
    components: {
      NewRevisionCard
    },
    async asyncData({$axios}) {
      const markdRevisions = await $axios.$get(`/api/markedRevs`);
      const version = await $axios.$get(`/api/version`);
      const stats = await $axios.$get(`/api/stats`);
      return { markdRevisions, version, stats };
    },
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
