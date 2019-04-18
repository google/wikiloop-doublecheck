<template>
  <div>
      <table class="w-100" v-html="diffContent"></table>
  </div>
</template>

<script>
export default {
  props: [ "diffContent" ]
}
</script>
