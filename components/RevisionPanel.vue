<!--
  Copyright 2020 Google LLC

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
  <section class="h-100">
    <div class="card-body d-flex flex-column small-screen-padding">
      <h2 class="mb-4">
        <div class="d-flex">
          <div class="flex-grow-1">
            <a :href="wikiPageUrl" target="_blank" class="wldc-page-title">{{ item.title }}</a>
          </div>
          <div class="ml-2"><a :href="permUrl"><i class="fas fa-link"></i></a></div>
        </div>
      </h2>
      <div class="wldc-revinfo-area text-muted mb-2 mb-sm-2 mb-xs-1">
        <div class="wldc-revinfo wldc-revinfo-revid">
          <i class="fas fa-external-link-alt mr-2"></i>{{item.revId}}
        </div>
        <div class="wldc-revinfo wldc-revinfo-timeago">
          <i class="fas fa-pen mr-2"></i><timeago :datetime="timeString" :auto-update="60" :locale="$i18n.locale"></timeago>
        </div>
        <div class="wldc-revinfo wldc-revinfo-author">
          <i class="fas fa-user mr-2"></i><a v-bind:href="authorUrl" target="_blank">{{ item.author }}</a>
        </div>
        <div class="wldc-revinfo wldc-revinfo-feed" v-if="feedName">
          <i class="fas fa-faucet mr-2"></i>{{feedName}}
        </div>
      </div>
      <div class="w-100 pl-sm-0 mb-2 flex-grow-1 justify-content-start">
        <template v-if="item.diffHtml">
          <diff-box class="wldc-rev-panel-diff-container"
            :diffContent="item.diffHtml"
            :wikiRevId="`${item.wiki}:${item.revId}`"
            :diffMetadata="item.diffMetadata"/>
        </template>
        <template v-else>
        <h5>{{$t(`Message-DiffNotAvailable`)}}
          <div v-on:click="loadDiff()" class="btn btn-outline-primary btn-small"><i class="fas fa-redo"></i></div>
          <a v-if="item" class="btn btn-outline-primary" :href="revertUrl" target="_blank"><i class="fas fa-external-link-alt"></i></a>
        </h5>
        </template>
      </div>
      <div class="card-text w-100 pl-sm-0 mb-3">
        <template v-if="item.summary">
          <h3 class="wldc-revinfo-h3">{{$t('Label-EditSummary')}}</h3>
          <span class="wldc-summary-content">{{item.summary}}</span>
        </template>
        <template v-else>
          <h5 class="text-danger w-100">{{$t('Message-ThereIsNoEditSummary')}}</h5>
        </template>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    import DiffBox from '@/components/DiffBox.vue';
    import {RevisionPanelItem} from "~/shared/interfaces";
    import {getUrlBaseByWiki} from "~/shared/utility-shared";

    @Component({
        components: {
            DiffBox
        }
    })
    export default class RevisionPanel extends Vue {
        @Prop({type: Object, required: true}) readonly item!: RevisionPanelItem;
        @Prop({type: String, required: false}) readonly feedName?: string;

        get wikiPageUrl() {
            return `${getUrlBaseByWiki(this.item.wiki)}/wiki/${this.item.title}`;
        }

        get diffUrl() {
            return `${getUrlBaseByWiki(this.item.wiki)}/wiki/Special:Diff/${this.item.revId}`;
        }

        get permUrl() {
            return `/revision/${this.item.wiki}/${this.item.revId}`;
        }

        get authorUrl() {
            return `${getUrlBaseByWiki(this.item.wiki)}/wiki/User:${this.item.author}`;
        }

        get revertUrl() {
            return `${getUrlBaseByWiki(this.item.wiki)}/w/index.php?title=${this.item.title}&diff=${this.item.revId}&oldid=prev&diffmode=source`;
        }

        get timeString() {
            return new Date(this.item.timestamp * 1000).toString();
        }
    }

</script>

<style lang="scss" scoped>
  // --- Legacy CSS ---
  .diff-context {
    word-break: break-all;
    width: 50%;
  }

  .diff-deletedline, .diff-addedline {
    word-break: break-all;
    width: 50%
  }

  .blue-link {
    color: blue
  }

  .bg-darker-light {
    background-color: #F5F5F5;
  }

  #metainfo {
    font-size: 12px;
  }

  .avatar-object {
    width: 48px;
    height: 48px;
    margin-top: -18px;
    margin-bottom: -18px;
  }
  .nobreak {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // --- New SCSS ---
  @import 'bootstrap/scss/_functions.scss';
  @import 'bootstrap/scss/_variables.scss';
  @import 'bootstrap/scss/_mixins.scss';
  .wldc-revinfo-area {
    display: grid;
    grid-template-columns: repeat(4, 25%);
    margin-bottom: 1rem;

    .wldc-revinfo {
      display: flex;
      align-items: center;
      padding-right: 1rem;
      padding-bottom: 1rem;
      &-author {
        a {
          text-overflow: ellipsis;
          overflow: hidden;
          overflow-wrap: normal;
        }
      }
    }


    @include media-breakpoint-down(md) {
      grid-template-columns: repeat(2, 50%);
    }

    // @include media-breakpoint-down(xs) {
    //   grid-template-columns: 1fr;
    // }

  }

  .wldc-page-title {
    font-size: 1.6rem;
  }

  .wldc-revinfo-h3 {
    font-size: 1.2rem;
  }

  .wldc-rev-panel-diff-container .diff-card {
    max-height: unset !important;
  }

</style>

