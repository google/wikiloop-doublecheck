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
  <div class="wldc-app">
    <header
      class="wldc-header navbar navbar-expand-lg navbar-light bg-light fixed-top shadow border-1"
    >
      <nav class="container-xl d-flex align-items-center">
        <a class="navbar-brand" href="/">WikiLoop DoubleCheck</a>
        <b-navbar-toggle target="nav-collapse" />
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="flex-grow-1 d-flex flex-wrap">
            <b-nav-item v-b-tooltip.hover href="/history" title="History">
              <i class="fas fa-history" />
            </b-nav-item>
            <b-nav-item
              v-b-tooltip.hover
              href="/leaderboard"
              title="Leaderboard"
            >
              <i class="fas fa-trophy" />
            </b-nav-item>
            <b-nav-item-dropdown v-b-tooltip.hover right title="Featured feeds">
              <template #button-content>
                <i class="fas fa-faucet pr-0" />
              </template>
              <b-dropdown-item
                href="/feed/mix"
              >
                Mix Feeds<sup class="text-warning">β</sup>
              </b-dropdown-item>
              <b-dropdown-item
                href="/feed/lastbad"
              >
                Last Bad Feed<sup class="text-warning">β</sup>
              </b-dropdown-item>
              <b-dropdown-item
                href="/feed/recent"
              >
                Recent Feed<sup class="text-warning">β</sup>
              </b-dropdown-item>
              <b-dropdown-item
                href="/feed/ores"
              >
                ORES detected Feed<sup
                  class="text-warning"
                >β</sup>
              </b-dropdown-item>
              <b-dropdown-item
                href="/feed/wikitrust"
              >
                WikiTrust detected Feed<sup
                  class="text-warning"
                >β</sup>
              </b-dropdown-item>
              <b-dropdown-item
                href="/feed/us2020"
              >
                US 2020 Election Topic Feed<sup
                  class="text-warning"
                >β</sup>
              </b-dropdown-item>
              <b-dropdown-item
                href="/feed/covid19"
              >
                COVID-19 Topic Feed<sup
                  class="text-warning"
                >β</sup>
              </b-dropdown-item>
            </b-nav-item-dropdown>

            <b-nav-item
              v-b-tooltip.hover
              href="/active"
              :title="$t('Label-ActiveUsers')"
            >
              <i class="fas fa-users" />
            </b-nav-item>
            <b-nav-item
              v-b-tooltip.hover
              href="/api/markedRevs.csv"
              title="Download"
            >
              <i class="fas fa-cloud-download-alt" />
            </b-nav-item>
            <b-nav-item-dropdown
              v-b-tooltip.hover
              right
              :title="$t('Label-ProjectInfo')"
            >
              <template #button-content>
                <i class="fas fa-info" />
              </template>
              <b-dropdown-item
                href="https://github.com/google/wikiloop-doublecheck/issues"
                target="_blank"
              >
                {{ $t('MenuItem-Issues') }}
              </b-dropdown-item>
              <b-dropdown-item
                href="https://github.com/google/wikiloop-doublecheck"
                target="_blank"
              >
                {{ $t('MenuItem-Code') }}
              </b-dropdown-item>
              <b-dropdown-item
                href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop"
                target="_blank"
              >
                WikiProject
              </b-dropdown-item>
              <b-dropdown-item href="/api/stats" target="_blank">
                {{
                  $t('MenuItem-Stats')
                }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item
              v-b-tooltip.hover
              target="_blank"
              :href="
                `https://github.com/google/wikiloop-doublecheck/edit/master/i18n/locales/${$i18n.locale}.yml`
              "
              :title="$t('Button-HelpTranslate')"
            >
              <i class="fas fa-language" />
            </b-nav-item>
            <b-nav-item>
              <b-form-select
                v-model="wiki"
                class="small align-self-start"
                @click.native.stop=""
              >
                <option
                  v-for="language in languages"
                  :key="language.wiki"
                  :value="language.wiki"
                >
                  {{ language.wiki }} {{ language.nativeText }}
                </option>
              </b-form-select>
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown>
              <template #button-content>
                <div class="d-flex">
                  <user-avatar-with-name
                    class="avatar-img"
                    :wiki-user-name="
                      $store.state.user.profile
                        ? $store.state.user.profile.displayName
                        : null
                    "
                    :user-ga-id="$cookiez.get('_ga')"
                  />
                </div>
              </template>
              <b-dropdown-item
                v-if="
                  $store.state.user.profile &&
                    $store.state.user.profile.displayName
                "
                :href="
                  `/history?wikiUserName=${$store.state.user.profile.displayName}`
                "
              >
                <i class="fas fa-list" />{{ $t(`MenuItem-Contributions`) }}
              </b-dropdown-item>
              <b-dropdown-item
                :href="`/history?userGaId=${$cookiez.get('_ga')}`"
              >
                <i class="fas fa-list" />{{ $t(`MenuItem-Contributions`) }}
              </b-dropdown-item>
              <template v-if="!$store.state.user.profile">
                <b-dropdown-item
                  v-if="!$store.state.user.profile"
                  href="/auth/mediawiki/login"
                  right
                >
                  <i class="fas fa-sign-in-alt" />{{ $t(`Label-Login`) }}
                </b-dropdown-item>
              </template>
              <template v-if="$store.state.user.profile">
                <b-dropdown-item
                  href="/auth/mediawiki/logout"
                >
                  <i class="fas fa-sign-out-alt" />{{ $t(`Label-Logout`) }}
                </b-dropdown-item>
              </template>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </nav>
    </header>
    <main class="wldc-body">
      <NoticeBanner />
      <nuxt />
    </main>
    <b-modal id="modal-keymap" title="Keymap">
      V: {{ $t('Label-ShouldRevert') }}<br>
      G: {{ $t('Label-LooksGood') }}<br>
      P: {{ $t('Label-NotSure') }}<br>
      →: {{ $t('Button-Next') }}<br>
    </b-modal>
  </div>
</template>

<script lang="ts">
import socket from '@/plugins/socket.io.js';
import ISO6391 from 'iso-639-1';
import { InteractionItem } from '~/shared/schema';
import UserAvatarWithName from '~/components/UserAvatarWithName.vue';
import NoticeBanner from '~/components/NoticeBanner.vue';
import { wikiToLangMap, wikiLangs } from '~/shared/utility-shared';

export default {
  components: {
    UserAvatarWithName,
    NoticeBanner,
  },
  data() {
    return {
      languages: Object.keys(wikiToLangMap).map((wiki) => {
        const lang = wikiToLangMap[wiki];
        return {
          wiki,
          lang,
          nativeText: ISO6391.getNativeName(lang) || wiki,
        };
      }),
    };
  },
  computed: {
    wiki: {
      get() {
        return this.$store.state.wiki;
      },
      set(wiki: string) {
        if (wiki != this.$store.state.wiki) {
          // Probably Wiki language doesn't have to be tied to UI language.
          // For example, people can edit wikidata in any language. Or,
          // they might prefer editing the Indonesian wiki using English interface
          this.$store.commit('user/setPreferences', { wiki });
          this.$store.dispatch('changeWiki', wiki);
          this.$i18n.locale = wikiToLangMap[wiki];
        }
      },
    },
    userId: {
      get() {
        if (this.$store.state.user.profile) {return this.$store.state.user.profile.displayName;} else {return this.$cookiez.get('_ga');}
      },
    },
  },
  async mounted() {
    this.commitFlagsFromUrlQuery(this.$route.query);
    socket.on('metrics-update', async (metrics) => {
      this.$store.commit('setMetrics', metrics);
    });

    socket.on('interaction-item', async (interaction: InteractionItem) => {
      if (interaction.userGaId === this.$cookiez.get('_ga')) {
        this.$bvToast.toast(
          this.$t('Message-YourJudgementLogged', [
            interaction.title,
            interaction.wikiRevId,
          ]),
          {
            title: this.$t('Label-YourJudgement'),
            // autoHideDelay: 3000,
            appendToast: true,
          },
        );
      } else {
        this.$bvToast.toast(
          this.$t('Message-AJudgementLogged', [
            interaction.title,
            interaction.wikiRevId,
          ]),
          {
            title: 'New Judgement',
            // autoHideDelay: 3000,
            appendToast: true,
          },
        );
      }
    });
    const userIdInfo: any = {};
    userIdInfo.userGaId = this.$cookiez.get('_ga');

    if (this.$store.state.user && this.$store.state.user.profile) {
      userIdInfo.wikiUserName = this.$store.state.user.profile.displayName;
    }
    socket.emit('user-id-info', userIdInfo);
  },
  methods: {
    commitFlagsFromUrlQuery(query) {
      for (const k in query) {
        let v = query[k];
        if (v === '1' || v === 'true') {v = true;}
        // convert to native boolean
        else if (v === '0' || v === 'false') {v = false;}
        this.$store.commit('setFlag', { key: k, value: v });
      }
    },
  },
};
</script>
<style lang="scss">
@import 'custom.scss';

html {
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;

  @include media-breakpoint-down(sm) {
      font-size: 90%;
  }
  @include media-breakpoint-down(xs) {
      font-size: 80%;
  }
}

body {
    font-family: 'Noto Sans', 'Open Sans', 'Roboto', sans-serif;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.nav-link.dropdown-toggle {
  display: flex;
  align-items: center;
}

a {
  a:hover {
    text-decoration: none;
  }
}

.collapse,
.collapsing,
.collapse.show {
  .navbar-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    .nav-link {
      padding: 0.5rem;
    }
  }
}

.dropdown-item {
  i {
    padding-right: 0.5rem;
  }
}

$wldc-header-height: 4rem;

.wldc-header {
  min-height: $wldc-header-height;
}
.wldc-app {
  padding-top: $wldc-header-height;
}
.wldc-body {
  height: max(calc(100vh - #{$wldc-header-height}), calc(612px - #{$wldc-header-height}));
}

.custom-select {
  font-size: .7rem;
}
</style>
