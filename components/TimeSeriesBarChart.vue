<template>
  <section>
    <canvas id="myChart" class="w-100" style="height:400px"></canvas>
  </section>
</template>
<script lang="ts">
    import {Component, Vue} from 'nuxt-property-decorator';
    import Chart from 'chart.js';

    @Component
    export default class TimeSeriesBarChart extends Vue {
        chart:any;

        async mounted() {
            await this.createSvg();
        }

        private createSvg = async function () {
          let stats = await this.$axios.$get('/api/stats/timeseries/labels?byMonth=1');
          let data = []
          let labels = []
          stats.forEach(d => {
            labels.push(d._id.date);
            data.push(d.count);
          });

          var barChartData = {
            labels: labels,
            datasets: [{
              label: 'Revisions',
              backgroundColor: "#FF0000",
              data: data
            }]
          };
          let elm = document.getElementById('myChart') as HTMLCanvasElement;
          var ctx = elm.getContext('2d');
          this.chart = new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
              title: {
                display: true,
                text: 'Chart.js Bar Chart - Stacked'
              },
              tooltips: {
                mode: 'index',
                intersect: false
              },
              responsive: true,
              scales: {
                xAxes: [{
                  stacked: true,
                }],
                yAxes: [{
                  stacked: true
                }]
              }
            }
          });
        }
    }
</script>
<style>

</style>
