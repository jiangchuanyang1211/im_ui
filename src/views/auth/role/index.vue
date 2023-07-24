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
              v-hasPermi="['auth:role:add']">新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button 
              type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" 
              @click="handleDelete"
              v-hasPermi="['auth:role:remove']">删除
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
          <template v-slot:status="{ RowInfo }">
            <dict-tag 
              v-if="!checkPermi(['auth:role:edit'])"
              :options="dict.type.sys_normal_disable" 
              :value="RowInfo.row.status"
            />
            <el-switch 
              v-model="RowInfo.row.status" :active-value=1 :inactive-value=2
              v-hasPermi="['auth:role:edit']"
              @change="handleStatus(RowInfo.row)">
            </el-switch>
          </template>
          <template v-slot:default="{ RowInfo }">
            <el-button 
              size="mini" type="text" icon="el-icon-edit" 
              @click="handleEdit(RowInfo.row)"
              v-hasPermi="['auth:role:edit']">修改
            </el-button>
            <el-button 
              size="mini" type="text" icon="el-icon-delete" 
              @click="handleDelete(RowInfo.row)"
              v-hasPermi="['auth:role:remove']">删除
            </el-button>
            <el-dropdown 
              size="mini" 
              @command="(command) => handleCommand(command, RowInfo.row)"
              v-hasPermi="['auth:role:bindOrg', 'auth:role:bindUser']"
            >
              <span class="el-dropdown-link">
                <i class="el-icon-d-arrow-right el-icon--right"></i>操作
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  command="allocOrgDept" icon="el-icon-circle-check"
                  v-hasPermi="['auth:role:bindOrg']">分配部门
                </el-dropdown-item>
                <el-dropdown-item 
                  command="allocAdmin" icon="el-icon-user"
                  v-hasPermi="['auth:role:bindUser']">分配管理员
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
              </template>
        </ZfTable>
      </template>
    </FlexibleBox>

    <!-- 添加或修改角色对话框 -->
    <auth-role-add ref="authRoleAdd" @operSuccess="getList">
    </auth-role-add>
    
    <!-- 分配机构部门对话框 -->
    <alloc-admin ref="allocAdmin">
    </alloc-admin>
    
    <!-- 分配管理员对话框 -->
    <alloc-org-dept ref="allocOrgDept">
    </alloc-org-dept>
  </div>
</template>

<script>
import { checkPermi } from "@/utils/permission"
import { listOrgDept } from "@/api/struct/org";
import { listRole, delRole, enableRole, getRole } from "@/api/auth/role"
import AuthRoleAdd from "./dialog/add.vue"
import AllocAdmin from "./dialog/allocAdmin.vue"
import AllocOrgDept from "./dialog/allocOrgDept.vue"

export default {
  name: "Role",
  dicts: ['sys_normal_disable'],
  components: { AuthRoleAdd, AllocAdmin, AllocOrgDept },
  data() {
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
        {name: "roleName", label: "角色名称", type: "input", param: "", placeholder: "请输入角色名称"},
        {name: "roleCode", label: "权限字符", type: "input", param: "", placeholder: "请输入权限字符"},
        {name: "status", label: "角色状态", type: "select", param: "", placeholder: "角色状态", dict: "sys_normal_disable"},
      ],
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "roleName", key: 1, label: `角色名称`, visible: true },
        { name: "roleCode", key: 2, label: `权限字符`, visible: true },
        { name: "sortNo", key: 3, label: `显示顺序`, visible: true },
        { name: "status", key: 4, label: `角色状态`, visible: true, slot:true },
      ],
      // 查询方法
      url: (params) => {
        return listRole(params)
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
    /** 查询角色列表 */
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
      this.names = selection.map(item => item.roleName)
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      let _form = { sortNo: 0, status: 1 }
      this.$refs.authRoleAdd.open("添加角色", _form)
    },
    /** 修改角色状态 */
    handleStatus(row) {
      let text = (row.status === 1 ? "启用" : "停用");
      this.$modal.confirm('确认' + text + '角色"' + row.roleName + '"吗？').then(function () {
        let params = {
          id: row.id,
          status: row.status
        }
        return enableRole(params);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = (row.status === 1 ? 2 : 1)
      });
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      getRole(row.id).then( res => {
        this.$refs.authRoleAdd.open("修改角色", res.data)
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.id ? [row.id] : this.ids;
      const roleNames = (row && row.roleName) || this.names;
      this.$modal.confirm('确认删除角色"' + roleNames + '"吗？').then(function () {
        return delRole(roleIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "allocOrgDept":
          this.handleAllocOrgDept(row);
          break;
        case "allocAdmin":
          this.handleAllocAdmin(row);
          break;
        default:
          break;
      }
    },
    /** 分配机构部门 */
    handleAllocOrgDept(row) {
      let _form = { 
        roleId: row.id, 
        roleName: row.roleName,
        roleCode: row.roleCode
      }
      this.$refs.allocOrgDept.open("分配部门", _form)
    },
    /** 分配管理员 */
    handleAllocAdmin(row) {
      let _form = { 
        roleId: row.id, 
        roleName: row.roleName,
        roleCode: row.roleCode
      }
      this.$refs.allocAdmin.open("分配管理员", _form)
    },
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