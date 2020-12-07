<template>
  <section>
    <div id="interactions">
      <template v-if="!loadingInteractions">
        <span>{{ $t('Label-HumanEditors') }}: </span>
        <template v-if="interactionPropsList">
          <span
            v-for="judgement in ['NotSure', 'LooksGood', 'ShouldRevert']"
            :key="judgement"
            class="mr-2"
          >
            <template v-if="interactionPropsList.filter(i=>i.judgement == judgement).length > 0">
              <span>{{ judgement }}</span>
              <span
                v-for="interactionProps in interactionPropsList.filter(i=>i.judgement == judgement)"
                :key="interactionProps.toString()"
              >
                <img
                  v-if="interactionProps.wikiUserName"
                  class="avatar-judgement"
                  :src="`https://avatars.dicebear.com/api/initials/${interactionProps.wikiUserName}.svg`"
                  :alt="`User:${interactionProps.wikiUserName}`"
                >
                <img
                  v-else-if="interactionProps.userGaId"
                  class="avatar-judgement"
                  :src="`https://avatars.dicebear.com/api/identicon/${interactionProps.userGaId}.svg`"
                  :alt="`User:${interactionProps.userGaId}`"
                >
              </span>
            </template>
          </span>
        </template>
        <template v-else>
          {{ $t('Label-None') }}
        </template>
      </template>

      <template v-else>
        <div class="spinner-border" role="status">
          <span class="sr-only">{{ $t('Label-Loading') }}...</span>
        </div>
      </template>
    </div>
    <div>
      <span>{{ $t('Label-ArtificialIntelligence') }}: </span>
      <template v-if="!loadingScores">
        <template v-if="scores">
          <span
            v-for="score in scores"
            :key="score"
            v-b-tooltip.hover
            :title="`${percent(score.score)}`"
            class="badge mr-1"
            :class="{
              'badge-danger': score.isBad,
              'badge-success': !score.isBad }"
          >
            {{ badgeText(score.type) }}
          </span>
        </template>
        <template v-else>
          None
        </template>
      </template>
      <template v-else>
        <div class="spinner-border" role="status">
          <span class="sr-only">{{ $t('Label-Loading') }}...</span>
        </div>
      </template>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { InteractionProps } from '~/shared/models/interaction-item.model';
import { Score, ScoreType } from '~/shared/interfaces';
import { percent } from '~/shared/utility-shared';

@Component
export default class JudgementPanel extends Vue {
  @Prop({ type: String, required: true }) readonly wikiRevId!: string;
  interactionPropsList: InteractionProps[] = [];
  scores: Score[] = [];
  loadingInteractions: boolean = false;
  loadingScores: boolean = false;

  percent = percent;

  badgeText(type:ScoreType) {
    return {
      ores_damaging: 'ORES Damaging',
      ores_badfaith: 'ORES Badfaith',
      stiki: 'Stiki',
      huggle: 'Huggle',
      wikitrust: 'WikiTrust',
    }[type];
  }

  async getInteractionPropsList(wikiRevId:string) {
    this.loadingInteractions = true;
    const result = await this.$axios.$get(`/api/interaction/beta/${wikiRevId}`);
    this.loadingInteractions = false;
    return result;
  }

  async getScores(wikiRevId:string) {
    this.loadingScores = true;
    const result = await this.$axios.$get(`/api/score/${wikiRevId}`);
    this.loadingScores = false;
    return result;
  }

  public async refresh() {
    this.getScores(this.wikiRevId).then((items) => { // we don't use await here, because we want to fetch everything nonblocking
      this.scores = items;
    });

    this.getInteractionPropsList(this.wikiRevId).then((items) => { // we don't use await here, because we want to fetch everything nonblocking
      this.interactionPropsList = items;
    });
  }

  async mounted() {
    await this.refresh();
  }
}
</script>

<style>
  .avatar-judgement {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

</style>
