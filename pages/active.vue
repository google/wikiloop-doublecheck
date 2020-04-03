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
  <section>
    <h1>Live Users <sup>per connection</sup></h1>
    <table class="table table-bordered">
      <thead>
        <th>User</th>
        <th>Last Active</th>
      </thead>
      <tbody>
        <tr v-for="(client, index) of $store.state.metrics.activeLoggedInUser">
          <td scope="col">
            <router-link :to="`/marked/?wikiUserName=${client.wikiUserName}`" replace>
              <object class="avatar-object" v-bind:data="`/api/avatar/${client.wikiUserName}`" >
              </object><span>{{client.wikiUserName}} </span>
              <span v-if="isMe(client)">(Me)</span>
            </router-link>
          </td>
          <td scope="col"><timeago :datetime="client.lastActive"></timeago></td>
        </tr>
        <tr v-for="(client, index) of $store.state.metrics.activeAnonymousUser">
          <td scope="col">
            <router-link :to="`/marked/?userGaId=${client.userGaId}`" replace>
              <object class="avatar-object" v-bind:data="`/api/avatar/${client.userGaId}`" >
              </object><span>Anonymous </span>
              <span v-if="isMe(client)">(Me)</span>
            </router-link>
          </td>
          <td scope="col"><timeago :datetime="client.lastActive"></timeago></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
<script lang="ts">
  export default {
    layout: 'default', // not using any layout
    methods: {
      isMe: function(leader) {
        return (this.$store.state.user && this.$store.state.user.profile
            && this.$store.state.user.profile.displayName === leader.wikiUserName)
            || this.$cookiez.get('_ga') === leader.userGaId;
      },
    },
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
