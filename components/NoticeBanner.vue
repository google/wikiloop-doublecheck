<template>
  <div class="w-100">
    <div v-if="!loading && notice" class="card shadow">
      <div class="card-body">
        <!-- TODO add internationalization for message. -->
        <span>{{ notice.defaultMessage }}</span>
      </div>
      <div class="card-footer">
        <a
          target="_blank"
          class="btn btn-primary btn-sm float-right"
          :href="notice.url"
        ><i class="fas fa-chevron-right" /> {{ $t('Button-Go') }}</a>
        <button class="btn btn-secondary btn-sm float-right mr-2" @click="dismiss()">
          {{ $t('Button-Dismiss') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class NoticeBanner extends Vue {
  // Please conduct internationalization before sending into message.
  notice = null;

  loading: boolean = false;
  dismiss = async function() {
    await this.$axios.$post(`/api/notice/${this.notice.messageId}/ack`, {
      // TODO: centralize user profile management.
      wikiUserName: this.$store.state.user?.profile?.displayName || null,
      userGaId: this.$cookiez.get('_ga'),
    });
    this.notice = null;
  }

  load = async function() {
    this.loading = true;
    const searchParams = new URLSearchParams();
    if (this.$store.state.user?.profile?.displayName) {searchParams.set('wikiUserName', this.$store.state.user?.profile?.displayName);} else {searchParams.set('userGaId', this.$cookiez.get('_ga'));}
    const notices = await this.$axios.$get(`/api/notice/list?${searchParams.toString()}`);
    if (notices.length > 0) {
      this.notice = notices[0];
    }
    this.loading = false;
  }

  async mounted() {
    if (!this.notice) {await this.load();}
  }
}

</script>

<style scoped>

</style>
