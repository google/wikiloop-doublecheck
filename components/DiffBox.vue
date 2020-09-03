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
  <div class="diff-card">
    <table class="pl-sm-0 w-100 diff-content" >
      <thead class="diff-header">
        <tr>
          <th colspan="2"><h5>{{ $t('Label-OriginalWikitext') }}</h5></th>
          <th colspan="2"><h5>{{ $t('Label-ChangedWikitext') }}</h5></th>
        </tr>
      </thead>
      <tbody v-html="processedDiffContent" >
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { wikiToDomain } from '@/shared/utility-shared';
export default {
  props: {
    diffContent: {
      type: String,
      default: ''
    },
    wikiRevId: {
      type: String,
      default: ''
    }
  },
  methods: {
    processDiffContent() {
      if ( !window.DOMParser ) {
        this.processedDiffContent = diffContent;
        return;
      }
      let diffContent = this.diffContent;
      // https://regex101.com/r/QwzU8z/3
      diffContent = diffContent.replaceAll( /\[\[([^\]|]*)(\|?.*)\]\]/gm, function( match, p1, p2 ) {
        let parsedText = ( new DOMParser() ).parseFromString( p1, "text/html" );
        let cleanedUpP1 = parsedText.querySelector( 'body' ).innerText;
        parsedText = undefined;
        let link = `http://${wikiToDomain[this.wikiRevId.split(':')[0]]}/wiki/${cleanedUpP1}`;
        return `[[<a href="${link}" target="_blank">${p1}</a>${p2}]]`;
      }.bind( this ) );

      this.processedDiffContent = diffContent;
    }
  },
  data() {
    return {
      processedDiffContent: {
        type: String,
        default: ''
      }
    }
  },
  beforeMount() {
    this.processDiffContent( this.diffContent );
  },
  beforeUpdate() {
    this.processDiffContent( this.diffContent );
  }
}
</script>

<style>
  @media screen and (min-width: 601px) {
    .diff-card {
      font-size: 12px;
      max-height: 400px;
      overflow-x: hidden;
    }
  }

  /* If the screen size is 600px wide or less, set the font-size of <div> to 30px */
  @media screen and (max-width: 600px) {
    .diff-card {
      font-size: 8px;
      max-height: 300px;
      overflow-x: hidden;
    }
  }

  .diff-header {
    position: sticky;
    top: 0;
    background: #ffffff;
  }
</style>
