<template>
  <div class="app-container">
    <FlexibleBox>
      <template v-slot:left-content>
        <TreeFilter ref="tree" :options="treeOptions" :defaultProps="defaultProps" @nodeClick="handleNodeClick">
        </TreeFilter>
      </template>

      <template v-slot:right-content>
        <!-- 搜索行 -->
        <base-search 
          ref="baseSearch"
          :paramList="paramList" 
          @handleQuery="handleQuery" 
          v-show="showSearch">
        </base-search>

        <el-row ref="buttonRow" :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary" plain icon="el-icon-plus" size="mini"
              @click="handleAdd"
              v-hasPermi="[permiList.add]">新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button 
              type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" 
              @click="handleDelete"
              v-hasPermi="[permiList.delete]">删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button 
              type="info" plain icon="el-icon-upload2" size="mini" 
              @click="handleImport"
              v-hasPermi="[permiList.import]">导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button 
              type="warning" plain icon="el-icon-download" size="mini"
              @click="handleExportTemplate"
              v-hasPermi="[permiList.export]">导出模板
              </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

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
          <template v-slot:gender="{ RowInfo }">
            <dict-tag :options="dict.type.sys_user_sex" :value="RowInfo.row.gender"/>
          </template>
          <template v-slot:status="{ RowInfo }">
            <dict-tag 
              v-if="!checkPermi([permiList.update])"
              :options="dict.type.sys_normal_disable" 
              :value="RowInfo.row.status"
            />
            <el-switch 
              v-model="RowInfo.row.status" :active-value=1 :inactive-value=2
              v-hasPermi="[permiList.update]"
              @change="handleStatus(RowInfo.row)">
            </el-switch>
          </template>
          <template v-slot:bindStatus="{ prop }">
            <dict-tag :options="dict.type.sys_yes_no" :value="Number(prop)"/>
          </template>
          
          <template v-slot:default="{ RowInfo }">
            <el-button 
              size="mini" type="text"  icon="el-icon-info" 
              @click="handleDetail(RowInfo.row)"
              v-hasPermi="[permiList.detail]">详情
            </el-button>
            <el-button 
              size="mini" type="text" icon="el-icon-edit" 
              @click="handleEdit(RowInfo.row)"
              v-hasPermi="[permiList.update]">修改
            </el-button>
            <el-dropdown 
              size="mini" 
              @command="(command) => handleCommand(command, RowInfo.row)"
              v-hasPermi="[permiList.delete, permiList.download, permiList.bind, permiList.unbind]">
              <span class="el-dropdown-link">
                <i class="el-icon-d-arrow-right el-icon--right"></i>操作
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  command="remove" v-hasPermi="[permiList.delete]">删除
                </el-dropdown-item>
                <!-- <el-dropdown-item 
                  command="resetError" v-hasPermi="['struct:admin:edit']">重置登陆限制
                </el-dropdown-item> -->
                <el-dropdown-item command="download" v-hasPermi="[permiList.download]">导出交流数据
                </el-dropdown-item>
                <el-dropdown-item v-if="!RowInfo.row.bindStatus" command="bind" v-hasPermi="[permiList.bind]">绑定魔盒
                </el-dropdown-item>
                <el-dropdown-item v-else command="unbind" v-hasPermi="[permiList.unbind]">解绑魔盒
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ZfTable>
      </template>

    </FlexibleBox>
    <!-- 通讯录导入弹窗 -->
    <struct-address-import ref="structAddressImport" @operSuccess="getList">
    </struct-address-import>
    <!-- 通讯录新增弹窗 -->
    <struct-address-add ref="structAddressAdd" @operSuccess="getList">
    </struct-address-add>
    <!-- 通讯录详情弹窗 -->
    <struct-address-detail ref="structAddressDetail">
    </struct-address-detail>
    <!-- 新增导出交流数据弹窗 -->
    <download-data-dialog ref="downloadDataDialog"></download-data-dialog>
    <unbind-box ref="unbindBox" :userId="userId"></unbind-box>
  </div>
</template>

<script>
import { checkPermi } from "@/utils/permission"
import { getToken } from "@/utils/auth"
import { listOrgDept } from "@/api/struct/org";
import { unbind } from '@/api/magic/device'
import { 
  listAddress, 
  delAddress, 
  enableAddress,
  importAddress, 
  exportTemplate,
  getAddress,
} from "@/api/struct/address";
import StructAddressImport from "./dialog/import.vue";
import StructAddressAdd from "./dialog/add.vue";
import StructAddressDetail from "./dialog/detail.vue";
import DownloadDataDialog from './dialog/download';
import UnbindBox from "./dialog/unbindBox.vue";
const permiDefault = {
        add:'struct:address:add',
        delete:'struct:address:remove',
        detail:'struct:address:detail',
        update:'struct:address:edit',
        download:'magic:device:messages:export',
        bind:'magic:device:activate:gen',
        unbind:'magic:device:activate:gen',
        import:'struct:address:import',
        export:'struct:address:exportTemplate',
      }

