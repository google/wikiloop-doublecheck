<template>
  <div class="actpan">
    <div class="actpan--more">
      <button
        v-if="eligibleForRevert"
        class="actpan--more-btn btn btn-outline-primary"
        @click="$emit('revert')"
      >
        <div v-if="followUpStatus" class="actpan--more-btn__status">
          <i v-if="followUpStatus ==='PENDING'" class="fas fa-spinner text-primary" />
          <i v-else-if="followUpStatus === 'DONE'" class="fas fa-check text-success" />
          <i v-else-if="followUpStatus === 'ERROR'" class="fas fa-times text-danger" />
        </div>
        <div 
          class="actpan--more-btn__label"
        >
          <template v-if="followUpStatus === 'DONE'">
            {{ $t('Label-DirectReverted') }}
          </template>
          <template v-else>
            {{ $t('Button-RevertNow') }}
            <template v-if="!gCanDirectEdit">
              <i class="fas fa-link" />
            </template>
          </template>
        </div>
      </button>
    </div>
    <div class="actpan--main">
      <button
        class="looks-good btn"
        :class="{
          selected: isSelected('LooksGood'),
          pending: pending,
          'btn-success': isSelected('LooksGood'),
          'btn-outline-success': !isSelected('LooksGood'),
        }"
        @click="$emit('judgement', 'LooksGood')"
      >
        <i v-if="isSelected('LooksGood') && pending" class="fas fa-spinner" />
        <i v-else class="fas fa-thumbs-up" />
      </button>
      <button
        class="not-sure btn"
        :class="{
          selected: isSelected('NotSure'),
          pending: pending,
          'btn-secondary': isSelected('NotSure'),
          'btn-outline-secondary': !isSelected('NotSure'),
        }"
        @click="$emit('judgement', 'NotSure')"
      >
        <i v-if="isSelected('NotSure') && pending" class="fas fa-spinner" />
        <i v-else class="fas fa-question" />
      </button>
      <button
        class="should-revert btn"
        :class="{
          selected: isSelected('ShouldRevert'),
          pending: pending,
          'btn-danger': isSelected('ShouldRevert'),
          'btn-outline-danger': !isSelected('ShouldRevert'),
        }"
        @click="$emit('judgement', 'ShouldRevert')"
      >
        <i v-if="isSelected('ShouldRevert') && pending" class="fas fa-spinner" />
        <i v-else class="fas fa-thumbs-down" />
      </button>
      <button
        v-if="selected && !pending"
        class="next btn btn-outline-secondary"
        @click="$emit('next')"
      >
        <i class="fas fa-arrow-right" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import { BasicJudgement, ApiStatus } from '~/shared/interfaces';

@Component({
  components: {},
})
export default class PureActionPanel2 extends Vue {
  @Prop({ type: String, required: false }) readonly selected?: string;
  @Prop({ type: Boolean, required: false }) readonly pending?: boolean;

  /**
   * A boolean to determine whether the revision is eligible.
   */
  @Prop({ type: Boolean, required: false })
  readonly eligibleForRevert?: boolean;

  /**
   * A status (usually globally avaialbe) for whether we are allowed to perform an edit directly by requesting MediaWiki API
   */
  @Prop({ type: Boolean, required: false }) 
  readonly gCanDirectEdit?: boolean;

  /**
   * A boolean to determine whether the revision is eligible.
   */
  @Prop({ type: String, required: false })
  readonly followUpStatus?: ApiStatus;
  
  isSelected(judgement: string): boolean {
    return this.selected === judgement;
  }
}
</script>

<style lang="scss" scoped>
@import 'custom.scss';

.actpan {
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction: column;
  
  $levels: primary, secondary, success, info, danger;

  @each $level in $levels {
    .btn-outline-#{$level} {
      background-color: white;
      &:hover {
        background: var(--#{$level});
      }
    }
  }

  &>*:not(:last-child) {
    margin-bottom: 1rem;
  }

  .btn {
    transition: 0.1s;
    box-shadow: 0 0 0.25rem 0.25rem #cccc;
    &:hover {
      box-shadow: 0 0 0.4rem 0.4rem #7777;
    }
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

  &--more {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;

    &-btn {
      border-radius: 3rem;
      height: 3rem;
      padding: 1rem;
      display:flex;
      justify-content: center;
      align-items: center;

      &__status {
        margin-right: 0.5rem;
        width: 1rem;
        height: 1.5rem;
      }
    }
  }

  &--main {
    .btn {
      border-radius: 50%;
      width: 3rem;
      height: 3rem;
      margin: 1rem;
      line-height: 1;
      display: inline-grid;
      justify-content: center;
      align-items: center;

      @include media-breakpoint-up(md) {
        width: 3.5rem;
        height: 3.5rem;
        margin: 1.2rem;
      }
      
      @include media-breakpoint-up(xl) {
        width: 4rem;
        height: 4rem;
        margin: 1.5rem;
      }

      & > i {
        transition: 0.1s;
        font-size: 1rem;
      }

      &:hover > i {
        font-size: 1.2rem;
      }
    }

    .btn.selected:not(.pending) {
      transform: scale(1.2);
    }
  }
}
</style>
