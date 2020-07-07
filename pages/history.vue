<template>
  <section>
    <div v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">{{$t('Label-Loading')}}...</span>
      </div>
    </div>
    <template v-else>
      <div class="card my-1" v-for="(item, i) in interactions">
      <div class="card-body">
        <div class="d-flex">
        <user-avatar-with-name :wikiUserName="item.wikiUserName" :userGaId="item.userGaId"></user-avatar-with-name>
        <div style="line-height: 32px">{{$t('Label-ReviewedAndSays', item.wikiRevId)}}
        <span :class="['badge', {
          'badge-success': item.judgement === 'LooksGood',
          'badge-secondary': item.judgement === 'NotSure',
          'badge-danger': item.judgement === 'ShouldRevert'
        }]">{{item.judgement}}</span>.</div>
        </div>
      </div>
      </div>
    </template>

  </section>
</template>
<script lang="ts">
  import {Component, Vue} from "nuxt-property-decorator";
  import {InteractionProps} from "~/shared/models/interaction-item.model";
  import socket from "~/plugins/socket.io";
  import {parseWikiRevId} from "~/shared/utility-shared";
  import UserAvatarWithName from "~/components/UserAvatarWithName.vue";

  @Component({
    components: {
      UserAvatarWithName
    },
    async asyncData ({$axios}) {
      return {
        interactions: await $axios.$get(`/api/label?limit=10`)
      };
    },

  })
  export default class HistoryPage extends Vue {
    interactions: InteractionProps[];
    public parseWikiRevId = parseWikiRevId;
    mounted() {
      socket.on('interaction-props', async (interaction: InteractionProps) => {
        this.interactions = [interaction].concat(this.interactions); // push at the head.
      });
    }
  }
</script>

<style scoped>

</style>
