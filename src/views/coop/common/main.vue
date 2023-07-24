
<template>
  <div class="app-container">
    <!-- 搜索行 -->
    <base-search :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button 
          type="primary" plain icon="el-icon-plus" size="mini" 
          @click="handleAdd"
          v-hasPermi="[permiDefault.add]">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="[permiDefault.update]"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button 
          type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" 
          @click="handleDelete"
          v-hasPermi="[permiDefault.delete]">删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    
    <!-- 表格 -->
    <ZfTable 
      ref="myTable" 
      :actionWidth="180"
      :table-head-titles="columns" 
      :isNeedSelection="true" 
      :isSearch="isSearch" 
      :url="url"
      :query-params="queryParams" 
      @handleSelectionChange="handleSelectionChange"
      :showSearch="showSearch"
    >
      <template v-slot:status="{prop}" >
          <dict-tag :options="dict.type.cooperation_status" :value="prop"/>
      </template>
      <template v-slot:expired="{prop}" >
          <dict-tag :options="dict.type.cooperation_status" :value="prop"/>
      </template>
      <template v-slot:default="{ RowInfo }">
        <el-button 
          size="mini" type="text" icon="el-icon-edit" 
          @click="handleUpdate(RowInfo.row)"
          v-hasPermi="[permiDefault.update]">修改
        </el-button>
        <el-button 
          size="mini" type="text" icon="el-icon-delete" 
          @click="handleDelete(RowInfo.row)"
          v-hasPermi="[permiDefault.delete]">删除
        </el-button>
        <el-button 
          size="mini" type="text" icon="el-icon-info"
          @click="handleInfo(RowInfo.row)"
          v-hasPermi="[permiDefault.detail]">详情
        </el-button>
      </template>
    </ZfTable>
    <internal-user-add ref="internalUserAdd" @getList="getList"></internal-user-add>
    <InterInfo ref="interInfo" :info="info" :getInfoById="getInfo"></InterInfo>
  </div>
</template>

<script>
import InternalUserAdd from "./add.vue"
import InterInfo from './interInfo'

export default {
  name: "Main",
  dicts: ['sys_normal_disable','expired_status','cooperation_status'],
  components: {InternalUserAdd,InterInfo},
  props:{
    list:{
      type:Function,
      required:true
    },
    getInfo:{
      type:Function,
      required:true
    },
    delData:{
      type:Function,
      required:true
    },
    InternalUserAdd:{
      type:Object,
    },
    coopType:{
      type:String,
      required:true,
    },
    permiDefault:{
      type:Object,
      required: true,
    }
  },
  data() {
    return {
      // 选中数组
      ids: [],
      names:[],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "cooperateName", label: "协作名称", type: "input", param: "", placeholder: "请输入协作名称"},
        {name: "deptName", label: "部门名称", type: "input", param: "", placeholder: "请输入部门名称"},
        {name: "orgName", label: "机构名称", type: "input", param: "", placeholder: "请输入机构名称"},
      ],
      // 查询参数
      queryParams: {},
      columns: [
      { name: "cooperateName", key: 1, label: `	协作名称`, visible: true },
        { name: "createBy", key: 2, label: `创建者`, visible: false },
        { name: "createTime", key: 3, label: `创建时间`, visible: true },
        { name: "orgName", key: 4, label: `机构名称`, visible: true },
        { name: "deptName", key: 4, label: `部门名称`, visible: true },
        { name: "endTime", key: 5, label: `结束时间`, visible: true },
        { name: "expired", key: 6, label: `过期状态`, visible: true,slot:true },
        { name: "remark", key: 7, label: `备注`, visible: false },
        { name: "status", key: 8, label: `状态`, visible: false, slot:true},
      ],
      // 查询方法
      url: (params) => {
        return this.list(params)
      },
      // 查询调用标识
      isSearch: false,
      info:{},
    };
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params;
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.names = selection.map(item => item.cooperateName)
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs.internalUserAdd.open(this.coopType,{})
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id ? row.id : this.ids[0];
      this.getInfo(id).then(res=>{
        let pList = res?.data?.depts;
        if(pList){
          row = res.data
        }else{
          row.phonebookList =  res.data.depts
        }
       
        this.$refs.internalUserAdd.open(this.coopType, row);
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids;
      let that = this;
      const cooperateName = (row && row.cooperateName) || this.names;
      this.$modal.confirm('确认删除协作"' + cooperateName + '"吗？').then(function () {
        return that.delData(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.DELETE_SUCCESS);
      }).catch(() => { });
    },
    handleInfo(row){
      this.info = row;
      this.$refs.interInfo.open(row.id,this.coopType);
      
    }
   
  }
};
</script>

  