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
      <tbody v-html="diffContent" >
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    props: ["diffContent"]
  }
</script>

<style>
  @media screen and (min-width: 601px) {
    .diff-content {
    }
    .diff-card {
      font-size: 12px;
      max-height: 600px;
      min-height: 400px;
      overflow: auto;
    }
  }

  /* If the screen size is 600px wide or less, set the font-size of <div> to 30px */
  @media screen and (max-width: 600px) {
    .diff-content {
    }
    .diff-card {
      font-size: 8px;
      max-height: 400px;
      min-height: 200px;
      overflow: auto;
    }
  }
</style>
