
<template>
    <section>
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
                currentWikiRevId: null
            }
        },
        methods: {
            showNext: async function() {
                await sleep(300);
                await this.$store.dispatch(`revisions/loadMoreWikiRevs`);
                this.currentWikiRevId = this.$store.state.revisions.getNext;
                console.log(`XXX this.$store.state.revisions.getNext`, this.$store.state.revisions.getNext);
            }
        },
        async mounted() {
            this.showNext();
        }
    }
</script>

<style>

</style>
