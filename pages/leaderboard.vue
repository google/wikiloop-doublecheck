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
<!--eslint-disable-->
<template>
  <section>
    <div class="container small-screen-padding" style="margin-top:80px">
      <h2>Logged In Users</h2>
      <div class="table-responsive mt-5">
        <table class="table table-bordered">
          <thead>
          <tr>
            <th scope="row">Rank</th>
            <th>User</th>
            <th>Count</th>
            <th>Last Active</th>
          </tr>
          </thead>
          <tbody>
            <template  v-for="(leader, index) in loggedIn">
              <tr v-bind:class="{ 'table-success': isMe(leader) }">
                <td scope="col">
                  {{index + 1}}
                </td>
                <td scope="col">
                  <router-link :to="`/marked/?wikiUserName=${leader.wikiUserName}`" replace>
                    <object class="avatar-object" v-bind:data="`/api/avatar/${leader.wikiUserName}`" ></object>
                    <span v-if="isMe(leader)">Me (User:{{leader.wikiUserName}})</span>
                    <span v-else>User:{{leader.wikiUserName}}</span>
                  </router-link>
                </td>
                <td scope="col">{{leader.count}}</td>
                <td scope="col">{{new Date(leader.lastTimestamp * 1000).toISOString()}} <br/> (<timeago :datetime="new Date(leader.lastTimestamp * 1000).toString()"></timeago>)</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <h2>Anonymous Users</h2>
      <div class="table-responsive mt-5">
        <table class="table table-bordered">
        <thead>
          <tr>
            <th scope="row">Rank</th>
            <th>User</th>
            <th>Count</th>
            <th>Last Active</th>
          </tr>
        </thead>
        <tbody>
          <template  v-for="(leader, index) in anonymous">
          <tr v-bind:class="{ 'table-success': isMe(leader) }">
            <td scope="col">
              {{index + 1}}
            </td>
            <td scope="col">
              <router-link :to="`/marked/?userGaId=${leader.userGaId}`" replace>
                <object class="avatar-object" v-bind:data="`/api/avatar/${leader.userGaId}`" ></object>
                <span v-if="isMe(leader) ">Me</span>
                <span v-else>Someone</span>
              </router-link>
            </td>
            <td scope="col">{{leader.count}}</td>
            <td scope="col">{{new Date(leader.lastTimestamp * 1000).toISOString()}} <br/> (<timeago :datetime="new Date(leader.lastTimestamp * 1000).toString()"></timeago>)</td>
          </tr>
          </template>
        </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
<script>
  import BootstrapVue from 'bootstrap-vue';
  import VueTimeago from 'vue-timeago';

  const $ = require('jquery');

  export default {
    comments: {
      BootstrapVue,
      VueTimeago
    },
    async asyncData({$axios}) {
      const { loggedIn, anonymous } = await $axios.$get(`/api/leaderboard`);
      return { loggedIn ,anonymous };
    },
    methods: {
      isMe: function(leader) {
        return (this.$store.state.user && this.$store.state.user.profile
                && this.$store.state.user.profile.displayName === leader.wikiUserName)
            || this.$cookiez.get('_ga') === leader.userGaId;
      }
    },
    mounted() {
      this.$ga.page('/leaderboard.vue'); // track page
    }
  }
</script>

<style>
  .avatar-object {
    width: 48px;
    height: 48px;
    margin-top: -18px;
    margin-bottom: -18px;
  }
</style>
