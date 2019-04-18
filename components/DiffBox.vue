<template>
  <div style="max-height: 200px;overflow-y: scroll;">
      <table class="w-100" v-html="diffContent"></table>
  </div>
</template>

<script>
export default {
  props: [ "diffContent" ]
}
</script>
