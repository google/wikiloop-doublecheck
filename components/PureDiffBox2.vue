<template>
  <div class="diff-box">
    <template v-if="loaded">
      <template v-if="diffSafeHtml">
        <div class="diff-box__header">
          <!-- <h5>{{ $t('Label-OriginalWikitext') }}</h5>
          <h5>{{ $t('Label-ChangedWikitext') }}</h5> -->
        </div>
        <table class="diff-box__table">
          <tbody v-html="diffSafeHtml" />
        </table>
      </template>
      <template v-else>
        <div class="diff-box__nodiff">
          <!-- TODO change to includ i18n, add styling. -->
          <i class="fas fa-check-circle mr-1" />There is no diff.
        </div>
      </template>
    </template>
    <template v-else>
      <loading-indicator />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

@Component({
  components: {
    LoadingIndicator,
  },
})
export default class PureDiffBox2 extends Vue {
  @Prop({ type: String }) readonly diffSafeHtml: string;
  @Prop({ type: Boolean }) readonly loaded: boolean;
}
</script>
<style lang="scss" scoped>
.diff-box {
  min-height: 10rem;
  min-width: 20rem;
  display:flex;
  align-items: center;
  justify-content: center;

  &__nodiff {
    animation: fadeIn .5s 3s;
    font-size: 2rem;
    color: var(--secondary);
    i {
      color: var(--success);

    }
  }

}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

</style>
