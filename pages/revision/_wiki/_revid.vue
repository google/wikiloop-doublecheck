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
      <div class="col-12 p-2">
        <div v-if="currentRevisionPanelItem" class="card shadow h-100">
          <RevisionPanel
            :key="currentWikiRevId"
            :item="currentRevisionPanelItem"
            :feed-name="feed"
          >
          </RevisionPanel>
          <ActionPanel ref="actionPanel"
              :key="`action-panel-${currentWikiRevId}`"
              :wikiRevId="currentWikiRevId"
              :title="currentRevisionPanelItem.title"
              :feed="feed"
              @judgement-event="$refs.judgementPanel && $refs.judgementPanel.refresh()"
              @next-card="showNext()"/>
            <template v-if="currentWikiRevId">
              <button class="btn btn-outline-primary"
                v-if="!showJudgementPanel"
                @click="showJudgementPanel = !showJudgementPanel">{{$t('Button-ShowJudgements')}}</button>
              <JudgementPanel v-else ref="judgementPanel" class="card-body" :wikiRevId="currentWikiRevId" />
            </template>
        </div>
      </div>
    </div>
  </section>
</template>
<script>

import StaticRevisionCard from '@/components/StaticRevisionCard.vue';
import { fetchDiffWithWikiRevId, supportedWikis, fetchRevisionPanelItem } from '@/shared/utility-shared';
import RevisionPanel from '~/components/RevisionPanel.vue';
import ActionPanel from '~/components/ActionPanel.vue';
import JudgementPanel from '~/components/JudgementPanel.vue';
export default {
  components: {
    RevisionPanel,
    ActionPanel,
    JudgementPanel,
  },

  /** Validate the parameters.
     *
     * @param params
     *   wiki: must be a string of supported wikis
     *   revid: must be a number
     * @return {boolean}
     */
  validate({ params }) {
    return (supportedWikis.includes(params.wiki)) && /\d+/.test(params.revid);
  },
  async asyncData({ params, $axios }) {
    const currentWikiRevId = `${params.wiki}:${params.revid}`;
    const revPanelItem = await fetchRevisionPanelItem(currentWikiRevId, $axios);

    return {
      currentWikiRevId,
      currentRevisionPanelItem: revPanelItem,
      feed: 'direct-revision',
    };
  },
  data() {
    return { showJudgementPanel: true };
  },
  /** Override the head to optimize for Search Engines / Facebook crawling.
     *
     * @return {{meta: *[], title: *}}
     */
  head({ params }) {
    const title = `${this.currentRevisionPanelItem.title} (rev:${this.$route.params.revid})`;
    const desc = `Is this Wikipedia edit good or bad? Come share your opinion at WikiLoop DoubleCheck. (${this.wikiRevId})`;
    const host = 'doublecheck.wikiloop.org';
    const img = `http://${host}/wikiloop-doublecheck-logo.png`; // TODO(xinbenlv) use relative URL
    const url = `http://${host}${this.$route.path}`;
    return {
      title,
      link: [
        {
          rel: 'canonical',
          href: url,
        },
      ],
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: 'description',
          name: 'description',
          content: desc,
        },
        {
          hid: 'og:site_name',
          name: 'og:site_name',
          property: 'og:site_name',
          content: desc,
        },
        {
          hid: 'og:description',
          name: 'og:description',
          property: 'og:description',
          content: desc,
        },
        {
          hid: 'og:title',
          name: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'og:image',
          name: 'og:image',
          property: 'og:image',
          content: img,
        },
        {
          hid: 'apple-mobile-web-app-title',
          name: 'apple-mobile-web-app-title',
          property: 'apple-mobile-web-app-title',
          content: desc,
        },
        {
          hid: 'og:url',
          name: 'og:url',
          property: 'og:url',
          content: url,
        },
      ],
    };
  },
  computed: {
    wikiRevId() {
      return `${this.$route.params.wiki}:${this.$route.params.revid}`;
    },
  },
  mounted() {
    this.$ga.page('/revision.vue'); // track page
  },
  methods: {
  },
};
</script>

<style>
  @media (max-width: 576px) {
    .small-screen-padding {
      padding-left: 6px;
      padding-right: 6px;
    }
  }
</style>
