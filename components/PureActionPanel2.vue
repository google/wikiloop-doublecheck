<template>
  <div>
    <div
      class="looks-good btn"
      :class="{
        selected: isSelected('LooksGood'),
        pending: pending,
        'btn-success': isSelected('LooksGood'),
        'btn-outline-success': !isSelected('LooksGood')
      }"
    >
      <i v-if="isSelected('LooksGood') && pending" class="fas fa-spinner" />
      <i v-else class="fas fa-thumbs-up" />
    </div>
    <div
      class="not-sure btn"
      :class="{
        selected: isSelected('NotSure'),
        pending: pending,
        'btn-secondary': isSelected('NotSure'),
        'btn-outline-secondary': !isSelected('NotSure')
      }"
    >
      <i v-if="isSelected('NotSure') && pending" class="fas fa-spinner" />
      <i v-else class="fas fa-question" />
    </div>
    <div
      class="should-revert btn"
      :class="{
        selected: isSelected('ShouldRevert'),
        pending: pending,
        'btn-danger': isSelected('ShouldRevert'),
        'btn-outline-danger': !isSelected('ShouldRevert')
      }"
    >
      <i v-if="isSelected('ShouldRevert') && pending" class="fas fa-spinner" />
      <i v-else class="fas fa-thumbs-down" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import { BasicJudgement } from '~/shared/interfaces';

    @Component({
      components: {
      },
    })
export default class PureActionPanel2 extends Vue {
        @Prop({ type: String, required: false }) readonly selected?: string;
        @Prop({ type: Boolean, required: false }) readonly pending?: boolean;
        isSelected(judgement:string):boolean {return this.selected === judgement;}
}
</script>

<style lang="scss" scoped>
    .btn {
        border-radius: 50%;
        width: 4rem;
        height: 4rem;
        margin: 1.5rem;
        line-height: 1;
        display: inline-grid;
        justify-content: center;
        align-items:center;

        & > i {
            transition: .1s;
            font-size: 1rem;
        }

        &:hover > i {
            font-size: 1.2rem;
        }
    }

    .btn {
        transition: .1s;
    }

    .btn.selected:not(.pending) {
        transform: scale(1.2);
    }

    .fa-spinner {
        animation: rotation 2s infinite linear;
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(359deg);
        }
    }
</style>
