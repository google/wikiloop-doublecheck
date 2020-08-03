<template>
  <div class="d-flex">
    <user-avatar class="avatar-container mr-2" :wikiUserName="wikiUserName" :userGaId="userGaId"></user-avatar>
    <div>
      <a href="/#" class="avatar-txt p-0">{{wikiUserName || $t("Label-Anonymous") }}
      <i :class="['fas p-0',
        {
          'fa-shield-alt text-primary': userTier === 4,
          'fa-check-double text-success': userTier === 3,
          'fa-check text-success': userTier === 2,
        }
       ]" /></a>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue} from 'vue-property-decorator'
  import UserAvatar from "~/components/UserAvatar.vue";
  import {UserTier} from "~/shared/utility-shared";

  @Component({
    components: {
      UserAvatar
    }
  })
  export default class UserAvatarWithName extends Vue {
    @Prop({ type: String, required: false }) readonly wikiUserName!: string;
    @Prop({ type: String, required: false }) readonly userGaId!: string;
    @Prop() readonly userTier!: UserTier;
  }
</script>
<style scoped>
  .avatar-container {
    width: 32px;
    height: 32px;
  }
  .avatar-txt {
    font-size: 16px;
    line-height: 32px;
  }
</style>
