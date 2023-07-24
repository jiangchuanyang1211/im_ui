<template>
    <Main :list="list" :getInfo="getInfo" :delData="del" :permiDefault="permiDefault" coopType="group"></Main>
</template>

<script>
import { listInternal,getInfoById,delInternal} from "@/api/coop/internal"
import Main from '../common/main.vue'

export default {
  name:'Internal',
  data(){
    return{
      list:listInternal,
      getInfo:getInfoById,
      del:delInternal,
      permiDefault:{
        add: "coop:internal:add",
        delete: "coop:internal:remove",
        detail: "coop:internal:info",
        update: "coop:internal:edit",
      }
    }
  },
  components:{
    Main
  }
}
</script>

<style>

</style>