<template>
  <div>
    <img v-if="wikiUserName"
         class="avatar"
         :src="`https://avatars.dicebear.com/api/initials/${wikiUserName}.svg`"
         :alt="`WikiUser:${wikiUserName}`"/>
    <img v-else
         class="avatar"
         :src="`https://avatars.dicebear.com/api/identicon/${userGaId}.svg`"
         :alt="`AnonUser:${userGaId}`"/>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue} from 'vue-property-decorator'

  @Component
  export default class UserAvatar extends Vue {
    @Prop({ type: String, required: false }) readonly wikiUserName!: string;
    @Prop({ type: String, required: false }) readonly userGaId!: string;
  }
</script>
<style scoped>
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
