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
        <div class="version">
          <div class="demo version-section"><a href="https://github.com/google/wikiloop-battlefield" class="github-corner">
            <svg width="56" height="56" viewBox="0 0 250 250" style="fill:#64CEAA; color:#fff; position: absolute; top: 0; border: 0; left: 0; transform: scale(-1, 1);">
              <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
              <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
              <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
            </svg></a>
          </div>
        </div>
        <a class="navbar-brand" href="#">WikiLoop Battlefield</a>
        <b-navbar-toggle  target="nav-collapse">
        </b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item class="active" href="/"><i class="fas fa-home"></i> Home</b-nav-item>
            <b-nav-item href="/marked"><i class="fas fa-history"></i> History ({{stats ? stats.totalJudgement : 0}})</b-nav-item>
            <b-nav-item href="/api/markedRevs.csv"><i class="fas fa-cloud-download-alt"></i> Download</b-nav-item>
            <b-nav-item href="/leaderboard"><i class="fas fa-trophy"></i> Leaders</b-nav-item>
            <b-nav-item-dropdown text="About" right>
              <b-dropdown-item href="https://github.com/google/wikiloop-battlefield/issues">Issues</b-dropdown-item>
              <b-dropdown-item href="https://github.com/google/wikiloop-battlefield">Code </b-dropdown-item>
              <b-dropdown-item href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop">WikiProject</b-dropdown-item>
              <b-dropdown-item href="/api/stats">Stats</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item right href="#"><i class="fas fa-users"></i> Online ({{ liveUserCount }})</b-nav-item>
            <b-nav-item :href="`/marked/?userGaId=${$cookiez.get('_ga')}`" right>
                <object class="avatar-navbar" v-bind:data="`/api/avatar/${$cookiez.get('_ga')}`" ></object>Me
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
    async asyncData({$axios}) {
      const version = await $axios.$get(`/api/version`);
      return {version};
    },

    async mounted() {
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
              `Your judgement for ${interaction.recentChange.title} for revision ${interaction.wikiRevId} is logged.`, {
                title: 'Your Judgement',
                autoHideDelay: 3000,
                appendToast: true
              });
        } else {
          this.$bvToast.toast(
              `A judgement for ${interaction.recentChange.title} for revision ${interaction.wikiRevId} is logged.`, {
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
