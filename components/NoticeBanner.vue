<template>
  <div class="w-100">
    <div class="card shadow">
      <div class="card-body">
        <span>{{$t("Message-NameVoteAnnouncement")}}</span>
      </div>
      <div class="card-footer">
        <a target="_blank" class="btn btn-primary btn-sm float-right" :href="`https://meta.wikimedia.org/wiki/WikiProject_WikiLoop/New_name_vote`"><i class="fas fa-chevron-right"></i> {{$t('Button-Go')}}</a>
        <a target="_blank" class="btn btn-outline-primary btn-sm" :href="`https://github.com/google/wikiloop-battlefield/edit/master/i18n/locales/${$i18n.locale}.yml`"><i class="fas fa-chevron-right"></i> {{$t("Button-HelpTranslate")}}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue} from 'nuxt-property-decorator';

@Component
export default class NoticeBanner extends Vue {
  // Please conduct internationalization before sending into message.
  message: string;
  url: string;
}

</script>

<style scoped>

</style>
