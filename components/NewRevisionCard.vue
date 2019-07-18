<template>
  <section>
    <div v-bind:class="{
        'border-danger': ores ? ores.badfaith : false,
        'border-warning': ores ? ores.damaging : false,
        'bg-light': revision ? revision.pageLatestRevId > revision.revid : false
        }"
         class="card shadow-sm h-100">
      <div v-if="revision" class="card-body d-flex flex-column small-screen-padding">
        <h5 class="card-title ">
          <div class="d-flex">
            <div class="flex-grow-1">
              [[<a :href="`${getUrlBaseByWiki(revision.wiki)}/wiki/${revision.title}`">{{ revision.title }}</a>]]
              <sup><a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/Special:Diff/${revision.revid}`">
                <small>rev.{{revision.revid}}</small>
              </a></sup>
            </div>
            <div v-if="revision ? revision.pageLatestRevId > revision.revid: false"> Overriden</div>
          </div>
        </h5>
        <div class="card-subtitle mb-2 text-muted">
          <div class="row p-2">
            <div class="col-lg-3">
              <i class="fas fa-clock"></i>
              <timeago :datetime="getTimeString()" :auto-update="60"></timeago>
            </div>
            <div class="col-lg-3">
              <small><span>by <a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/User:${revision.user}`">{{ revision.user }}</a></span>
              </small>
            </div>
            <div v-if="ores" class="col-lg-3">
              <span data-toggle="tooltip" data-placement="top" title="Damaging Score by WMF ORES">
                <i v-bind:class="{ 'text-danger': ores ? ores.badfaith : false }" class="fas fa-theater-masks"></i>: <a
                  :href="`https://ores.wmflabs.org/v3/scores/enwiki/?revids=${revision.revid}`">{{ damagingPercent() }}</a>
              </span>
            </div>
            <div v-if="ores" class="col-lg-3">
              <span data-toggle="tooltip" data-placement="top"
                    title="Bad-faith Score by WMF ORES (here Bad-faith = 100% - Goodfaith)">
                <i v-bind:class="{ 'text-warning': ores ? ores.damaging: false }" class="fas fa-cloud-rain"></i>:  <a
                  :href="`https://ores.wmflabs.org/v3/scores/enwiki/?revids=${revision.revid}`">{{ badfaithPercent() }}</a>
              </span>
            </div>
          </div>
        </div>
        <div v-if="revision" class="card-subtitle mb-2 text-muted">
          <div class="row p-2">
            <div class="col-12"><b>Edit summary:</b>
              <span>{{revision.comment || "(empty)}"}}</span>
            </div>
          </div>
        </div>
        <div class="card-text w-100 pl-sm-0">
          <diff-box v-if="diff && diff.compare && diff.compare['*']" v-bind:diffContent="diff.compare['*']"/>
          <h5 v-else>Diff not available. You can load it
            <div v-on:click="loadDiff()" class="btn btn-outline-primary btn-small">here</div>
            , and sometimes it's caused by revision deleted or page deleted. See it directly on <a
                :href="`${getUrlBaseByWiki(revision.wiki)}/w/index.php?title=${revision.title}&diff=${revision.revid}&oldid=prev&diffmode=source`">the
              site</a>.
          </h5>
        </div>
        <div class="mt-4 d-flex justify-content-center">
          <div v-if="interaction" class="btn-group">
            <button
                v-on:click="interactionBtn(`LooksGood`)"
                class="btn btn-sm"
                v-bind:class="{ 'btn-success':getJudgementCount(`LooksGood`) > 0, 'btn-outline-success': getJudgementCount(`LooksGood`) === 0 }"
            >Looks good {{getJudgementCount(`LooksGood`)}}
            </button>
            <button
                v-on:click="interactionBtn(`NotSure`)"
                v-bind:class="{ 'btn-secondary':getJudgementCount(`NotSure`) > 0, 'btn-outline-secondary':getJudgementCount(`NotSure`) === 0 }"
                class="btn btn-sm"
            >Not sure {{getJudgementCount(`NotSure`)}}
            </button>
            <button
                v-on:click="interactionBtn(`ShouldRevert`)"
                v-bind:class="{ 'btn-danger':getJudgementCount(`ShouldRevert`) > 0, 'btn-outline-danger':getJudgementCount(`ShouldRevert`) === 0 }"
                class="btn btn-sm" target="_blank"
            >Should revert {{getJudgementCount(`ShouldRevert`)}}
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        loading...
        <div><h1>WikiRevId:</h1>{{wikiRevId}}</div>
        <div><h2>Interaction:</h2>{{interaction}}</div>
        <div><h3>Revision:</h3>{{revision}}</div>
        <div><h3>Ores:</h3>{{ores}}</div>
        <div><h3>Diff:</h3>{{diff}}</div>
      </div>
    </div>
  </section>

