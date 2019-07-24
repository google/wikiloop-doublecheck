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
            <div class="col-lg-2">
              <i class="fas fa-pen"></i> edited
              <timeago :datetime="getTimeString()" :auto-update="60"></timeago>
            </div>
            <div v-if="interaction && interaction.lastTimestamp" class="col-lg-2">
              <i class="fas fa-flag"></i> marked
              <timeago :datetime="new Date(interaction.lastTimestamp * 1000).toString()" :auto-update="60"></timeago>
            </div>
            <div class="col-lg-2">
              <small><span>by <a v-bind:href="`${getUrlBaseByWiki(revision.wiki)}/wiki/User:${revision.user}`">{{ revision.user }}</a></span>
              </small>
            </div>
            <div v-if="ores" class="col-lg-2">
              <span data-toggle="tooltip" data-placement="top" title="Damaging Score by WMF ORES">
                <i v-bind:class="{ 'text-danger': ores ? ores.badfaith : false }" class="fas fa-theater-masks"></i>: <a
                  :href="`https://ores.wmflabs.org/v3/scores/enwiki/?revids=${revision.revid}`">{{ damagingPercent() }}</a>
              </span>
            </div>
            <div v-if="ores" class="col-lg-2">
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
                v-bind:class="{ 'btn-success':getMyJudgement() ===`LooksGood`, 'btn-outline-success': getMyJudgement() !==`LooksGood` }"
            >Looks good {{getJudgementCount(`LooksGood`)}}
            </button>
            <button
                v-on:click="interactionBtn(`NotSure`)"
                v-bind:class="{ 'btn-secondary':getMyJudgement() ===`NotSure`, 'btn-outline-secondary':getMyJudgement() !==`NotSure` }"
                class="btn btn-sm"
            >Not sure
            <template v-if="!interaction"><span class="sr-only"></span></template>
            <template v-else>{{getJudgementCount(`NotSure`)}}</template>

            </button>
            <button
                v-on:click="interactionBtn(`ShouldRevert`)"
                v-bind:class="{ 'btn-danger':getMyJudgement() ===`ShouldRevert`, 'btn-outline-danger':getMyJudgement() !== `ShouldRevert` }"
                class="btn btn-sm" target="_blank"
            >Should revert {{getJudgementCount(`ShouldRevert`)}}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="card-body d-flex flex-column small-screen-padding">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </section>

</template>
<script>
  import utility from '~/shared/utility';
  import DiffBox from '~/components/DiffBox.vue';
  import socket from '~/plugins/socket.io.js';

  export default {
    components: {
      DiffBox
    },
    props: {
      wikiRevId: {
        type: String,
        required: true
      },
      oresProp: {
        type: Object,
        default: null
      },
      revisionProp: {
        type: Object,
        default: null
      },
      interactionProp: {
        type: Object,
        default: null
      },
    },
    data() {
      return {
        ores: null,
        diff: null,
        interaction: null,
        revision: null,
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
      getMyJudgement: function() {
        if (this.interaction) {
          let myGaId = this.$cookies.get("_ga");
          let result = this.interaction.judgements.filter(j => j.userGaId === myGaId);
          if (result.length === 1) {
            return result[0].judgement;
          } else return null;
        } else {
          return null;
        }
      },
      interactionBtn: async function (myJudgement) {
        let revision = this.revision;
        let gaId = this.$cookies.get("_ga");
        let postBody = {
          gaId: gaId, // Deprecated
          userGaId: gaId,
          judgement: myJudgement,
          timestamp: Math.floor(new Date().getTime() / 1000), // timestamp for interaction
          wikiRevId: revision.wikiRevId,
          recentChange: {
            title: revision.title,
            namespace: revision.namespace,
            revision: {
              new: revision.revid,
              old: revision.parentid,
            },
            ores: this.ores,
            user: revision.user,
            wiki: revision.wiki,
            timestamp: new Date(revision.timestamp).getTime()/1000
          }
        };

        if (myJudgement === `ShouldRevert` && !this.isOverriden()) {
          const version = await this.$axios.$get(`/api/version`);
          let url = `${this.getUrlBaseByWiki(this.revision.wiki)}/w/index.php?title=${this.revision.title}&action=edit&undoafter=${this.revision.parentid}&undo=${this.revision.revid}&summary=Identified as test/vandalism using [[:m:WikiLoop Battlefield]](version ${version}) at battlefield.wikiloop.org.`;
          window.open(url, '_blank');
        }
        await this.$axios.$post(`/api/interaction/${this.wikiRevId}`, postBody);
        this.$bvToast.toast(
            `Your judgement for ${this.revision.title} at revision ${this.revision.revid} is logged.`, {
              title: 'Congrats!',
              autoHideDelay: 3000,
              appendToast: true
            });
        document.dispatchEvent(new Event("stats-update"));
      },
      damagingPercent: function () {
        return `${this.ores ? Math.floor(parseFloat(this.ores.damagingScore) * 100) : "??"}%`;
      },
      badfaithPercent: function () {
        return `${this.ores ? Math.floor(parseFloat(this.ores.badfaithScore) * 100) : "??"}%`;
      },
    },
    async beforeMount() {
      console.log(`Mounted NewRevisionCard wikiRevId=${this.wikiRevId}, Set props: interactionProp:${this.interactionProp!=null}, revisionProp:${this.revisionProp!=null}, oresProp:${this.oresProp!=null}`);
      this.interaction = this.interactionProp || await this.$axios.$get(`/api/interaction/${this.wikiRevId}`);
      this.revision = this.revisionProp || await this.$axios.$get(`/api/revision/${this.wikiRevId}`);
      this.ores = this.oresProp || await this.$axios.$get(`/api/ores/${this.wikiRevId}`);

      if (!this.diff) {
        this.diff = await this.$axios.$get(`/api/diff/${this.wikiRevId}`);
      }

      socket.on('recent-change', async (newRecentChange) => {
        // TODO(xinbenlv@, #40): if performance becomes a concern, revisit this approach.
        if(newRecentChange.wiki === this.revision.wiki && newRecentChange.title === this.revision.title) {
          this.revision.pageLatestRevId = Math.max(newRecentChange.revision.new, this.revision.revid);
        }
      });
      socket.on('interaction', async (interaction) => {
        if(interaction.wikiRevId === this.wikiRevId) {
          this.interaction = interaction;
        }
      });
    },
    beforeCreate() {
      this.getUrlBaseByWiki = utility.getUrlBaseByWiki.bind(this); // now you can call this.getUrlBaseByWiki() (in your functions/template)
      this.fetchDiffWithWikiRevId = utility.fetchDiffWithWikiRevId.bind(this); // now you can call this.getUrlBase() (in your functions/template)
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

  #metainfo {
    font-size:12px;
  }
</style>

