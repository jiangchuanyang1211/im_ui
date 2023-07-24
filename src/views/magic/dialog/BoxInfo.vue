<template>
   <!-- 魔盒详细 -->
   <el-dialog title="魔盒详情" :visible.sync="openInfo" width="700px" :before-close="closeInfo">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-descriptions title="基础信息" :column="2">
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="SN">{{ boxInfo.snCode }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="Mac">{{ boxInfo.macAddress }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="颜色">{{ boxInfo.color }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="容量">{{ sizeToStr(boxInfo.size) }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="出厂固件版本">{{ boxInfo.version }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="批次号">{{ boxInfo.batch }}</el-descriptions-item>
              <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="导入日期">{{ parseTime(boxInfo.importTime) }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="绑定信息" :column="2">
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="真实姓名">{{ boxInfo.binderName }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="绑定手机号">{{ boxInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="性别" v-if="boxInfo.sex==1">男</el-descriptions-item>
              <el-descriptions-item v-else-if="boxInfo.sex==2" label-class-name="device-label" content-class-name="device-content"
              label="性别">女</el-descriptions-item>
              <el-descriptions-item v-else label-class-name="device-label" content-class-name="device-content"
              label="性别">未知</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="绑定日期">{{ parseTime(boxInfo.bindTime) }}</el-descriptions-item>
            <!-- <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="出厂固件版本">{{ boxInfo.supportVersion }}</el-descriptions-item> -->
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
              label="设备状态">{{getStatus(boxInfo.status)}}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="8">
          <div class="grid-content bg-purple">

            <!-- <el-image
            
            :src="path"
            :fit="fit"></el-image> -->
            <img src="../../../assets/images/magic.png" alt="logo">
            <p class="demonstration">{{ boxInfo.sn }}</p>
          </div>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeInfo">关 闭</el-button>
      </div>
    </el-dialog>
</template>

<script>
export default {
    name:'BoxInfo',
    props:{
        openInfo:{
            type:Boolean,
            default:false
        },
        boxInfo:{
            type: Object,
            required: true
        }
    },
    data:function(){
        return {
            status:[
                {key:1,"text":"正常"},
                {key:2,"text":"已锁定"},
                {key:3,"text":"已冻结"},
            ],
        }
    },
    methods:{
        getStatus(status){
            let count = parseInt(status)-1
            return this.status[count]?.text
        },
        closeInfo(){
            this.$emit('closeInfo')
        }
    },
    mounted(){
    }
}
</script>

<style>

</style>