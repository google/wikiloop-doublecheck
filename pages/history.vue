<template>
  <section>
    <div v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">{{$t('Label-Loading')}}...</span>
      </div>
    </div>
    <template v-else>
      <div class="card my-1" v-for="(item) in interactions" :key="item.wikiRevId">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="d-flex justify-content--start">
            <user-avatar-with-name :wikiUserName="item.wikiUserName" :userGaId="item.userGaId"></user-avatar-with-name>
            <div style="line-height: 32px">
              <span v-html="$t('Label-ReviewedAndSays', {
                wikiRevId: item.wikiRevId,
                href: `/revision/${item.wikiRevId.split(':')[0]}/${item.wikiRevId.split(':')[1]}`
                })"></span>
              <span :class="['badge', {
                'badge-success': item.judgement === 'LooksGood',
                'badge-secondary': item.judgement === 'NotSure',
                'badge-danger': item.judgement === 'ShouldRevert'
              }]">{{$t(`Label-${item.judgement}`)}}</span>
              <timeago :datetime="item.timestamp * 1000" :locale="$i18n.locale"></timeago>.
            </div>
          </div>
        </div>
      </div>
      </div>
    </template>
    <button class="btn btn-block btn-outline-primary my-3" @click="loadMore()">Load more</button>
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
    async asyncData ({$axios, query}) {
      let filter:any = query;
      return {
        filter: query,
        interactions: await $axios.$get(`/api/label?limit=10&${new URLSearchParams(filter).toString()}`)
      };
    },

  })
  export default class HistoryPage extends Vue {
    loading:boolean = false;
    interactions: InteractionProps[];
    offset:number = 0;
    public parseWikiRevId = parseWikiRevId;
    filter:any = {};
    mounted() {
      socket.on('interaction-props', async (interaction: InteractionProps) => {
        this.loading = true;
        this.interactions = [interaction].concat(this.interactions); // push at the head.
        this.loading = false;
      });
    }
    async loadMore() {
      this.interactions.push(...(await this.$axios.$get(`/api/label?limit=10&offset=${this.interactions.length}&${new URLSearchParams(this.filter).toString()}`)));
    }
  }
</script>

<style scoped>

</style>
