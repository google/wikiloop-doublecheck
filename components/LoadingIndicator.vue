<template>
  <div class="d-flex align-items-center justify-content-center">
    <div class="spinner-grow text-primary" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div class="spinner-grow text-success" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div class="spinner-grow text-danger" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div class="spinner-grow text-warning" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div class="spinner-grow text-info" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
@Component
export default class LoadingIndicator extends Vue {}
</script>
<style scoped>

</style>
