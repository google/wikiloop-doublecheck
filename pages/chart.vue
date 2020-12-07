<template>
  <section>
    <TimeSeriesBarChart />
  </section>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import TimeSeriesBarChart from '@/components/TimeSeriesBarChart.vue';

  @Component({
    components: {
      TimeSeriesBarChart,
    },
  })
export default class Chart extends Vue {

}
</script>
<style scoped>

</style>
