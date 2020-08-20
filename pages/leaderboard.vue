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
        <div class="container small-screen-padding">
            <TimeSeriesBarChart></TimeSeriesBarChart>
            <b-form-select class="mt-4"
                    @click.native.stop=''
                    v-model="timeRange"
                    v-on:change="load()">
                <option :value="null">{{$t('Label-AllTime')}}</option>
                <option :value="1">{{$t('Label-1day')}}</option>
                <option :value="7">{{$t('Label-1week')}}</option>
                <option :value="30">{{$t('Label-1Month')}}</option>
                <option :value="90">{{$t('Label-1Quarter')}}</option>
                <option :value="365">{{$t('Label-1Year')}}</option>
            </b-form-select>
            <div class="card mt-4">
                <div class="card-header"><h2>{{$t('Label-TopWikis')}}</h2></div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th scope="row">{{$t('Label-Rank')}}</th>
                                <th>Wikis</th>
                                <th>{{$t('Label-CountOfJudgements')}}</th>
                                <th>{{$t('Label-LastActiveTime')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <template v-for="(leadWiki, index) in wikis">
                                <tr :key="index">
                                    <td scope="col">
                                        {{index + 1}}
                                    </td>
                                    <td scope="col">
                                        <router-link :to="`/history?wiki=${leadWiki.wiki}`" replace>
                                            <span>{{getWiki(leadWiki.wiki)}}</span>
                                        </router-link>
                                    </td>
                                    <td scope="col">{{leadWiki.count}}</td>
                                    <td scope="col">
                                        <timeago
                                                :datetime="new Date(leadWiki.lastTimestamp * 1000).toString()" :locale="$i18n.locale"></timeago>
                                    </td>
                                </tr>
                            </template>
                            </tbody>
                            <tfoot>
                              <tr>
                                <th scope="row">{{$t('Label-TotalNumber')}}</th>
                                <th></th>
                                <th>{{wikis.map(wiki=>wiki.count).reduce((a, b) => a+b, 0)}}</th>
                                <th>
                                    <timeago
                                            :datetime="new Date(
                                            wikis.map(wiki=>wiki.lastTimestamp)
                                                .reduce((a, b) => Math.max(a,b), 0) * 1000).toString()" :locale="$i18n.locale">

                                    </timeago>
                                </th>
                              </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header">
                    <h2>{{$t('Label-TopUsers')}} ({{totalLoggedIn}})</h2>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th scope="row">{{$t('Label-Rank')}}</th>
                                <th>{{$t('Label-User')}}</th>
                                <th>Wikis</th>
                                <th>{{$t('Label-CountOfJudgements')}}</th>
                                <th>{{$t('Label-LastActiveTime')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <template v-for="(leader, index) in loggedIn">
                                <tr v-bind:class="{ 'table-success': isMe(leader) }" :key="leader">
                                    <td scope="col">
                                        {{index + 1}}
                                    </td>
                                    <td scope="col">
                                      <UserAvatarWithName :wikiUserName="leader.wikiUserName" :userGaId="leader.userGaId"></UserAvatarWithName>
                                    </td>
                                    <td scope="col">
                                        <template v-for="wiki of leader.wikis">
                                            <a :key="wiki" class="mr-1"
                                               :href="`${getUrlBaseByWiki(wiki)}/wiki/Special:Contributions/${leader.wikiUserName}`">{{getWiki(wiki)}}</a>
                                        </template>
                                    </td>
                                    <td scope="col">{{leader.count}}</td>
                                    <td scope="col">
                                        <timeago :datetime="new Date(leader.lastTimestamp * 1000).toString()" :locale="$i18n.locale"></timeago>
                                    </td>
                                </tr>
                            </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="card mt-4">
                <div class="card-header">
                    <h2><span v-html="$t('Label-TopNumberAnonymousUsers', [20])"></span></h2>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th scope="row">{{$t('Label-Rank')}}</th>
                                <th>{{$t('Label-User')}}</th>
                                <th>Wikis</th>
                                <th>{{$t('Label-CountOfJudgements')}}</th>
                                <th>{{$t('Label-LastActiveTime')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <template v-for="(leader, index) in anonymous">
                                <tr v-bind:class="{ 'table-success': isMe(leader) }" :key="leader">
                                    <td scope="col">
                                        {{index + 1}}
                                    </td>
                                    <td scope="col">
                                      <UserAvatarWithName :userGaId="leader.userGaId"></UserAvatarWithName>
                                    </td>
                                    <td scope="col">
                                        <span class="mr-1" v-for="wiki of leader.wikis" :key="wiki">{{wiki}}</span>
                                    </td>
                                    <td scope="col">{{leader.count}}</td>
                                    <td scope="col">
                                        <timeago :datetime="new Date(leader.lastTimestamp * 1000).toString()" :locale="$i18n.locale"></timeago>
                                    </td>
                                </tr>
                            </template>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </section>
</template>
<script lang="ts">
  import {getUrlBaseByWiki, fetchDiffWithWikiRevId, wikiToLangMap} from '@/shared/utility-shared';
  import VueTimeago from 'vue-timeago';
  import ISO6391 from 'iso-639-1';
  import UserAvatarWithName from '@/components/UserAvatarWithName.vue';

  export default {
    components: {
      VueTimeago,
      UserAvatarWithName
    }, data() {
      return {
        timeRange: null
      }
    }, async asyncData({$axios, query}) {
      let url = `/api/leaderboard`;
      const {loggedIn, anonymous, wikis, totalLoggedIn} = await $axios.$get(`/api/leaderboard?limit=${query?.limit || 20}`);
      return {loggedIn, anonymous, wikis, totalLoggedIn};
    }, methods: {
      isMe: function (leader) {
        return (this.$store.state.user && this.$store.state.user.profile && this.$store.state.user.profile.displayName === leader.wikiUserName) || this.$cookiez.get('_ga') === leader.userGaId;
      }, getWiki: function (wiki) {
        let lang = wikiToLangMap[wiki];
        let nativeName = ISO6391.getNativeName(lang)
        if(nativeName) return nativeName;
        return wiki; // fall back
      }, load: async function () {
        const {loggedIn, anonymous, wikis, totalLoggedIn} = await this.$axios.$get(`/api/leaderboard?days=${this.timeRange}&limit=${this.$route.query?.limit || 20}}`);
        this.loggedIn = loggedIn;
        this.anonymous = anonymous;
        this.wikis = wikis;
        this.totalLoggedIn = totalLoggedIn;
      },
    }, mounted() {
      this.$ga.page('/leaderboard.vue');
    }, beforeCreate() {
      this.getUrlBaseByWiki = getUrlBaseByWiki.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
      this.fetchDiffWithWikiRevId = fetchDiffWithWikiRevId.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
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
    .svg-container {
      display: inline-block;
      position: relative;
      width: 100%;
      padding-bottom: 100%; /* aspect ratio */
      vertical-align: top;
      overflow: hidden;
    }
    .svg-content-responsive {
      display: inline-block;
      position: absolute;
      top: 10px;
      left: 0;
    }

</style>
