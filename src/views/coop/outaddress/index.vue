<template>
  <OAddress :permiDefault="permiDefault"></OAddress>
</template>

<script>
import OAddress from '../../struct/address/index.vue'
export default {
  data(){
    return {
      permiDefault:{
        add:'coop:address:add',
        delete:'coop:address:remove',
        detail:'coop:address:detail',
        update:'coop:address:edit',
        download:'coop:address:download',
        bind:'coop:address:bind',
        unbind:'coop:address:unbind',
        import:'coop:address:import',
        export:'coop:address:exportTemplate',
      }
    }
  },
  components:{
    OAddress
  }
}
</script>

<style>

</style>