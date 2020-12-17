<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div ref="svgWrapper" class="avatar-img" v-html="svgSrc" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import Avatars from '@dicebear/avatars';
import gridySprites from '@dicebear/avatars-gridy-sprites';
import initialsSprites from '@dicebear/avatars-initials-sprites';

    @Component({})
export default class PureUserAvatar2 extends Vue {
        @Prop({ type: String }) userName: string;
        @Prop({ type: String }) userGaId: string;

        get svgSrc() {
          let avatars;
          if (this.userName) {
            avatars = new Avatars(initialsSprites);
            return avatars.create(this.userName);
          } else {
            avatars = new Avatars(gridySprites, { background: 'lightgrey' });
            return avatars.create(this.userGaId);
          }
        }

        mounted() {
          const scopeId = (this.$options as any)._scopeId; // returns something like 'data-v-763db97b'
          this.$el.querySelector('.avatar-img svg').setAttribute(scopeId, '');
        }
}
</script>

<style lang="scss" scoped>
    .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        & > * {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: block;
        }
    }
</style>
