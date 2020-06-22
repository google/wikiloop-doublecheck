<template>
  <section>
    <b-form-select class="mt-4"
                   @click.native.stop=''
                   v-model="breakdownBy"
                   v-on:change="createSvg()">
      <option :value="null">None</option>
      <option :value="`judgement`">Judgement</option>
      <option :value="`feed`">Feed</option>
    </b-form-select>

    <b-form-select class="mt-4"
                   @click.native.stop=''
                   v-model="granularity"
                   v-on:change="createSvg()">
      <option :value="`month`">Month</option>
      <option :value="`week`">Week</option>
      <option :value="`day`">Day</option>
    </b-form-select>
    <canvas id="myChart" class="w-100" style="height:400px"></canvas>
  </section>
</template>
<script lang="ts">
    import {Component, Vue} from 'nuxt-property-decorator';
    import Chart from 'chart.js';

    @Component({
      data() {
        return {
          breakdownBy: null,
          granularity: "month",
        }
      }
    })
    export default class TimeSeriesBarChart extends Vue {
        chart:any = null;
        breakdownBy:any = 'feed';
        granularity:any = "month";
        async mounted() {
          if (this.$route.query.breakdownBy) this.breakdownBy = this.$route.query.breakdownBy;
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

        createSvg = async function () {

          let theme = this.computeColor();
          let url = '/api/stats/timeseries/labels?';
          if (this.granularity) url += `granularity=${this.granularity}`;
          if (this.breakdownBy) url += `&breakdownBy=${this.breakdownBy}`;

          if (this.$route.query.wikiUserName) {
            url += `&wikiUserName=${this.$route.query.wikiUserName}`;
          }
          if (this.$route.query.wiki) {
            url += `&wiki=${this.$route.query.wiki}`;
          }
          let stats = await this.$axios.$get(url);

          let breakdownDateCountMap = new Map<String, Map<String, Number>>();
          let datesMap = {};
          let breakdownMap = {};
          stats.forEach(d => {
            datesMap[d._id.date] = 1;
            let breakdownKey = null;
            Object.keys(d._id).map(k => {
              if(k !== 'date') {
                breakdownKey = d._id[k];
                if (breakdownKey == null) breakdownKey = '(other)'
                breakdownMap[breakdownKey] = 1;
              }
            });

            let date = d._id.date;
            if (breakdownKey) {
              if (!breakdownDateCountMap[breakdownKey]) breakdownDateCountMap[breakdownKey] = {};
              // noinspection JSUnusedAssignment
              breakdownDateCountMap[breakdownKey][date] = d.count;
            } else {
              if (!breakdownDateCountMap['All']) breakdownDateCountMap['All'] = {};
              breakdownDateCountMap['All'][date] = d.count;
            }
          });

          Object.keys(breakdownMap).forEach(breakDownKey => {
            Object.keys(datesMap).sort().forEach(date => {
              if (!breakdownDateCountMap[breakDownKey][date]) breakdownDateCountMap[breakDownKey][date] = 0;
            });
          });
          let colorMap = {
            LooksGood: theme.success,
            NotSure: theme.secondary,
            ShouldRevert: theme.danger,
            All: theme.primary
          };
          const randomColor = function() {return Math.floor(Math.random()*16777215).toString(16)};

          var barChartData = {
            labels: Object.keys(datesMap).sort(),
            datasets: Object.keys(breakdownDateCountMap).sort().reverse().map(breakdownKey => {
              return {
                label: breakdownKey,
                backgroundColor: colorMap[breakdownKey] || `#${randomColor()}`,
                data: Object
                  .keys(breakdownDateCountMap[breakdownKey])
                  .sort()
                  .map(date => breakdownDateCountMap[breakdownKey][date])
              }
            })
          };
          let elm = document.getElementById('myChart') as HTMLCanvasElement;
          var ctx = elm.getContext('2d');
          if (this.chart != null) this.chart.destroy();
          this.chart = new Chart(ctx, {
            type: 'line',
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
              },
              animation: {
                duration: 2000
              }
            }
          });
        }
    }
</script>
<style>

</style>