</template>
<script>
  import utility from '~/shared/utility';
  import DiffBox from '~/components/DiffBox.vue';

  export default {
    components: {
      DiffBox
    },
    props: {
      wikiRevId: String,
    },
    data() {
      return {
        ores: null,
        diff: null,
        interaction: null,
        revision: null,
        myJudgement: null
      }
    },
    methods: {
      loadDiff: async function () {
        this.diff = await this.fetchDiffWithWikiRevId(this.wikiRevId);
      },
      getTimeString: function () {
        return new Date(this.revision.timestamp).toString();
      },
      getJudgementCount: function (judge) {
        return this.interaction.counts[judge];
      },
      isOverriden: function () {
        return this.revision.pageLatestRevId > this.revision.revid;
      },
      interactionBtn: async function (judgement) {
        let revision = this.revision;
        let gaId = this.$cookies.get("_ga");
        console.log(`gaId`, gaId);
        this.myJudgement = judgement;
        let postBody = {
          gaId: gaId,
          judgement: this.myJudgement,
          timestamp: Math.floor(new Date().getTime() / 1000),
          wikiRevId: revision.wikiRevId,
          newRecentChange: {
            title: revision.title,
            namespace: revision.namespace,
            revision: {
              new: revision.revid,
              old: revision.parentid,
            },
            ores: this.ores,
            user: revision.user,
            wiki: revision.wiki,
            timestamp: revision.timestamp
          }
        };
        console.log(`postBody`, postBody);
        if (judgement === `ShouldRevert` && !this.isOverriden()) {
          const version = await this.$axios.$get(`/api/version`);
          let url = `${this.getUrlBaseByWiki(this.revision.wiki)}/w/index.php?title=${this.revision.title}&action=edit&undoafter=${this.revision.parentid}&undo=${this.revision.revid}&summary=Identified as test/vandalism using [[:m:WikiLoop Battlefield]](version ${version}) at battlefield.wikiloop.org.`;
          window.open(url, '_blank');
        }
        let ret = await $.post(`/api/interaction`, postBody);

        this.$bvToast.toast(
            `Your judgement for ${this.revision.title} at revision ${this.revision.revid} is logged.`, {
              title: 'Congrats!',
              autoHideDelay: 3000,
              appendToast: true
            });
        console.log(`interaction ret:`, ret);
      },
      damagingPercent: function () {
        return `${this.ores ? Math.floor(parseFloat(this.ores.damagingScore) * 100) : "??"}%`;
      },
      badfaithPercent: function () {
        return `${this.ores ? Math.floor(parseFloat(this.ores.badfaithScore) * 100) : "??"}%`;
      },
    },
    async mounted() {
      if (!this.interaction) {
        this.interaction = await this.$axios.$get(`/api/interaction/${this.wikiRevId}`);
      }
      if (!this.revision) {
        this.revision = await this.$axios.$get(`/api/revision/${this.wikiRevId}`);
      }
      if (!this.diff) {
        this.diff = await this.$axios.$get(`/api/diff/${this.wikiRevId}`);
      }
      if (!this.ores) {
        this.ores = await this.$axios.$get(`/api/ores/${this.wikiRevId}`);
        console.log(`mount fetched ores = `, this.ores);
      }
      // console.log(`mount fetched revision = `, this.revision);
    },
    beforeCreate() {
      this.getUrlBaseByWiki = utility.getUrlBaseByWiki.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
      this.fetchDiffWithWikiRevId = utility.fetchDiffWithWikiRevId.bind(this); // now you can call this.getUrlBase() (in your functions/template)
    },
  }

</script>
<style>

</style>
