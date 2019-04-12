<template>
  <div>
      <table v-html="diffContent"></table>
  </div>
</template>

<script>
export default {
  props: [ "diffContent" ]
}
</script>
