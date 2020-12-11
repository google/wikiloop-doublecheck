<template>
  <div class="pure-feed2-main">
    <div class="card shadow container-md mt-md-3 py-md-3">
      <div class="card-body pure-feed2--wrapper">
        <pure-revision-panel
          class="pure-feed2--item"
          :info-loaded="infoLoaded"
          :diff-loaded="diffLoaded"
          :item="item"
        />
        <div v-if="showJudgementPanel" class="pure-feed2--item">
          <div class="pure-feed2--judgpan__label">
            {{ $t('Label-Judgement') }}
          </div>
          <pure-judgement-panel2
            class="pure-feed2--item pure-feed2--judgpan"
            :interactions="interactions"
          />
        </div>
      </div>
    </div>
    <div class="pure-feed2--bottom">
      <pure-action-panel2
        v-if="infoLoaded && diffLoaded"
        class="pure-feed2--actpan"
        :selected="judgement"
        :pending="judgementPending"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import { RevisionPanelItem } from '~/shared/interfaces';
import { InteractionProps } from '~/shared/models/interaction-item.model';
import PureRevisionPanel from '~/components/PureRevisionPanel.vue';
import PureActionPanel2 from '~/components/PureActionPanel2.vue';
import PureJudgementPanel2 from '~/components/PureJudgementPanel2.vue';

  @Component({
    components: {
      PureRevisionPanel,
      PureActionPanel2,
      PureJudgementPanel2,
    },
  })
export default class PureFeed2 extends Vue {
    @Prop({ type: Boolean }) readonly infoLoaded: boolean;
    @Prop({ type: Boolean }) readonly diffLoaded: boolean;
    @Prop({ type: Object }) readonly item: RevisionPanelItem;
    @Prop({ type: String, required: false }) readonly judgement?: string;
    @Prop({ type: Boolean, required: false }) readonly judgementPending?: boolean;
    @Prop({ type: Array, required: false }) readonly interactions:InteractionProps[];
    @Prop({ type: Boolean, required: false }) readonly showJudgementPanel:boolean;
}
</script>

<style lang="scss" scoped>
@import 'bootstrap/scss/_functions.scss';
@import 'bootstrap/scss/_variables.scss';
@import 'bootstrap/scss/_mixins.scss';

.pure-feed2--wrapper {
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

.pure-feed2--item {
  width:100%;
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
}

.pure-feed2--actpan {
  display:flex;
  justify-content:center;
  align-items:center;
}

.pure-feed2--judgpan__label {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.pure-feed2-main {
  margin-bottom: 6.15rem;
}

.pure-feed2--bottom {
  position: fixed;
  width: 100%;
  bottom: 0;
  display:flex;
  justify-content: center;
  z-index:100;
}

</style>
