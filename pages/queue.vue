
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
                this.nextWikiRevIds.unshift(this.currentWikiRevId);
                this.currentWikiRevId = this.prevWikiRevIds.shift();
            },
            loadNextWikiRevId: async function() {
                if (this.nextWikiRevIds.length === 0) await this.loadWikiRevIds();

                // push into the current WikiRevId into the prev queue, and load a new one.
                if (this.currentWikiRevId) this.prevWikiRevIds.push(this.currentWikiRevId);
                this.currentWikiRevId = this.nextWikiRevIds.pop();
            },

            _sortWikiRevIds: async function(wikiRevIds) {
              // TODO(zzn): implement this function according to
              // the design discussion of https://github.com/google/wikiloop-battlefield/issues/112
              return wikiRevIds; // currently by passing
            },

           /** An internal function to load more revision Ids with time direction
           *
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

              // TODO(zzn): create a new endpoint of `/api/revisions/list`
              let apiPage = await this.$axios.$get(`/api/revisions/list?${urlParams.toString()}`);
              let _timestamps = apiPage.map(item => item.timestamp);
              this.maxTimestamp = Math.max(this.maxTimestamp,..._timestamps);
              this.minTimestamp = Math.min(this.minTimestamp,..._timestamps);
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
            this.nextWikiRevIds = this._sortWikiRevIds(this.nextWikiRevIds);
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
