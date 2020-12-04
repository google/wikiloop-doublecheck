<template>
    <div>
        <div class="looks-good btn btn-outline-success">Loods Good</div>
        <div class="not-sure btn btn-outline-secondary">Not Sure</div>
        <div class="should-revert btn btn-outline-danger">Should Revert</div>     
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'nuxt-property-decorator'

    @Component({
      components: {
      }
    })
    export default class PureActionPanel2 extends Vue { 

    }
</script>

<style lang="scss" scoped>

</style>
