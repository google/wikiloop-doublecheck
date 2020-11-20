<template>
  <div class="diff-card d-flex flex-column">
    <div class="d-flex justify-content-between">
      <h5>{{ $t('Label-OriginalWikitext') }}</h5>
      <h5>{{ $t('Label-ChangedWikitext') }}</h5>
    </div>
    <table class="diff-content">
      <thead class="diff-header">
        <tr>
          <th colspan="2">
          </th>
          <th colspan="2">
          </th>
        </tr>
      </thead>
      <tbody v-html="diffSafeHtml"></tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue} from 'nuxt-property-decorator'
@Component
export default class PureDiffBox extends Vue {
  @Prop({ type: String, required: true }) readonly diffSafeHtml!: string;
}

</script>
<style lang="scss" scoped>
@import 'bootstrap/scss/_functions.scss';
@import 'bootstrap/scss/_variables.scss';
@import 'bootstrap/scss/_mixins.scss';
.diff-header {
  position: sticky;
  top: 0;
  background: #ffffff;
}

.diff-card a.new {
  color: #ba0000;
}

.diff-card a.exists {
  color: #0645ad;
}

.diff-card {
  font-size: 0.75rem;
  overflow-x: hidden;
  flex: 1 1 200px;

    @include media-breakpoint-down(lg) {
      font-size: 0.6rem;
    }
    @include media-breakpoint-down(md) {
      font-size: 0.5rem;
    }
    /* If the screen size is 600px wide or less, set the font-size of <div> to 30px */
    @include media-breakpoint-down(sm) {
      font-size: 0.4rem;
    }
  }
</style>
