<template>
    <div class="wrapper">
        <div class="type looks-good btn btn-outline-success">
            <i class="fas fa-thumbs-up"></i>
        </div>
        <div class="type not-sure btn btn-outline-secondary">
            <i class="fas fa-question"></i>
        </div>
        <div class="type should-revert btn btn-outline-danger">
            <i class="fas fa-thumbs-down"></i>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'nuxt-property-decorator'

    @Component({
      components: {
      }
    })
    export default class PureJudgementPanel2 extends Vue { 
        @Prop({ type: Object, required: true}) judgementCounts:Object = {};
    }
</script>

<style lang="scss" scoped>
    .wrapper {
        display: flex;
        gap: 12px;
        flex: 1rem;
    }
    .type {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display:inline-grid;
        justify-content:center;
        align-items:center;
    }
</style>