
<template>
    <section>
        <div class="my-1">
            <button class="btn btn-outline-primary" :disabled="prevWikiRevIds.length == 0"  v-on:click="showPrev()">Prev ({{prevWikiRevIds.length}})</button>
        </div>
        <template v-if="currentWikiRevId">
            <NewRevisionCard
                :wikiRevId="currentWikiRevId"
                :key="currentWikiRevId"
                v-on:judgement-event="showNext()"
                ></NewRevisionCard>
        </template>
    </section>
</template>

<script>
    import NewRevisionCard from '~/components/NewRevisionCard.vue';
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const REVIEW_QUEUE_SIZE = 500;
    export default {
        components: {
            NewRevisionCard
        },
        data() {
            return {
                title: 'WikiLoop Battlefield',
                currentWikiRevId: null,
                subscribeWiki: 'enwiki',
                nextWikiRevIds: [], // TODO consider moving to global
                prevWikiRevIds: [], // TODO consider moving to global
                maxTimestamp: null,
                minTimestamp: null,
                // a cache to store
                wikiRevIdToMeta: {} // TODO consider moving the global
            }
        },
        methods: {
            showNext: async function() {
                await sleep(300);
                await this.loadNextWikiRevId();
            },
            showPrev: async function() {
                await sleep(300);
                this.nextWikiRevIds.push(this.currentWikiRevId);
                this.currentWikiRevId = this.prevWikiRevIds.pop();
            },
            loadNextWikiRevId: async function() {
                if (this.nextWikiRevIds.length === 0) await this.loadWikiRevIds();

                // push into the current WikiRevId into the prev queue, and load a new one.
                if (this.currentWikiRevId) this.prevWikiRevIds.unshift(this.currentWikiRevId);
                this.currentWikiRevId = this.nextWikiRevIds.shift();
            },

            _computeAndStorePriority: function (wikiRevId) {
              // TODO(zzn): implement this function according to
              // the design discussion of https://github.com/google/wikiloop-battlefield/issues/112

              // Approach: using RevId as the quantifying measure.
              let priority = parseInt(wikiRevId.split(':')[1]);
              this.wikiRevIdToMeta[wikiRevId].meta = {};

              // For 20% of time, we will ask the reviewer to review a randomly generated revision
              // first somewhere, therefore, regardless.
              if (Math.random() <= 0.2) {
                priority += (REVIEW_QUEUE_SIZE); // and we don't consider any other factors.
                this.wikiRevIdToMeta[wikiRevId].meta.random = true;
              } else {
                if (this.wikiRevIdToMeta[wikiRevId]) {
                  let item = this.wikiRevIdToMeta[wikiRevId];
                  // The more suspicious, the more priority. We have not yet honored "hardcase" so far.
                  if (item.ores && item.ores.damaging && item.ores.damaging.true >= 0.5) {
                    priority += (REVIEW_QUEUE_SIZE);
                  }
                  if (item.ores && item.ores.damaging && item.ores.goodfaith.false >= 0.5) {
                    priority += (REVIEW_QUEUE_SIZE);
                  }
                }
              }
              this.wikiRevIdToMeta[wikiRevId].meta.priority = priority;
            },
            _sortWikiRevIds: async function(wikiRevIds) {
              // TODO(zzn): implement this function according to
              // the design discussion of https://github.com/google/wikiloop-battlefield/issues/112
              return wikiRevIds.sort((wikiRevId1, wikiRevId2) =>
                  this.wikiRevIdToMeta[wikiRevId2].meta.priority - this.wikiRevIdToMeta[wikiRevId1].meta.priority);
            },

           /** An internal function to load more revision Ids with time direction
            *
            * @param limit a number of limit of revisions to be returned.
            * @param isNew if new, we are querying newer revisions of our timewindow, else
            *   we are querying more older revisions.
            *   ----------------------------------------
            *  older <-||   revisions cached client  ||-> newer
            *     minTimestamp                maxTimestamp
            *   ----------------------------------------
            *
            *
           * @return {Promise<*>}
           */
            _loadWikiRevIdsWithTimeDirection: async function(limit, isNew = true) {
              let urlParams = new URLSearchParams();
              urlParams.set(`wiki`, this.subscribeWiki);
              urlParams.set(`limit`, limit);
              if (isNew) {
                if (this.maxTimestamp) urlParams.set("timestamp", this.maxTimestamp);
                // The semantic of direction follows `rcdir` in
                // https://www.mediawiki.org/wiki/API:Lists/All#Recentchanges
                urlParams.set("direction", "newer"); //
              } else {
                if (this.minTimestamp) {
                  urlParams.set("timestamp", this.minTimestamp);
                  // The semantic of direction follows `rcdir` in
                  // https://www.mediawiki.org/wiki/API:Lists/All#Recentchanges
                  urlParams.set("direction", "older");
                }
              }

              // TODO(zzn): create a new endpoint of `/api/recentchanges/list`
              let apiPage = await this.$axios.$get(`/api/recentchanges/list?${urlParams.toString()}`);
              let _timestamps = apiPage.map(item => item.timestamp);
              this.maxTimestamp = Math.max(this.maxTimestamp,..._timestamps);
              this.minTimestamp = Math.min(this.minTimestamp,..._timestamps);

              // TODO(zzn): consider a better way to cache it.
              apiPage.forEach(item => this.wikiRevIdToMeta[item.wikiRevId] = item);
              apiPage.forEach(item => this._computeAndStorePriority(item.wikiRevId));
              return apiPage.map(item => item.wikiRevId);
            },

          loadWikiRevIds: async function() {
            if (this.nextWikiRevIds.length <= REVIEW_QUEUE_SIZE) {
              let newerWikiRevIds = await this._loadWikiRevIdsWithTimeDirection(
                  REVIEW_QUEUE_SIZE - this.nextWikiRevIds.length, true);
              this.nextWikiRevIds = this.nextWikiRevIds.concat(newerWikiRevIds);
            }
            if (this.nextWikiRevIds.length <= REVIEW_QUEUE_SIZE) {
              let olderWikiRevIds = await this._loadWikiRevIdsWithTimeDirection(
                  REVIEW_QUEUE_SIZE - this.nextWikiRevIds.length, false);
              this.nextWikiRevIds = this.nextWikiRevIds.concat(olderWikiRevIds);
            }
            this.nextWikiRevIds = await this._sortWikiRevIds(this.nextWikiRevIds);
          }
        },

        async mounted() {
            await this.loadWikiRevIds();
            this.showNext();
        }
    }
</script>

<style>

</style>
