<template>
  <Main :list="list" :getInfo="getInfo" :delData="del" :permiDefault="permiDefault" coopType="partner"></Main>
</template>

<script>
import { listExternal,getInfoById,delExternal} from "@/api/coop/external"
import Main from '../common/main.vue'
export default {
name:'External',
data(){
  return{
    list:listExternal,
    getInfo:getInfoById,
    del:delExternal,
    permiDefault:{
      add: "coop:external:add",
      delete: "coop:external:remove",
      detail: "coop:external:info",
      update: "coop:external:edit",
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