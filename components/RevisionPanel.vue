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
  <section>
    <div class="card-body d-flex flex-column small-screen-padding">
      <h5 class="card-title ">
        <div class="d-flex">
          <div class="flex-grow-1">
            [[<a :href="wikiPageUrl" target="_blank">{{ item.title }}</a>]]
            <sup><a v-bind:href="diffUrl" target="_blank">
              <small>rev.{{item.revId}} <!-- no translation, specific term --></small>
            </a></sup>
          </div>
          <div class="ml-2"><a :href="permUrl"><i class="fas fa-link"></i></a></div>
        </div>
        <div v-if="feedName"><small><span class="badge badge-success">{{feedName}} feed<!-- no translation, specific term --></span></small></div>
      </h5>
      <div class="card-subtitle mb-2 text-muted">
        <div class="row">
          <div class="col-sm">
            <span class="nobreak"><b>{{$t('Label-EditedAt')}}:</b> <timeago :datetime="timeString" :auto-update="60" :locale="$i18n.locale"></timeago></span>
          </div>
          <div class="col-sm">
            <span class="nobreak"><b>{{$t('Label-Author')}}:</b> <a v-bind:href="authorUrl" target="_blank">{{ item.author }}</a></span>
          </div>
        </div>
      </div>

      <div class="card-text w-100 pl-sm-0 mb-3">
        <template  v-if="item.diffHtml">
          <h5 class="w-100">{{$t('Label-DiffView')}}</h5>
          <diff-box v-bind:diffContent="item.diffHtml"/>
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
          <h5 class="w-100">{{$t('Label-EditSummary')}}</h5>
          <span>{{item.summary}}</span>
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

<style>
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
</style>