export default {
  name: "Address",
  dicts: ["sys_user_sex", "sys_normal_disable",'sys_yes_no'],
  components: { 
    StructAddressImport,
    StructAddressAdd, 
    StructAddressDetail,
    DownloadDataDialog,
    UnbindBox
  },
  props:{
    permiList:{
      type:Object,
      default(){
        return permiDefault
      }
    }
  },
  data() {
    let formatter = function(val){
      if(!val)return val;
      let arr = val.split(',');
      let str = '';
      for(var i=0;i<arr.length;i++){
          str+= `<div>${arr[i]}</div>`
      }
      return str;
    }
    return {
      // 树形结构选项
      treeOptions: [],
      // 选中节点
      selectNode: {},
      // 树形结构默认配置
      defaultProps: {
        children: "children",
        label: "name"
      },
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "phone", label: "手机号", type: "input", param: "", placeholder: "请输入手机号"},
        {name: "nickname", label: "姓名", type: "input", param: "", placeholder: "请输入姓名"},
        {name: "status", label: "状态", type: "select", param: "",  placeholder: "状态", dict: "sys_normal_disable"},
      ],
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "phone", key: 1, label: "手机号", visible: true },
        { name: "nickname", key: 2, label: "姓名", visible: true },
        { name: "gender", key: 3, label: "性别", visible: true, slot: true },
        { name: "orgDeptName", key: 4, label: "所属机构", visible: true, formatter:formatter},
        { name: "bindStatus", key: 5, label: "是否绑定魔盒", visible: true, slot: true},
        { name: "status", key: 6, label: "状态", visible: true, slot: true },
      ],
      // 查询方法
      url: (params) => {
        return listAddress(params, this.getBsType())
      },
      // 查询调用标识
      isSearch: false,
      userId:"",
    };
  },
  created() {
    this.getTreeOptions()
  },
  methods: {
    /** 验证权限 */
    checkPermi,
    /** 获取树形结构选项 */
    getTreeOptions() {
      listOrgDept(this.getBsType()).then( res => {
        this.treeOptions = res.data
      })
    },
    /** 树形结构选择节点 */
    handleNodeClick(data) {
      if(data) {
        this.selectNode = JSON.parse(JSON.stringify(data))
      }
      else {
        this.selectNode = {}
      }
      this.resetQueryId()
      this.$refs.baseSearch.handleQuery()
    },
    /** 重置queryParams中的orgId，或deptId */
    resetQueryId() {
      delete this.queryParams.orgId
      delete this.queryParams.deptId
      if(this.selectNode.id) {
        if(this.selectNode.type == "org") {
          this.queryParams.orgId = this.selectNode.id
        }
        else if(this.selectNode.type == "dept") {
          this.queryParams.deptId = this.selectNode.id
        }
      }
    },
    /** 查询部门列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params;
      this.resetQueryId() 
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.names = selection.map(item => item.nickname);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      let _form = { status: 1, type: 1, gender: 3 }
      this.$refs.structAddressAdd.open("新建通讯录", _form)
    },
    /** 导入按钮操作 */
    handleImport(params) {
      this.$refs.structAddressImport.open("导入通讯录")
    },
    /** 导出模板按钮操作 */
    handleExportTemplate() {
      let url =  process.env.VUE_APP_BASE_API + "/system/phonebook/" + this.getBsType() + "/exportTemplate"
      let params = "?access_token=" + getToken()
      window.open(url + params)
    },
    /** 修改通讯录人员状态 */
    handleStatus(row) {
      let type = this.getBsType()
      let text = (row.status === 1 ? "启用" : "停用");
      this.$modal.confirm('确认' + text + '用户"' + row.nickname + '"吗？').then(function () {
        let params = {
          id: row.id,
          status: row.status
        }
        return enableAddress(params, type);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = (row.status === 1 ? 2 : 1)
      });
    },
    /** 通讯录详情 */
    handleDetail(row) {
      getAddress(row.id, this.getBsType()).then( res => {
        this.$refs.structAddressDetail.open("通讯录详情", res.data)
      })
    },
    /** 编辑通讯录 */
    handleEdit(row) {
      getAddress(row.id, this.getBsType()).then( res => {
        this.$refs.structAddressAdd.open("修改通讯录", res.data)
      })
    },
    /** 操作 */
    handleCommand(command, row) {
      switch (command) {
        case "remove":
          this.handleDelete(row)
          break;
        case "resetError":
          this.handleResetError(row)
          break;
        case "download":
          this.handleDownloadData(row)
          break;
        case "bind":
          this.handleBindBox(row);
          break;
        case "unbind":
          this.handleUnbindBox(row);
          break;
        default:
          break;
      }
    },
    /** 导出交流数据操作 */
    handleDownloadData(row) {
      this.$modal.confirm('本功能全程需同步保持APP在线，请保证APP处于登录状态！').then(() => {
        this.$refs.downloadDataDialog.open(row.id)
      }).catch(() => {});
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let type = this.getBsType()
      const addressIds = row.id ? [row.id] : this.ids; 
      const addressNames = (row && row.nickname) || this.names;
      this.$modal.confirm('确认删除用户"' + addressNames + '"吗？').then(function() {
        return delAddress(addressIds, type);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 重置登陆密码错误次数 */
    handleResetError() {},
    handleBindBox(row){
      this.userId = row.id
      this.$refs.unbindBox.open();
    },
    handleUnbindBox(row){
      const addressNames =  row.nickname || row;
      this.$modal.confirm('确认解绑用户"' + addressNames + '"的魔盒吗？').then(function() {
        return unbind(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("魔盒解绑成功");
      }).catch(() => {});
      
    }
  },
};
</script>

<style scope>
.app-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
