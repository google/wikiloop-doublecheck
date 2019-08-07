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
    <div class="container small-screen-padding" style="margin-top:80px">
      <h4 v-if="$router.history.current.query.userGaId === $cookiez.get('_ga')">My History</h4>
      <h4 v-else >History</h4>
      <div v-for="wikiRevId of wikiRevIds"
           v-bind:key="wikiRevId"
           class="col-12 p-2"
      >
        <NewRevisionCard
            :wikiRevId="wikiRevId"
            :interactionProp="wikiRevIdToInfo[wikiRevId].interaction"
            :oresProp="wikiRevIdToInfo[wikiRevId].ores"
            :revisionProp="wikiRevIdToInfo[wikiRevId].revision"
        ></NewRevisionCard>
      </div>
      <div class="col-12 p-2" v-if="!isEnd">
        <button class="btn btn-outline-primary btn-block my-3" v-on:click="loadMore()">Load More</button>
      </div>
      <div class="col-12 p-2" v-if="!isEnd">
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
    data() {
      return {
        offset: 0,
        limit: 10,
        wikiRevIds: [],
        wikiRevIdToInfo: {},
        isEnd: false,
      };
    },
    methods: {
      loadMore: async function () {
        let params = {
          offset: this.offset,
          limit: this.limit,
        };
        if (this.$router.history.current.query.userGaId) {
          params.userGaIds = [this.$router.history.current.query.userGaId];
        } else if (this.$router.history.current.query.wikiRevIds) {
          params.wikiRevIds = this.$router.history.current.query.wikiRevIds;
        }

        const interactionsFetched = await this.$axios.$get(`/api/interactions`, { params: params });
        if (interactionsFetched.length) {
          this.offset += interactionsFetched.length;
          const revisionsFetched = await this.$axios.$get(
              `/api/revisions`, {
                params: {
                  wiki: 'enwiki', // TODO update this when we support multiple wikis
                  revIds: interactionsFetched.map(interaction => interaction.wikiRevId.split(':')[1])
                }
              }
          );
          const oresFetched = await this.$axios.$get(
              `/api/ores`, {
                params: {
                  wiki: 'enwiki', // TODO update this when we support multiple wikis
                  revIds: interactionsFetched.map(interaction => interaction.wikiRevId.split(':')[1])
                }
              }
          );
          interactionsFetched.forEach(interaction => {
            this.wikiRevIds.push(interaction.wikiRevId);
            this.wikiRevIdToInfo[interaction.wikiRevId] = {};
            this.wikiRevIdToInfo[interaction.wikiRevId].interaction = interaction;
          });
          revisionsFetched.forEach(item => this.wikiRevIdToInfo[item.wikiRevId].revision = item);
          oresFetched.forEach(item => this.wikiRevIdToInfo[item.wikiRevId].ores = item);
        }
        else {
          this.isEnd = true;
        }
      },
    },
    async asyncData({$axios}) {
      const version = await $axios.$get(`/api/version`);
      const stats = await $axios.$get(`/api/stats`);
      return {
        version,
        stats,
      };
    },
    async beforeMount() {
      await this.loadMore();
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
