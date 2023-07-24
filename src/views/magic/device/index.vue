<template>
  <div class="app-container">
    <!-- 搜索框 -->
    <base-search :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>
    <!-- 导入 -->
    <el-row class="mb8" type="flex" justify="space-between">
        <el-col :span="1.5">
          <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport"
              v-hasPermi="['magic:device:import']">导入</el-button>
          </el-col>
     
    </el-row>

    <ZfTable ref="myTable" :table-head-titles="column" :isSearch="isSearch" :url="url" :query-params="queryParams" :showSearch="showSearch">
      <!-- v-if="RowInfo.row.userId !== 1" -->
      <template v-slot:importTime="{prop}">
        <span>{{ parseTime(prop) }}</span>
      </template>
      <template v-slot:status="{prop}" >
        <div v-if="prop==1" class="dot-wrap"><i class="dot dot-green"></i>正常</div>
        <div class="dot-wrap" v-else-if="prop==2"><i class="dot dot-red"></i>已锁定</div>
        <div class="dot-wrap" v-else-if="prop==3"><i class="dot dot-orange"></i>已冻结</div>
        <!-- <div class="dot-wrap" v-else><i class="dot dot-orange"></i>已销毁</div> -->
      </template>
      <template v-slot:bindStatus="{prop}" > 
        <div v-if="prop==1" >未绑定</div>
        <div v-else-if="prop==2" >已绑定</div>
        <div  v-else>已激活</div>
      </template>
      <template v-slot:enable="{ RowInfo }">
        <el-switch v-model="RowInfo.row.enable"  
          :disabled="(RowInfo.row.enable&&!isEnable) || (!RowInfo.row.enable&&!isDisable)"
          @change="handleStatusChange(RowInfo.row)"  ></el-switch>
      </template>
      <template v-slot:activationCode="{prop}" >
        <div v-if="prop" > 
          <span class="code">{{ prop }}</span>
          <!-- <el-button type="text" @click="getCode($event,RowInfo.row)" ><i class="el-icon-refresh" style="cursor: pointer;"></i></el-button> -->
        </div>
    </template>
      <template v-slot:default="{ RowInfo }">
        <el-button size="mini" type="text" @click="handleView(RowInfo.row, RowInfo.index)" icon="el-icon-info" 
          v-hasPermi="['magic:device:info']">详情</el-button>
        <el-dropdown 
              size="mini" 
              @command="(command) => handleCommand(command, RowInfo.row)"
            >
              <span class="el-dropdown-link">
                <i class="el-icon-d-arrow-right el-icon--right"></i>操作
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  command="resetCode" 
                  v-hasPermi="['magic:device:securityCode:reset']">重置魔盒安全码
                </el-dropdown-item>
                <el-dropdown-item   v-if="RowInfo.row.status==3"
                  command="unFreezeBox" 
                  v-hasPermi="['magic:device:unfreeze']">解冻
                </el-dropdown-item>
                <el-dropdown-item   v-if="RowInfo.row.status==1"
                  command="freezeBox" 
                  v-hasPermi="['magic:device:freeze']">冻结
                </el-dropdown-item>
                <el-dropdown-item   v-if="RowInfo.row.status==2"
                  command="unBlock" 
                  v-hasPermi="['magic:device:unlock']">解锁
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
         
      </template>
    </ZfTable>
    <!-- 魔盒详细 -->
    <BoxInfo :boxInfo="boxInfo" :openInfo="openInfo" @closeInfo="closeInfo"></BoxInfo>
    <!-- 魔盒导入对话框 -->
    <ImportBox :upload="upload"></ImportBox>

  </div>
</template>
  
