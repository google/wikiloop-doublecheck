
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
                v-on:next-card="showNext()"
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
                this.currentWikiRevId = this.$store.state.revisions.nextWikiRevIdsHeap.peek();
                this.$store.commit(`revisions/pop`);
                await this.$store.dispatch(`revisions/loadMoreWikiRevs`);
                /*unawait*/ this.$store.dispatch(`revisions/preloadAsyncMeta`).then();
            }
        },
        async mounted() {
            await this.$store.dispatch(`revisions/loadMoreWikiRevs`);
            // when wiki changes, go to the next diff instead of
            // keeping the existing diff in the previously selected wiki
            document.addEventListener(`wiki-change-completed`, async () => {
              await this.showNext();
            });
            this.showNext();
        }
    }
</script>

<style>

</style>
