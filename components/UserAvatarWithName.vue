<template>
  <div class="d-flex">
    <user-avatar
      class="avatar-container mr-2 d-flex align-items-center"
      :wiki-user-name="wikiUserName"
      :user-ga-id="userGaId"
    />
    <div class="d-flex align-items-center">
      <a
        href="/#"
        class="avatar-txt p-0"
      >{{
         wikiUserName || `${$t('Label-Anonymous')} (${getHash(userGaId)})`
       }}
        <i
          :class="[
            'fas p-0',
            {
              'fa-shield-alt text-primary': userTier === 4,
              'fa-check-double text-success': userTier === 3,
              'fa-check text-success': userTier === 2
            }
          ]"
        /></a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserAvatar from '~/components/UserAvatar.vue';
import { UserTier, getHash } from '~/shared/utility-shared';

@Component({
  components: {
    UserAvatar,
  },
})
export default class UserAvatarWithName extends Vue {
  @Prop({ type: String, required: false }) readonly wikiUserName!: string
  @Prop({ type: String, required: false }) readonly userGaId!: string
  @Prop() readonly userTier!: UserTier
  getHash = getHash
}
</script>
<style scoped>
.avatar-container {
  width: 1.5rem;
  height: 1.5rem;
}
.avatar-txt {
  font-size: 0.8rem;
  line-height: 1;
}
</style>
