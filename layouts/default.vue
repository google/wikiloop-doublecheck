<!--
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow border-1">
      <div class="container-xl">
        <a class="navbar-brand" href="/">WikiLoop Battlefield</a>
        <b-navbar-toggle  target="nav-collapse">
        </b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item href="/marked" v-b-tooltip.hover title="History">
              <i class="fas fa-history"></i>
              <span class="pl-0 ml-0" v-if="$store.state.metrics">({{$store.state.metrics.totalJudgement}})</span>
            </b-nav-item>
            <b-nav-item href="/leaderboard" v-b-tooltip.hover title="Leaderboard">
              <i class="fas fa-trophy"></i>
            </b-nav-item>
            <b-nav-item-dropdown right v-b-tooltip.hover title="Featured feeds">
              <template v-slot:button-content>
                <i class="fas fa-faucet pr-0"></i>
              </template>
              <b-dropdown-item href="/feed/mix">Mix Feeds<sup class="text-warning">β</sup></b-dropdown-item>
              <b-dropdown-item href="/feed/lastbad">Last Bad Feed<sup class="text-warning">β</sup></b-dropdown-item>
              <b-dropdown-item href="/feed/recent">Recent Feed<sup class="text-warning">β</sup></b-dropdown-item>
              <b-dropdown-item href="/feed/ores">ORES detected Feed<sup class="text-warning">β</sup></b-dropdown-item>
              <b-dropdown-item href="/feed/wikitrust">WikiTrust detected Feed<sup class="text-warning">β</sup></b-dropdown-item>
              <b-dropdown-item href="/feed/us2020">US 2020 Election Topic Feed<sup class="text-warning">β</sup></b-dropdown-item>
              <b-dropdown-item href="/feed/covid19">COVID-19 Topic Feed<sup class="text-warning">β</sup></b-dropdown-item>

            </b-nav-item-dropdown>

            <b-nav-item href="/active" v-b-tooltip.hover title="Active Users">
              <i class="fas fa-users"></i>
              <span class="pl-0 ml-0" v-if="$store.state.metrics">({{ $store.state.metrics.activeLoggedInUser.length + $store.state.metrics.activeAnonymousUser.length }})</span>
            </b-nav-item>
            <b-nav-item href="/api/markedRevs.csv" v-b-tooltip.hover title="Download">
              <i class="fas fa-cloud-download-alt"></i>
            </b-nav-item>
            <b-nav-item-dropdown right>
              <template v-slot:button-content>
                <i class="fas fa-info"></i>
              </template>
              <b-dropdown-item href="https://github.com/google/wikiloop-battlefield/issues">Issues</b-dropdown-item>
              <b-dropdown-item href="https://github.com/google/wikiloop-battlefield">Code </b-dropdown-item>
              <b-dropdown-item href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop">WikiProject</b-dropdown-item>
              <b-dropdown-item href="/api/stats">Stats</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item>
              <b-form-select @click.native.stop='' class="small" v-model="wiki">
                <option v-for="language in languages" :key="language.value" :value="language.value">{{ language.value }}</option>
              </b-form-select>
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown  right>
              <template v-slot:button-content>
                <object type="image/svg+xml" class="avatar-navbar" v-bind:data="`/api/avatar/${userId}`" ></object><span v-if="">{{$store.state.user.profile ? `${$store.state.user.profile.displayName}`:`${$t(`Anonymous`)}`}}</span>
              </template>
              <b-dropdown-item v-if="$store.state.user.profile && $store.state.user.profile.displayName" :href="`/marked/?wikiUserName=${$store.state.user.profile.displayName}`"><i class="fas fa-list"></i>{{$t(`ContributionsMenuItem`)}}</b-dropdown-item>
              <b-dropdown-item :href="`/marked/?userGaId=${$cookiez.get('_ga')}`"><i class="fas fa-list"></i>{{$t(`ContributionsBeforeLoginMenuItem`)}}</b-dropdown-item>
              <template v-if="!($store.state.user.profile)">
                <b-dropdown-item v-if="!($store.state.user.profile)" href="/auth/mediawiki/login" right>
                  <i class="fas fa-sign-in-alt"></i>{{$t(`LoginMenuItem`)}}
                </b-dropdown-item>
              </template>
              <template v-if="($store.state.user.profile)">
                <b-dropdown-item href="/auth/mediawiki/logout"><i class="fas fa-sign-out-alt"></i>{{$t(`LogoutMenuItem`)}}</b-dropdown-item>
              </template>
             </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </nav>
    <div style="margin-top:70px" class="container small-screen-padding">
      <nuxt class="pt-lg-4 pt-md-2 pt-sm-1"/>
    </div>
    <b-modal id="modal-keymap" title="Keymap">
      V: Should Revert<br/>
      G: Looks Good<br/>
      P: Not Sure<br/>
      →: Next Card<br/>
    </b-modal>
    <b-toast ref="example-toast-ref" id="example-toast" title="BootstrapVue" class="b-toaster-top-right" no-auto-hide>
      Hello, world! This is a toast message.
      <div class="btn btn-primary"> Get Out </div>
    </b-toast>
  </div>
