<template>
  <section>
    <template v-if="infoLoaded">
      <h2 class="rev-title"><a :href="wikiPageLink(item.wiki, item.title)">{{item.title}}</a></h2>
      <div class="rev-info">
        <div class="rev-info__item"><i class="fas fa-faucet fa-fw"></i>{{item.feed || 'default'}}</div>
        <div class="rev-info__item"><i class="fas fa-info-circle fa-fw"></i>{{item.wiki}}:{{item.revId}}</div>
        <div class="rev-info__item"><i class="fas fa-clock fa-fw"></i>{{item.timestamp}}</div>
        <div class="rev-info__item rev-info__item-author">
          <i class="fas fa-user fa-fw"></i>{{item.author}}
        </div>
      </div>
      <pure-diff-box2
        :loaded="diffLoaded"
        :diff-safe-html="item.diffHtml">
      </pure-diff-box2>
      <div class="rev-summary">
        <div class="rev-summary__label">{{$t("Label-EditSummary")}}</div>
        <div class="rev-summary__content" :class="{
          'rev-summary__content--empty': !item.summary }
        ">
          {{item.summary || $t('Message-ThereIsNoEditSummary')}}
        </div>
      </div>
    </template>
    <template v-else>
      <loading-indicator/>
    </template>
  </section>
</template>

<script lang="ts">
import PureDiffBox2 from '@/components/PureDiffBox2.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import { mapState } from 'vuex';

import { Component, Prop, Vue} from 'nuxt-property-decorator';
import { RevisionPanelItem } from '~/shared/interfaces';
import { wikiPageLink } from '~/shared/mwapi2';

@Component({
  components: {
    PureDiffBox2,
    LoadingIndicator
  }
})
export default class PureRevisionPanel extends Vue {
  @Prop({ type: Boolean}) readonly infoLoaded: boolean;
  @Prop({ type: Boolean}) readonly diffLoaded: boolean;
  @Prop({ type: Object }) readonly item: RevisionPanelItem;

  public wikiPageLink = wikiPageLink;
}
</script>
<style lang="scss" scoped>
  @import 'bootstrap/scss/_functions.scss';
  @import 'bootstrap/scss/_variables.scss';
  @import 'bootstrap/scss/_mixins.scss';

  .rev-title {
    font-size: 1.4rem;
  }

  .rev-info {
    display: grid;
    grid-template-columns: repeat(4, 25%);
    @include media-breakpoint-down(md) {
      grid-template-columns: repeat(2, 50%);
    }

    @include media-breakpoint-down(xs) {
      grid-template-columns: repeat(1, 100%);
    }

    &__item {
      i {
        color: var(--secondary);
        padding-right: .5rem;
      }
      &-author {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .rev-summary {
    &__label {
    }

    &__content {
      &--empty {
        color: var(--danger);
      }
    }
  }
</style>