<script>
import { list,resetCode, freezeBox ,unFreezeBox,disableBox,enableBox,getCode,getBoxInfoById,unlock } from '@/api/magic/device'
import { getToken } from "@/utils/auth";
import ImportBox from '../dialog/ImportBox.vue' 
import BoxInfo from '../dialog/BoxInfo.vue'
import {checkPermi} from '@/utils/permission'
export default {
  dicts:['magic_bind_status'],
  name: "Device",
  components:{
    ImportBox,BoxInfo
  },
  data() {

    return {
      // 是否显示弹出层
      openInfo: false,
      currentRow: undefined,
      reasonVisible: false,
      phoneVisible: false,
      type: 1,//type=1输入密码，type=0输入验证码
      disabled: false,
      ids:[],
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数
      queryParams: {},
      column: [
        { name: 'id',key: 0, label: '序号', visible: false },
        { name: 'snCode',key: 1, label: 'SN编号', visible: true },
        // { name: 'batch',key: 1, label: '批次', visible: true },
        // { name: 'color', key: 2,label: '颜色', visible: true },
        { name: 'status',key: 2, label: '魔盒状态', visible: true,slot:true },
        // { name: 'belong',key: 3, label: '所属', visible: true},
        { name: 'importTime',key: 4, label: '导入时间', visible: true,slot:true },
        // { name: 'phone',key: 5, label: '绑定号码', visible: true },
        { name: 'bindStatus',key: 7, label: '绑定标识', visible: true,slot:true },//true是已激活
        { name: 'activationCode',key: 7, label: '激活码', visible: true,slot:true },
        // { name: 'time',key: 8, label: '绑定时间', visible: true },
        { name: 'enable',key: 9, label: '状态', visible: true,slot:true },//1-正常，2-冻结，3-锁定
        // { name: 'isRepeat',key: 10, label: '是否可重复分配', visible: true },
        // { name: 'userName',key: 4, label: '绑定用户', visible: true },
        // { name: 'count', key: 6,label: '绑定次数', visible: true },
      ],
      url: (parms) => {
        return list(parms);
      },
      isSearch: false,
      path: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "魔盒导入",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/boxes/import",
        afterUpdate:this.getList
      },
      boxInfo:{},
      paramList: [
        
        {name: "snCode",label: "SN编号", type: "input", param: "", placeholder: "请输入SN编号"},
        // {name: "batch", label: "批次", type: "input", param: "", placeholder: "请输入"},
        {name: "status", label: "魔盒状态", type: "select", param: "",  placeholder: "魔盒状态",dict:"magic_device_status"},
        // {name: "userName", label: "绑定用户", type: "input", param: ""},
        //  {name: "phone", label: "绑定号码", type: "input", param: ""}
      ],
      isEnable:false,
      isDisenable:false,
      
    };

  },
  created(){
    this.isEnable = checkPermi(['magic:device:enable'])
    this.isDisable = checkPermi(['magic:device:disable'])
  },
  methods: {
    
    handleImport() {
      this.upload.open = true;
    },
    /** 查询登录日志列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    getRefresh(row){
      getCode(row.snCode).then(res=>{
        this.getList();
      })
      
    },
    /** 搜索按钮操作 */
    handleQuery(params) {
      this.queryParams = params;
      this.getList();
    },
    freezeBox(row){
      this.$modal.confirm(`是否确认冻结魔盒SN为${row.snCode}的魔盒？`).then(function () {
        return freezeBox(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.FREEZE_SUCCESS);
      }).catch(() => { });
    },
    unFreezeBox(row){
      this.$modal.confirm(`是否确认解冻魔盒SN为${row.snCode}的魔盒？`).then(function () {
        return unFreezeBox(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.UNFREEZE_SUCCESS);
      }).catch(() => { });
    },
    getCode(e,row){
      const previousEle = e.currentTarget.previousElementSibling;
      getCode(row.snCode).then(res=>{
        previousEle.innerHTML = res.data;
      })
      
    },
    handleStatusChange(row){
      if(row.enable){
        this.$modal.confirm(`是否确认启用魔盒SN为${row.snCode}的魔盒？`).then(function () {
          return enableBox(row.id);
        }).then(() => {
          this.$modal.msgSuccess(this.$enum.ENABLE_SUCCESS);
        }).catch((status) => { 
          if(status=='cancel'){
            row.enable = !row.enable;
          }
        });
        
      }else{
        this.$modal.confirm(`是否确认禁用魔盒SN为${row.snCode}的魔盒？`).then(function () {
          return  disableBox(row.id);
      }).then(() => {
          this.$modal.msgSuccess(this.$enum.DISENABLE_SUCCESS);
        }).catch((status) => {
        if(status == 'cancel') {
          row.enable = !row.enable;
        }
      })
       
      }
    },
   
    /** 详细按钮操作 */
    handleView(row) {
      this.openInfo = true;
      this.form = row;
      this.boxInfo = {};
      getBoxInfoById(row.id).then(res=>{
        this.boxInfo = res.data;
      });
      
      
    },
   
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.reasonVisible = false;
          done();
        })
        .catch(_ => { });
    },
    closeInfo(){
      this.openInfo=false
    },
    unBlock(row){
      this.$modal.confirm(`是否确认解锁魔盒SN为${row.snCode}的魔盒？`).then(function () {
        return unlock(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.UNBLOCK_SUCCESS);
      }).catch(() => { });

    },
    resetCode(row){
      this.$modal.confirm(`是否确认重置魔盒SN为${row.snCode}的魔盒安全码？`).then(function () {
        return resetCode(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.RESET_SUCCESS);
      }).catch(() => { });

    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "resetCode":
          this.resetCode(row);
          break;
        case "unFreezeBox":
          this.unFreezeBox(row);
          break;
        case "freezeBox":
          this.freezeBox(row);
          break;
        case "unBlock":
          this.unBlock(row);
          break;
        default:
          break;
      }
    },
    

  },
 
  





};
</script>
  
<style lang="scss">
.device-label {
  color: #303133;
}

.device-content {
  color: #606266;
}

.el-dialog {
  display: flex;
  flex-direction: column; // 水平分布
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: calc(100% - 60px);
  max-width: calc(100% - 60px);
}

.el-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
}
.dot-wrap{
  display: flex;
  align-items: center;
  gap:5px
}
.dot-wrap i{
  display: inline-block;
  width:5px;
  height:5px;
  border-radius:50%;
  background: green;
}
.dot-wrap .dot-orange{
  background: orange;
}
.dot-wrap .dot-red{
  background: red;
}

</style>