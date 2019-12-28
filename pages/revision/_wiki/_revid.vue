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
      <h1 >Revision {{wikiRevId}}</h1>
      <div class="col-12 p-2">
        <StaticRevisionCard
          :wikiRevId="wikiRevId"
          :interaction="interaction"
          :ores="ores"
          :diff="diff"
          :revision="revision"
        ></StaticRevisionCard>
      </div>
    </div>
  </section>
</template>
<script>

  import StaticRevisionCard from '~/components/StaticRevisionCard.vue';
  import utility from '../../../shared/utility';
  export default {
    components: {
      StaticRevisionCard
    },
    methods: {
    },
    computed: {
      wikiRevId () {
        return `${this.$route.params.wiki}:${this.$route.params.revid}`;
      }
    },
    async asyncData ({ params, $axios }) {
      const wikiRevId = `${params.wiki}:${params.revid}`;
      const revision = (await $axios.$get(
          `/api/revisions`, {
            params: {
              wikiRevIds: [wikiRevId]
            }
          }))[params.wiki][0];
      const ores = (await $axios.$get(
          `/api/ores`, { params: { wikiRevIds: [wikiRevId] }}))[params.wiki][0];

      let interaction;
      const interactions = await $axios.$get(`/api/interactions`, { params: params });
      if (interactions.length > 0) {
        interaction = interactions[0];
      } else {
        // TODO(xinbenlv): create an empty default to improve robustness.
        interaction = {
          "wikiRevId": wikiRevId,
          "judgements": [], // empty
          "recentChange": 0,
          "lastTimestamp": 0,
          "counts": {
            Total: 0,
            NotSure: 0,
            ShouldRevert: 0,
          },
        };
      }
      const diff = await utility.fetchDiffWithWikiRevId(wikiRevId, $axios);
      return { ores, revision, interaction, diff };
    },
    /** Validate the parameters.
     *
     * @param params
     *   wiki: must be a string of supported wikis
     *   revid: must be a number
     * @return {boolean}
     */
    validate ({ params }) {
      return (utility.supportedWikis.indexOf(params.wiki) >= 0) && /\d+/.test(params.revid);
    },
    mounted() {
      this.$ga.page('/revision.vue'); // track page
    },
    /** Override the head to optimize for Search Engines / Facebook crawling.
     *
     * @return {{meta: *[], title: *}}
     */
    head () {
      let title = `WikiLoop Battlefield (${this.wikiRevId})`;
      let desc = `Is this Wikipedia edit good or bad? Come share your opinion at WikiLoop Battlefield. (${this.wikiRevId})`;
      let img = `https://github.com/google/wikiloop-battlefield/raw/master/assets/wikiloop-battlefield-logo.svg?sanitize=true`;
      let canonicalUrl = `http://battlefield.wikiloop.org/${this.$route.path}`;
      return {
        title: title,
        link: [
          {
            rel: 'canonical',
            href: canonicalUrl,
          },
        ],
        meta: [
          // hid is used as unique identifier. Do not use `vmid` for it as it will not work
          {
            hid: 'description',
            name: 'description',
            content: desc
          },
          {
            hid: 'og:site_name',
            name: 'og:site_name',
            property: 'og:site_name',
            content: desc
          },
          {
            hid: 'og:description',
            name: 'og:description',
            property: 'og:description',
            content: desc
          },
          {
            hid: 'og:title',
            name: 'og:title',
            property: 'og:title',
            content: title
          },
          {
            hid: 'og:image',
            name: 'og:image',
            property: 'og:image',
            content: img
          },
          {
            hid: 'og:url',
            name: 'og:url',
            property: 'og:url',
            content: canonicalUrl
          },
          {
            hid: 'apple-mobile-web-app-title',
            name: 'apple-mobile-web-app-title',
            property: 'apple-mobile-web-app-title',
            content: desc
          },
        ]
      }
    }
  }
</script>

<style>
  @media (max-width: 576px) {
    .small-screen-padding {
      padding-left: 6px;
      padding-right: 6px;
    }
  }
</style>
