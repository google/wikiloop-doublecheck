<template>
  <div style="max-height: 300px;overflow-y: scroll;">
    <table class="pl-sm-0 w-100 diff-content" v-html="diffContent"></table>
  </div>
</template>

<script>
  export default {
    props: ["diffContent"]
  }
</script>

<style>
  .diff-content {
    font-size: 12px;
  }
</style>
