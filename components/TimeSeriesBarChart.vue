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

        mounted() {
            this.createSvg();
        }

        private createSvg = function () {
          var barChartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
              label: 'Dataset 1',
              backgroundColor: "#FF0000",
              data: [
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
              ]
            }, {
              label: 'Dataset 2',
              backgroundColor: "#0000FF",
              data: [
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
              ]
            }, {
              label: 'Dataset 3',
              backgroundColor: "#00FF00",
              data: [
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
              ]
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
