<template>
  <section>
    <canvas id="myChart" class="w-100" style="height:400px"></canvas>
  </section>
</template>
<script lang="ts">
    import {Component, Vue} from 'nuxt-property-decorator';
    import Chart from 'chart.js';
    import {BasicJudgement} from "~/shared/interfaces";

    @Component
    export default class TimeSeriesBarChart extends Vue {
        chart:any;

        async mounted() {
            await this.createSvg();
        }

        computeColor() {
          var style = getComputedStyle(document.body);
          var theme:any = {};

          theme.primary = style.getPropertyValue('--primary');
          theme.secondary = style.getPropertyValue('--secondary');
          theme.success = style.getPropertyValue('--success');
          theme.info = style.getPropertyValue('--info');
          theme.warning = style.getPropertyValue('--warning');
          theme.danger = style.getPropertyValue('--danger');
          theme.light = style.getPropertyValue('--light');
          theme.dark = style.getPropertyValue('--dark');
          return theme;
        }

        private createSvg = async function () {
          let theme = this.computeColor();
          let stats = await this.$axios.$get('/api/stats/timeseries/labels?byMonth=1&byJudgement=1');
          let judgementDateCountMap = new Map<BasicJudgement, Map<String, Number>>();
          Object.keys(BasicJudgement).forEach(j => judgementDateCountMap[j] = {});
          let datesMap = {};
          stats.forEach(d => {
            datesMap[d._id.date] = 1;
            let date = d._id.date;
            let judgement = d._id.judgement;
            judgementDateCountMap[judgement][date] = d.count;
          });

          Object.keys(datesMap).sort().forEach(date => {
            Object.keys(BasicJudgement).forEach(judgement => {
              if (!judgementDateCountMap[judgement][date]) judgementDateCountMap[judgement][date] = 0;
            });
          });

          let colorMap = {
            LooksGood: theme.success,
            NotSure: theme.secondary,
            ShouldRevert: theme.danger,
          };

          var barChartData = {
            labels: Object.keys(datesMap).sort(),
            datasets: Object.keys(judgementDateCountMap).map(judgement => {
              return {
                label: judgement,
                backgroundColor: colorMap[judgement],
                data: Object.values(judgementDateCountMap[judgement])
              }
            })
          };
          let elm = document.getElementById('myChart') as HTMLCanvasElement;
          var ctx = elm.getContext('2d');
          this.chart = new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
              title: {
                display: true,
                text: 'Number of Revisions Overtime'
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
