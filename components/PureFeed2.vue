<template>
    <div>
      <div class="card-md shadow-md wrapper">
        <pure-revision-panel 
          class="item"
          :infoLoaded="infoLoaded"
          :diffLoaded="diffLoaded"
          :item="item" />
        <pure-action-panel2
          class="item"
          v-if="infoLoaded && diffLoaded"
          :selected="judgement"
          :pending="judgementPending"
          />
      </div>
    </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'nuxt-property-decorator'
  import { RevisionPanelItem } from '~/shared/interfaces';
  import PureRevisionPanel from '~/components/PureRevisionPanel.vue';
  import PureActionPanel2 from '~/components/PureActionPanel2.vue';

  @Component({
    components: {
      PureActionPanel2,
      PureRevisionPanel
    }
  })
  export default class PureFeed2 extends Vue { 
    @Prop({ type: Boolean}) readonly infoLoaded: boolean;
    @Prop({ type: Boolean}) readonly diffLoaded: boolean;
    @Prop({ type: Object }) readonly item: RevisionPanelItem;

    @Prop({ type: String, required: false}) readonly judgement?: string;
    @Prop({ type: Boolean, required: false}) readonly judgementPending?: boolean;
  }
</script>

<style lang="scss" scoped>
@import 'bootstrap/scss/_functions.scss';
@import 'bootstrap/scss/_variables.scss';
@import 'bootstrap/scss/_mixins.scss';

.wrapper {
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @include media-breakpoint-up(lg) {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  @include media-breakpoint-up(md) {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

}

.item {
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
}

</style>