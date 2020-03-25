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
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
        <a class="navbar-brand" href="/">WikiLoop Battlefield <sup>{{$store.state.version}}</sup></a>
        <b-navbar-toggle  target="nav-collapse">
        </b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item href="/" class="active" v-b-tooltip.hover title="Home">
              <i class="fas fa-home"></i>
            </b-nav-item>
            <b-nav-item href="/marked" v-b-tooltip.hover title="History">
              <i class="fas fa-history"></i> ({{stats ? stats.totalJudgement : 0}})</b-nav-item>
            <b-nav-item href="/online" v-b-tooltip.hover title="Online Users"><i class="fas fa-users"></i>
              ({{ $store.state.liveUsers.wikiUserNames.length + $store.state.liveUsers.userGaIds.length }})
            </b-nav-item>
            <b-nav-item href="/api/markedRevs.csv" v-b-tooltip.hover title="Download">
              <i class="fas fa-cloud-download-alt"></i>
            </b-nav-item>
            <b-nav-item href="/leaderboard" v-b-tooltip.hover title="Leaderboard">
              <i class="fas fa-trophy"></i>
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
              <b-form-select class="small" v-model="wiki">
                <option v-for="language in languages" :key="language.value" :value="language.value">{{ language.text }}</option>
              </b-form-select>
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown  right>
              <template v-slot:button-content>
                <object type="image/svg+xml" class="avatar-navbar" v-bind:data="`/api/avatar/${userId}`" ></object>{{$store.state.user.profile ? `${$store.state.user.profile.displayName}`:`${$t(`Anonymous`)}`}}
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
    <div style="margin-top:80px" class="container small-screen-padding">
      <nuxt />
    </div>
    <b-modal id="modal-keymap" title="Keymap">
      V: Should Revert<br/>
      G: Looks Good<br/>
      P: Not Sure<br/>
      →: Next Card<br/>
    </b-modal>
  </div>
</template>

<script>
  import socket from '~/plugins/socket.io.js';
  import languages from '~/locales/languages.js';

  export default {
    data() {
      return {
        liveUserCount: 1,
        stats: 0,
        languages
      }
    },
    methods: {
      commitFlagsFromUrlQuery: function(query) {
        for (let k in query) {
          let v = query[k];
          if (v === "1" | v === "true") v = true; // convert to native boolean
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
            "wikidatawiki": "en", // TODO(xinbenlv): consider how we deal with wikidata UI langauge.
          };
          this.$i18n.locale = wikiToLangMap[wiki];
          this.$store.commit('user/setPreferences', {wiki:wiki});
          this.$store.dispatch('changeWiki', wiki)
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
      this.stats = await this.$axios.$get(`/api/stats`);
      socket.on('live-users-update', async (liveUsers) => {
        this.$store.commit(`setLiveUsers`, liveUsers);
      });
      document.addEventListener('stats-update', async () => {
        console.log(`stats-update:`);
        this.stats = await this.$axios.$get(`/api/stats`);
      });
      socket.on('interaction', async (interaction) => {
        if (interaction.newJudgement.userGaId === this.$cookiez.get('_ga')) {
          this.$bvToast.toast(
              `Your judgement for ${interaction.recentChange.title} for revision ${interaction.wikiRevId} has been logged.`, {
                title: 'Your Judgement',
                autoHideDelay: 3000,
                appendToast: true
              });
        } else {
          this.$bvToast.toast(
              `A judgement for ${interaction.recentChange.title} for revision ${interaction.wikiRevId} has been logged.`, {
                title: 'New Judgement',
                autoHideDelay: 3000,
                appendToast: true
              });
        }
      });
      let userIdInfo = {};
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