</template>

<script lang="ts">
    import socket from '@/plugins/socket.io.js';
    import languages from '@/locales/languages.js';
    import {InteractionItem} from "~/shared/schema";

    export default {
    data() {
      return {
        languages
      }
    },
    methods: {
      commitFlagsFromUrlQuery: function(query) {
        for (let k in query) {
          let v = query[k];
          if (v === "1" || v === "true") v = true; // convert to native boolean
          else if (v==="0" || v==="false") v = false;
          this.$store.commit(`setFlag`, {key: k, value: v});
        }
      }
    },
    computed: {
      wiki: {
        get () {
          return this.$store.state.wiki
        },
        set (wiki) {
          if (wiki != this.$store.state.wiki) {
            // Probably Wiki language doesn't have to be tied to UI language.
            // For example, people can edit wikidata in any language. Or,
            // they might prefer editing the Indonesian wiki using English interface
            const wikiToLangMap = {
              "afwiki": "af",
              "enwiki": "en",
              "dewiki": "de",
              "frwiki": "fr",
              "idwiki": "id",
              "lvwiki": "lv",
              "plwiki": "pl",
              "ruwiki": "ru",
              "trwiki": "tr",
              "zhwiki": "zh",
              "wikidatawiki": "en", // TODO(xinbenlv): consider how we deal with wikidata UI languages.
              "testwiki": "test",
            };
            if (wikiToLangMap[wiki] != 'en') this.$router.push(`/${wikiToLangMap[wiki]}`);
            else this.$router.push(`/`);
            this.$store.commit('user/setPreferences', {wiki:wiki});
            this.$store.dispatch('changeWiki', wiki);
            this.$i18n.locale = wikiToLangMap[wiki];
          }
        }
      },
      userId: {
        get() {
          if (this.$store.state.user.profile) return this.$store.state.user.profile.displayName;
          else return this.$cookiez.get('_ga');
        },
      }
    },
    async mounted() {
      this.commitFlagsFromUrlQuery(this.$route.query);
      socket.on('metrics-update', async (metrics) => {
        this.$store.commit(`setMetrics`, metrics);
      });

      // DEPRECATED, use interaction-item
      socket.on('interaction', async (interaction) => {
        try {
            if (interaction.newJudgement.userGaId === this.$cookiez.get('_ga')) {
                this.$bvToast.toast(
                    `Your judgement for ${interaction.recentChange.title} for revision ${interaction.wikiRevId} has been logged.`, {
                        title: 'Your Judgement',
                        //autoHideDelay: 3000,
                        appendToast: true
                    });
            } else {
                this.$bvToast.toast(
                    `A judgement for ${interaction.recentChange.title} for revision ${interaction.wikiRevId} has been logged.`, {
                        title: 'New Judgement',
                        //autoHideDelay: 3000,
                        appendToast: true
                    });
            }
        } catch (e) {
          console.warn('omitted', e);
        }
      });
        socket.on('interaction-item', async (interaction: InteractionItem) => {
            if (interaction.userGaId === this.$cookiez.get('_ga')) {
                this.$bvToast.toast(
                    `Your judgement for ${interaction.title} for revision ${interaction.wikiRevId} has been logged.`, {
                        title: 'Your Judgement',
                        //autoHideDelay: 3000,
                        appendToast: true
                    });
            } else {
                this.$bvToast.toast(
                    `A judgement for ${interaction.title} for revision ${interaction.wikiRevId} has been logged.`, {
                        title: 'New Judgement',
                        //autoHideDelay: 3000,
                        appendToast: true
                    });
            }
        });
      let userIdInfo:any = {};
      userIdInfo.userGaId = this.$cookiez.get('_ga');

      if (this.$store.state.user && this.$store.state.user.profile) {
        userIdInfo.wikiUserName = this.$store.state.user.profile.displayName;
      }
      socket.emit('user-id-info', userIdInfo);

    }
}

</script>
<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.avatar-navbar {
  width: 48px;
  height: 48px;
  margin-top: -18px;
  margin-bottom: -18px;
}

@media (max-width: 576px) {
  .small-screen-padding {
    padding-left: 6px;
    padding-right: 6px;
  }
}
.nav-item .fas, .nav-item span {
  line-height: 24px;
  padding: 7px;
}

</style>
