
<template>
    <section>
        <template v-if="currentWikiRevId">
            <RevisionCard
                :wikiRevId="currentWikiRevId"
                :key="currentWikiRevId"
                :diffProp="currentDiff"
                :oresProp="currentOres"
                :interactionProp="currentInteraction"
                :revisionProp="currentRevision"
                v-on:judgement-event="showNext()"
                ></RevisionCard>
        </template>
    </section>
</template>

<script>
    import RevisionCard from '~/components/RevisionCard.vue';
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    export default {
        components: {
          RevisionCard
        },
        data() {
            return {
                title: 'WikiLoop Battlefield',
                currentWikiRevId: null
            }
        },
        computed: {
          currentDiff: {
            get () {
              return this.$store.state.revisions.wikiRevIdToMeta[this.currentWikiRevId].diff;
            }
          },
          currentRevision: {
            get () {
              return this.$store.state.revisions.wikiRevIdToMeta[this.currentWikiRevId];
            }
          },
          currentInteraction: {
            get () {

              return this.$store.state.revisions.wikiRevIdToMeta[this.currentWikiRevId].interaction;
            }
          },
          currentOres: {
            get () {
              let ores = this.$store.state.revisions.wikiRevIdToMeta[this.currentWikiRevId].ores;
              return ores;
            }
          },
        },
        methods: {
            showNext: async function() {
                await this.$store.dispatch(`revisions/loadMoreWikiRevs`);
                this.currentWikiRevId = this.$store.state.revisions.nextWikiRevIdsHeap.peek();
                this.$store.commit(`revisions/pop`);
                /*unawait*/ this.$store.dispatch(`revisions/preloadAsyncMeta`).then();
            }
        },
        async mounted() {
            this.showNext();
        }
    }
</script>

<style>

</style>
