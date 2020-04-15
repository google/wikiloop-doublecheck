import {BasicJudgement} from "~/shared/interfaces";
<template>
  <section>
    <div class="card-body">
    <div class="d-flex justify-content-center">
      <template v-if="!myJudgement">
        <div class="btn-group mx-1">
        <button
          v-on:click="interactionBtn(`LooksGood`)" class="btn btn-sm btn-outline-success"
        >{{$t(`LooksGoodBtnLabel`)}} (g)
        </button>
        <button
          v-on:click="interactionBtn(`NotSure`)"
          class="btn btn-sm btn-outline-secondary">{{$t(`NotSureBtnLabel`)}} (p)
        </button>
        <button
          v-on:click="interactionBtn(`ShouldRevert`)"
          class="btn btn-sm btn-outline-danger" target="_blank"
        >{{$t(`ShouldRevertBtnLabel`)}} (v)
        </button>
      </div>
      </template>
      <template v-else>
        <div class="btn-group mx-1">
          <button
            @click="undo()"
            class="btn btn-outline-secondary"
          >{{$t(`UndoBtnLabel`)}}(←)
          </button>
          <button v-if="enableRevert"
            @click="performRevert()"
            class="btn btn-outline-primary">
            {{$t(`RevertNowBtnLabel`)}} (r)
          </button>
          <button
            @click="$emit(`next-card`)"
            class="btn btn-outline-success"
          >{{$t(`NextBtnLabel`)}}(→)
          </button>
        </div>
      </template>
    </div>
    </div>
  </section>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {BasicJudgement} from "~/shared/interfaces";
    import {NuxtCookies} from "~/node_modules/cookie-universal-nuxt";
    import {NuxtAxiosInstance} from "~/node_modules/@nuxtjs/axios";
    import {InteractionItem} from "~/shared/schema";

    @Component
  export default class ActionPanel extends Vue {
    @Prop({type: String, required: true}) readonly wikiRevId!: string;
    @Prop({type: String, required: true}) readonly title!: string;
    myJudgement:BasicJudgement = null;
    feed:string;
    action:string = null;
    $cookiez: NuxtCookies; // TODO remove after dep resolved https://github.com/microcipcip/cookie-universal/issues/63
    $axios: NuxtAxiosInstance;

    async interactionBtn (judgement:BasicJudgement) {
      this.myJudgement = judgement;
      let gaId = this.$cookiez.get("_ga");
      let postBody:InteractionItem = {
        userGaId: gaId,
        judgement: judgement,
        timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
        wikiRevId: this.wikiRevId,
        feed: this.feed,
        title: this.title
      };

      if (this.$store.state.user && this.$store.state.user.profile) {
          let wikiUserName = this.$store.state.user.profile.displayName;
          postBody.wikiUserName = wikiUserName;
      }
      await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
      document.dispatchEvent(new Event("stats-update"));
      document.dispatchEvent(new Event("judgement-event"));
      this.$emit('judgement-event', postBody);
    }

    async performRevert () {
      // TODO do nothing
    }

    get enableRevert():boolean {
      return this.myJudgement === BasicJudgement.SHOULD_REVERT;
    }
  }
</script>
