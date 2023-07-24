<template>
  <ODept :permiList="permiDefault"></ODept>
</template>

<script>
import ODept from '../../struct/dept/index.vue'
export default {
  data(){
    return {
      permiDefault:{
        addDept:'coop:dept:add',
        removeDept:'coop:dept:remove',
        queryDept:'coop:dept:query',
        editDept:'coop:dept:edit',
        addOrg:'coop:org:add',
        removeOrg:'coop:org:remove',
        queryOrg:'coop:org:query',
        editOrg:'coop:org:edit',
      }
    }
  },
  components:{
    ODept
  }
}
</script>

<style>

</style>