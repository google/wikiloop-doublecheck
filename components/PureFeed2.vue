<template>
    <div>
      <div class="card-md shadow
        container-md-fluid container-lg 
        wrapper">
        <pure-revision-panel 
          class="item"
          :infoLoaded="infoLoaded"
          :diffLoaded="diffLoaded"
          :item="item" />
        <pure-action-panel2
          class="item"
          v-if="infoLoaded && diffLoaded"/>
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
  }
</script>

<style lang="scss" scoped>

.wrapper {
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.item {
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
}

</style>