<template>
  <div>
      <table v-html="diffContent"></table>
  </div>
</template>

<style>
  @import 'https://www.mediawiki.org/w/load.php?modules=mediawiki.legacy.shared|mediawiki.diff.styles&only=styles';
</style>
<script>
export default {
  props: [ 'diffContent' ]
}
</script>
