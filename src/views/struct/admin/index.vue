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
              v-hasPermi="['struct:admin:add']">新增
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <ZfTable 
          ref="myTable" 
          :actionWidth="180"
          :table-head-titles="columns" 
          :isNeedSelection="false" 
          :isSearch="isSearch" 
          :url="url"
          :query-params="queryParams" 
          @handleSelectionChange="handleSelectionChange"
          :showSearch="showSearch"
        >
          <template v-slot:status="{ RowInfo }">
            <dict-tag 
              v-if="!checkPermi(['struct:admin:edit'])"
              :options="dict.type.sys_normal_disable" 
              :value="RowInfo.row.status"
            />
            <el-switch 
              v-model="RowInfo.row.status" :active-value=1 :inactive-value=2
              v-hasPermi="['struct:admin:edit']"
              @change="handleStatus(RowInfo.row)">
            </el-switch>
          </template>
          <template v-slot:default="{ RowInfo }">
            <el-button v-if="RowInfo.row.empId"
              size="mini" type="text" icon="el-icon-edit" 
              @click="handleEdit(RowInfo.row)"
              v-hasPermi="['struct:admin:edit']">修改
            </el-button>
            <el-button 
              size="mini" type="text" icon="el-icon-delete" 
              @click="handleDelete(RowInfo.row)"
              v-hasPermi="['struct:admin:remove']">删除
            </el-button>
            <el-dropdown 
              size="mini" 
              @command="(command) => handleCommand(command, RowInfo.row)"
              v-hasPermi="['struct:admin:resetPwd']"
              v-if="RowInfo.row.empId"
            >
              <span class="el-dropdown-link" >
                <i class="el-icon-d-arrow-right el-icon--right"></i>操作
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  command="resetPwd" icon="el-icon-key"
                  v-hasPermi="['struct:admin:resetPwd']">重置密码
                </el-dropdown-item>
                <!-- <el-dropdown-item 
                  command="resetError" icon="el-icon-circle-check"
                  v-hasPermi="['struct:admin:edit']">重置登陆限制
                </el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ZfTable>
      </template>
    
    </FlexibleBox>
    
    <!-- 添加或修改管理员对话框 -->
    <struct-admin-add ref="structAdminAdd" @operSuccess="getList">
    </struct-admin-add>

  </div>
</template>

<script>
import { checkPermi } from "@/utils/permission"
import { listOrgDept } from "@/api/struct/org";
import { listAdmin, delAdmin, enableAdmin, getAdmin, resetAdminPwd} from "@/api/struct/admin"
import { doSm3 } from '@/utils/sm3'
import StructAdminAdd from "./dialog/add.vue"

export default {
  name: "Admin",
  dicts: ['sys_normal_disable', 'sys_user_sex'],
  components: { StructAdminAdd },
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
      // 选中数组ID
      ids: [],
      // 选中数组name
      names: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "userName", label: "管理员账号", type: "input", param: "", placeholder: "请输入管理员账号"},
        {name: "status", label: "管理员状态", type: "select", param: "", placeholder: "管理员状态", dict: "sys_normal_disable"},
      ],
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "username", key: 1, label: `管理员账号`, visible: true, },
        { name: "nickName", key: 2, label: `管理员姓名`, visible: true, },
        { name: "orgDeptName", key: 3, label: `机构部门`, visible: true, formatter:formatter },
        { name: "status", key: 4, label: `管理员状态`, visible: true, slot: true },
      ],
      // 查询方法
      url: (params) => {
        return listAdmin(params)
      },
      // 查询调用标识
      isSearch: false,
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
    /** 查询用户列表 */
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
      this.names = selection.map(item => item.nickName)
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      let _form = { status: 1 }
      this.$refs.structAdminAdd.open("添加管理员", _form)
    },
    /** 修改管理员状态 */
    handleStatus(row) {
      let text = (row.status === 1 ? "启用" : "停用");
      this.$modal.confirm('确认' + text + '管理员"' + row.nickName + '"吗？').then(function () {
        let params = {
          id: row.id,
          status: row.status
        }
        return enableAdmin(params);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = (row.status === 1 ? 2 : 1)
      });
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      getAdmin(row.id).then( res => {
        this.$refs.structAdminAdd.open("修改管理员", res.data)
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const adminIds = row.id ? [row.id] : this.ids;
      const adminNames = (row && row.nickName) || this.names;
      this.$modal.confirm('确认删除管理员"' + adminNames + '"吗？').then(function () {
        return delAdmin(adminIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 更多操作触发 */
    handleCommand(command, row) {
      switch (command) {
        case "authRole":
          this.handleAuthRole(row);
          break;
        case "resetPwd":
          this.handleResetPwd(row);
          break;
        case "resetError":
          this.handleResetError(row);
          break;
        default:
          break;
      }
    },
    /** 重置密码 */
    handleResetPwd(row) {
      this.$prompt("请输入当前账号密码", "验证", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputType: "password"
      }).then( ({value}) => {
        let params = { password: doSm3(value), userId: row.id }
        return resetAdminPwd(params);
      }).then( () => {
        this.$modal.msgSuccess("重置成功");
      }).catch(() => { });
    },
    /** 重置登陆密码错误次数 */
    handleResetError(row) {
    }
  }
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