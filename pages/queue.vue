
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

    export default {
        components: {
            NewRevisionCard
        },
        data() {
            return {
                title: 'WikiLoop Battlefield',
                currentWikiRevId: null,
                subscribeWiki: 'enwiki',
                nextWikiRevIds: [],

                /**
                 * A stack of wikiRevIds
                 */
                prevWikiRevIds: [], // for previous
                // TODO add beingTimestamp and endTimestamp to keep track of the time window we are at.
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
                if (this.nextWikiRevIds.length == 0) await this.loadMoreIntoSortedQueue();
                if (this.currentWikiRevId) this.prevWikiRevIds.push(this.currentWikiRevId); // push into
                this.currentWikiRevId = this.nextWikiRevIds.pop();
            },
            loadMoreIntoSortedQueue: async function() {
                let apiPage = await this.$axios.$get(`/api/latestRevs?wiki=${this.subscribeWiki}`);
                let wikiRevIds = apiPage.map(item => item.wikiRevId);
                this.nextWikiRevIds = this.nextWikiRevIds.concat(wikiRevIds);
            }
        },
        async mounted() {
            await this.loadMoreIntoSortedQueue();
            this.showNext();
        }
    }
</script>

<style>

</style>
