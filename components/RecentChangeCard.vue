<template>
  <div v-bind:class="{
        'border-danger': item.ores.badfaith,
        'border-warning': item.ores.damaging,
        'bg-light': item.overriden
        }"
       class="card shadow-sm h-100">
    <div class="card-body d-flex flex-column small-screen-padding">
      <h5 class="card-title ">
        <div class="d-flex">
          <div class="flex-grow-1">
            <a v-bind:href="`${getUrlBase(item)}/wiki/Special:Diff/${item.revision.new}`">{{ item.title }}</a>
          </div>
          <div v-if="item.overriden"> Overriden</div>
        </div>

      </h5>

      <h6>
        <small><i class="fas fa-clock"></i>
          <timeago :datetime="getTimeString(dbId)" :auto-update="60"></timeago>
        </small>
      </h6>
      <h6 class="card-subtitle mb-2 text-muted">
        <small class="row">
          <div class="col-sm-12 col-6">by <a
              v-bind:href="`${getUrlBase(item)}/wiki/User:${item.user}`">{{ item.user }}</a></div>
          <div class="col-sm-12 col-6">
                  <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                    <i v-bind:class="{ 'text-danger': item.ores.badfaith }" class="fas fa-theater-masks"></i>: {{ damagingPercent() }},
                  </span>
            <span data-toggle="tooltip" data-placement="top" title="from WMF ORES score">
                    <i v-bind:class="{ 'text-warning': item.ores.damaging }" class="fas fa-cloud-rain"></i>: {{ badfaithPercent() }}
                  </span>
          </div>
        </small>

      </h6>
      <div class="card-text w-100 pl-sm-0" >
        <diff-box v-if="item.diff && item.diff.compare && item.diff.compare['*']" v-bind:diffContent="item.diff.compare['*']"/>
        <h5 v-else>Diff not available. Usually caused by revision deleted or page deleted. See it directly on <a :href="`${getUrlBase(item)}/w/index.php?title=${item.title}&diff=${item.id}&oldid=prev&diffmode=source`">the site</a>. </h5>
      </div>
      <div class="mt-4 d-flex justify-content-center">
        <div class="btn-group">
          <button
              v-on:click="interactionBtn(`LooksGood`)"
              class="btn btn-sm"
              v-bind:class="{ 'btn-success':item.judgement === 'LooksGood', 'btn-outline-success':item.judgement !== 'LooksGood' }"
          >Looks good {{getJudgementCount(`LooksGood`)}}
          </button>
          <button
              v-on:click="interactionBtn(`NotSure`)"
              v-bind:class="{ 'btn-secondary':item.judgement === 'NotSure', 'btn-outline-secondary':item.judgement !== 'NotSure' }"
              class="btn btn-sm"
          >Not sure {{getJudgementCount(`NotSure`)}}
          </button>
          <button
              v-on:click="interactionBtn(`ShouldRevert`)"
              v-bind:class="{ 'btn-danger':item.judgement === 'ShouldRevert', 'btn-outline-danger':item.judgement !== 'ShouldRevert' }"
              class="btn btn-sm" target="_blank"
          >Should revert {{getJudgementCount(`ShouldRevert`)}}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import DiffBox from '~/components/DiffBox.vue';
  import utility from '~/shared/utility';

  export default {
    components: {
      DiffBox
    },
    props: {
      dbId: String,
      item: Object,
    },
    methods: {
      getTimeString: function () {
        let newRecentChange = this.item;
        return new Date(newRecentChange.timestamp * 1000).toString();
      },
      getJudgementCount: function (judge) {
        let recentChange = this.item;
        if (recentChange.judgementCounts) {
          return recentChange.judgementCounts[judge] ? `(${recentChange.judgementCounts[judge]})` : ``;
        } else {
          return "";
        }
      },
      interactionBtn: async function (judgement) {
        let recentChange = this.item;
        let url = `${this.getUrlBase(recentChange)}/w/index.php?title=${recentChange.title}&action=edit&undoafter=${recentChange.revision.old}&undo=${recentChange.revision.new}&summary=Reverted%20with%20[[:m:WikiLoop Battlefield]](v${this.version}) at battlefield.wikiloop.org .`;
        let gaId = this.$cookies.get("_ga");
        console.log(`gaId`, gaId);
        let postBody = {
          gaId: gaId,
          judgement: judgement,
          timestamp: Math.floor(new Date().getTime() / 1000),
          newRecentChange: {
            _id: recentChange._id,
            title: recentChange.title,
            namespace: recentChange.namespace,
            id: recentChange.id,
            revision: recentChange.revision,
            ores: recentChange.ores,
            user: recentChange.user,
            wiki: recentChange.wiki,
            timestamp: recentChange.timestamp
          }
        };
        console.log(`postBody`, postBody);
        if (judgement === `ShouldRevert` && !this.item.overriden) window.open(url, '_blank');
        let ret = await $.post(`/api/interaction`, postBody);
        this.item.judgement = judgement;
        this.$bvToast.toast(
            `Your judgement for ${this.item.title} at revision ${this.item.id} is logged.`, {
              title: 'Congrats!',
              autoHideDelay: 3000,
              appendToast: true
            });
        console.log(`interaction ret:`, ret);
      },
      damagingPercent: function () {
        return `${Math.floor(this.item.ores.damagingScore * 100)}%`;
      },
      badfaithPercent: function () {
        return `${Math.floor(this.item.ores.badfaithScore * 100)}%`;
      },
    },
    beforeMount() {
      this.getUrlBase = utility.getUrlBase.bind(this); // now you can call this.getUrlBase() (in your functions/template)
    },
  }
</script>

<style>
  .diff-context {
    word-break: break-all;
    width: 50%;
  }

  .diff-deletedline, .diff-addedline {
    word-break: break-all;
    width: 50%
  }

  .blue-link {
    color: blue
  }
  .bg-darker-light {
    background-color: #F5F5F5;
  }
</style>
