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
            <b-nav-item href="#" v-b-tooltip.hover title="Online Users"><i class="fas fa-users"></i> ({{ liveUserCount }})</b-nav-item>
            <b-nav-item href="/api/markedRevs.csv" v-b-tooltip.hover title="Download">
              <i class="fas fa-cloud-download-alt"></i>
            </b-nav-item>
            <b-nav-item href="/leaderboard" v-b-tooltip.hover title="Leaderboard">
              <i class="fas fa-trophy"></i>
            </b-nav-item>
            <b-nav-item-dropdown text="About" right>
              <b-dropdown-item href="https://github.com/google/wikiloop-battlefield/issues">Issues</b-dropdown-item>
              <b-dropdown-item href="https://github.com/google/wikiloop-battlefield">Code </b-dropdown-item>
              <b-dropdown-item href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop">WikiProject</b-dropdown-item>
              <b-dropdown-item href="/api/stats">Stats</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item v-if="!($store.state.user.profile)" href="/auth/mediawiki/login" right>
              Login
            </b-nav-item>
            <b-nav-item v-if="($store.state.user.profile)" href="/auth/mediawiki/logout" right>
              Logout
            </b-nav-item>
            <b-nav-item :href="`/marked/?userGaId=${$cookiez.get('_ga')}`" right>
                <object class="avatar-navbar" v-bind:data="`/api/avatar/${$cookiez.get('_ga')}`" ></object>Me{{$store.state.user.profile ? `(${$store.state.user.profile.displayName})`:''}}
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </nav>
    <nuxt />
  </div>
</template>

<script>
  import socket from '~/plugins/socket.io.js';
  export default {
    data() {
      return {
        liveUserCount: 1,
        stats: 0
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
    async mounted() {
      this.commitFlagsFromUrlQuery(this.$route.query);
      this.stats = await this.$axios.$get(`/api/stats`);
      socket.on('client-activity', async (clientActivity) => {
        this.liveUserCount = clientActivity.liveUserCount;
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

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.avatar-navbar {
  width: 48px;
  height: 48px;
  margin-top: -18px;
  margin-bottom: -18px;
}
</style>
