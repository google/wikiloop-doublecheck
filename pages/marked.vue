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
        <RevisionCard
            :wikiRevId="wikiRevId"
            :interactionProp="wikiRevIdToInfo[wikiRevId].interaction"
            :oresProp="wikiRevIdToInfo[wikiRevId].ores"
            :revisionProp="wikiRevIdToInfo[wikiRevId].revision"
        ></RevisionCard>
      </div>
      <div class="col-12 p-2" v-if="!isEnd && loading">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </section>

</template>
<script>
  import RevisionCard from '~/components/RevisionCard.vue';

  // Margin (in pixels) above the bottom of the screen at which new history entries begin to load.
  const SCROLL_OFFSET = 50;

  export default {
    components: {
      RevisionCard
    },
    data() {
      return {
        offset: 0,
        limit: 10,
        wikiRevIds: [],
        wikiRevIdToInfo: {},
        isEnd: false,
        loading: false
      };
    },
    methods: {
      loadMore: async function () {
        this.loading = true;
        let params = {
          offset: this.offset,
          limit: this.limit,
        };
        if (this.$router.history.current.query.userGaId) {
          params.userGaIds = [this.$router.history.current.query.userGaId];
        } else if (this.$router.history.current.query.wikiUserName) {
          params.wikiUserName = this.$router.history.current.query.wikiUserName;
        } else if (this.$router.history.current.query.userGaIds) {
          params.userGaIds = this.$router.history.current.query.userGaIds.split('|');
        } else if (this.$router.history.current.query.wikiRevIds) {
          params.wikiRevIds = this.$router.history.current.query.wikiRevIds.split('|');
        }
        const interactionsFetched = await this.$axios.$get(`/api/interactions`, { params: params });
        if (this.offset == 0 && params.wikiRevIds && params.wikiRevIds.length) {
          let fetchedWikiRevIds = new Set(interactionsFetched.map(interaction => interaction.wikiRevId));
          for (let wikiRevId of params.wikiRevIds) {
            if (!fetchedWikiRevIds.has(wikiRevId)) {
              // Add WikiRevIds that is not stored with an interaction
              interactionsFetched.push({
                "wikiRevId": wikiRevId,
                "judgements": [], // empty
                "recentChange": 0,
                "lastTimestamp": 0,
                "counts": {
                  Total: 0,
                  NotSure: 0,
                  ShouldRevert: 0,
                },
              });
            }
          }
        }
        if (interactionsFetched.length) {
          this.offset += interactionsFetched.length;
          const revisionsFetched = await this.$axios.$get(
              `/api/revisions`, {
                params: {
                  wikiRevIds: interactionsFetched.map(interaction => interaction.wikiRevId)
                }
              }
          );
          const oresFetched = await this.$axios.$get(
              `/api/ores`, {
                params: {
                  wikiRevIds: interactionsFetched.map(interaction => interaction.wikiRevId)
                }
              }
          );
          interactionsFetched.forEach(interaction => {
            this.wikiRevIds.push(interaction.wikiRevId);
            this.wikiRevIdToInfo[interaction.wikiRevId] = {};
            this.wikiRevIdToInfo[interaction.wikiRevId].interaction = interaction;
          });
          Object.values(revisionsFetched).flat().forEach(item => this.wikiRevIdToInfo[item.wikiRevId].revision = item);
          Object.values(oresFetched).flat().forEach(item => this.wikiRevIdToInfo[item.wikiRevId].ores = item);
        }
        else {
          this.isEnd = true;
        }
        this.loading = false;
      },
      handleScroll: function(e) {
        if (!this.isEnd &&
            !this.loading &&
            (document.documentElement.scrollTop + window.innerHeight >=
              document.documentElement.offsetHeight - SCROLL_OFFSET)) {
          this.loading = true;
          this.loadMore();
        }
      }
    },
    async asyncData({$axios}) {
      const version = await $axios.$get(`/api/version`);
      const stats = await $axios.$get(`/api/stats`);
      return {
        version,
        stats,
      };
    },
    async mounted() {
      this.$ga.page('/marked.vue'); // track page
      await this.loadMore();
    },
    created() {
      if (process.client) {
        window.addEventListener('scroll', this.handleScroll);
      }
    },
    destroyed() {
      if (process.client) {
        window.removeEventListener('scroll', this.handleScroll);
      }
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
