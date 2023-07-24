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
              v-hasPermi="['struct:post:add']">新增
          </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button 
              type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" 
              @click="handleDelete"
              v-hasPermi="['struct:post:remove']">删除
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <ZfTable 
          ref="myTable" 
          :actionWidth="120"
          :table-head-titles="columns" 
          :isNeedSelection="true" 
          :isSearch="isSearch" 
          :url="url"
          :query-params="queryParams" 
          @handleSelectionChange="handleSelectionChange"
          :showSearch="showSearch"
        >
          <template v-slot:default="{ RowInfo }">
            <el-button 
              size="mini" type="text" icon="el-icon-edit" 
              @click="handleEdit(RowInfo.row)"
              v-hasPermi="['struct:post:edit']">修改
            </el-button>
            <el-button 
              size="mini" type="text" icon="el-icon-delete" 
              @click="handleDelete(RowInfo.row)"
              v-hasPermi="['struct:post:remove']">删除
            </el-button>
          </template>
        </ZfTable>
      </template>

    </FlexibleBox>
    
    <!-- 添加或修改岗位对话框 -->
    <struct-post-add ref="structPostAdd" @operSuccess="getList">
    </struct-post-add>
  </div>
</template>

<script>
import { listOrgDept } from "@/api/struct/org";
import { listPost, delPost, getPost } from "@/api/struct/post";
import StructPostAdd from "./dialog/add.vue";

export default {
  name: "Post",
  // dicts: ['sys_normal_disable'],
  components: { StructPostAdd },
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
        {name: "postName", label: "岗位名称", type: "input", param: "", placeholder: "请输入岗位名称"},
        // {name: "status", label: "岗位状态", type: "select", param: "", placeholder: "岗位状态", dict: "sys_normal_disable"}
      ],
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: 'postName', label: '岗位名称', visible: true },
        { name: 'postSort', label: '岗位排序', visible: true },
        { name: 'orgName', label: '机构名称', visible: true },
        { name: 'deptName', label: '部门名称', visible: true },
      ],
      url: (parms) => {
        return listPost(parms);
      },
      isSearch: false,
    };
  },
  created() {
    this.getTreeOptions()
  },

  methods: {
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
    /** 查询岗位列表 */
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
      this.ids = selection.map(item => item.id)
      this.names = selection.map(item => item.postName)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      let _form = { postSort: 0, status: 1 }
      if(this.selectNode.id) {
        if(this.selectNode.type == "org") {
          _form.orgId = this.selectNode.id
        }
        else if(this.selectNode.type == "dept") {
          _form.orgId = this.selectNode.extendData.orgId
          _form.deptId = this.selectNode.id
        }
      }
      this.$refs.structPostAdd.open("添加岗位", _form)
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      getPost(row.id).then( res => {
        this.$refs.structPostAdd.open("修改岗位", res.data)
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const postIds = row.id ? [row.id] : this.ids; 
      const postNames = (row && row.postName) || this.names;
      this.$modal.confirm('确认删除岗位"' + postNames + '"吗？').then(function () {
        return delPost(postIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
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