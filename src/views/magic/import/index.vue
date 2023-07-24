<template>
  <div class="app-container">
    <!-- 搜索框 -->
    <base-search :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>
    <!-- 导入 -->
   
    <el-row class="mb8" type="flex" justify="space-between">
      <el-col>
        <handle-row :btns="btns" :single="single" :multiple="multiple" @handleImport="handleImport">
        </handle-row>
      </el-col>
      <el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" ></right-toolbar>
      </el-col>
    </el-row>

    <ZfTable ref="myTable" :table-head-titles="column" :isSearch="isSearch" :url="url" :query-params="queryParams" :isDisplayAction="false">
      <!-- v-if="RowInfo.row.userId !== 1" -->
      <template v-slot:status="{prop}" >
        <div v-if="prop==1" class="dot-wrap"><i class="dot dot-green"></i>待绑定</div>
        <div class="dot-wrap" v-else-if="prop==2"><i class="dot dot-green"></i>已绑定</div>
        <div class="dot-wrap" v-else-if="prop==3"><i class="dot dot-red"></i>已冻结</div>
        <div class="dot-wrap" v-else><i class="dot dot-orange"></i>已销毁</div>
      </template>
    </ZfTable>

    <!-- 魔盒导入对话框 -->
    <ImportBox :upload="upload"></ImportBox>

  </div>
</template>
  
<script>
import { list} from '@/api/magic/device'
import { getToken } from "@/utils/auth";
import ImportBox from '../dialog/ImportBox.vue'
export default {
  name: "Device",
  components:{
    ImportBox
  },
  data() {
    
    return {
      // 是否显示弹出层
      openInfo: false,
      disabled: false,
      ids:[],
      single: true,
      // 非多个禁用
      multiple: true,
     
      // 显示搜索条件
      showSearch: true,
      reason:"",
      // 查询参数
      queryParams: {},
      // 按钮行配置
      btns: {
        import: { visible: true, hasPermi: ["magic:device:import"] },
      },
      column: [
        { name: 'id',key: 0, label: '序号', visible: true },
        { name: 'boxSn',key: 1, label: '魔盒SN', visible: true },
        { name: 'status',key: 2, label: '绑定状态', visible: true,slot:true },
        { name: 'importTime',key: 4, label: '导入时间', visible: true },
        { name: 'operator',key: 6, label: '操作人', visible: true },
        { name: 'isRepeat',key: 10, label: '是否可重复分配', visible: true },
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
        url: process.env.VUE_APP_BASE_API + "/system/box/importBox",
        afterUpdate:this.getList
      },
      boxInfo:{},
      paramList: [
        {name: "boxSn",label: "SN编号", type: "input", param: "", placeholder: "请输入"},
        {name: "batch", label: "批次", type: "input", param: "", placeholder: "请输入"},
        {name: "status", label: "绑定状态", type: "select", param: "",  placeholder: "魔盒状态",dict:"magic_device_status"},
        {name: "userName", label: "绑定用户", type: "input", param: ""},
         {name: "phone", label: "绑定号码", type: "input", param: ""}
      ],
    };

  },
  methods: {
    
    handleImport() {
      this.upload.open = true;
    },
    /** 查询登录日志列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getList();
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