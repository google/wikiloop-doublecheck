<template>
  <div class="judgpan--wrapper">
    <div
      v-for="judgeType in ['LooksGood', 'NotSure', 'ShouldRevert'].filter( j => filterUsers(j).length)"
      :key="judgeType"
      class="judgpan--item"
    >
      <template v-if="filterUsers(judgeType).length > 0">
        <div class="judgpan--type">
          <div class="looks-good btn" :class="{[getBtnClass(judgeType)]: true}">
            <i class="fas" :class="{[getIcon(judgeType)]: true}" />
          </div>
        </div>
        <div class="judgpan--users">
          <div
            v-for="item in filterUsers(judgeType)"
            :key="item.wikiUserName || item.userGaId"
            class="judgpan--user-outer"
          >
            <pure-user-avatar2
              class="judgpan--user"
              :user-name="item.wikiUserName"
              :user-ga-id="item.userGaId"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import PureUserAvatar2 from '@/components/PureUserAvatar2.vue';
import { InteractionProps } from '~/shared/models/interaction-item.model';

    @Component({
      components: {
        PureUserAvatar2,
      },
    })
export default class PureJudgementPanel2 extends Vue {
        @Prop({ type: Array, required: true }) interactions:InteractionProps[];

        public filterUsers(judgeType) {
          return this.interactions?.filter((i) => i.judgement === judgeType) || [];
        }

        public getIcon(judgeType) {
          return {
            LooksGood: 'fa-thumbs-up',
            NotSure: 'fa-question',
            ShouldRevert: 'fa-thumbs-down',
          }[judgeType];
        }

        public getBtnClass(judgeType) {
          return {
            LooksGood: 'btn-outline-success',
            NotSure: 'btn-outline-secondary',
            ShouldRevert: 'btn-outline-danger',
          }[judgeType];
        }
}
</script>

<style lang="scss" scoped>
    .judgpan--wrapper {
        display: flex;
        gap: 12px;
        flex: 1rem;
    }
    .judgpan--item {
        display: flex;
        align-items: center;

    }

    .judgpan--type {
        & > div {
            display:grid;
            justify-content:center;
            align-items:center;
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            border: 0.2rem solid;
        }
        &::after {
            content: "";
            display: inline-block;
            height: 100%;
            width: 100%;
            border-radius: 50%;
            position: absolute;
            background-color: white;
            top: 0;
            left: 0;
            transform: scaleX(1.1) scaleY(1.1);
            z-index: -1;
            transition: all .4s;
        }
        width: 3rem;
        height: 3rem;
        left:0;
        top:0;
        border-radius: 50%;
        display:inline-grid;
        justify-content:center;
        align-items:center;
        z-index:1;
        position:relative;
    }

    .judgpan--users {
        display: flex;
        flex-direction: row-reverse;
    }

    .judgpan--user-outer {
        width: 2.5rem;
        height: 2.5rem;
        margin-left: -0.4rem;
        position:relative;
        & > div {
            height: 100%;
            width: 100%;
            border-radius: 50%;
            border: 0.2rem solid white;
        }
    }
</style>
