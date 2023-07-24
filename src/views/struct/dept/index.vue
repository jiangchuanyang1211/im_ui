<template>
  <div class="app-container">
    <FlexibleBox>
      <template v-slot:left-content>
        <div class="head-container">
          <el-row class="search-row" type="flex" justify="space-between">
            <el-input 
              v-model.trim="orgName" 
              placeholder="请输入搜索内容" 
              clearable size="small" 
              prefix-icon="el-icon-search" 
              style="width: calc( 100% - 30px )" 
            />
            <el-tooltip class="item" effect="dark" content="重置选中机构部门" placement="top-end">
              <el-button 
                type="text" 
                class="el-icon-refresh-right" 
                size="medium"
                style="width: 30px"
                @click="resetNode">
              </el-button>
            </el-tooltip>
          </el-row>
        </div>
        <div class="tree-container">
          <el-tree
            ref="tree" 
            :data="treeOptions"
            :props="defaultProps" 
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            :filter-node-method="filterNode" 
            @node-click="handleNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label + (data.status == 1 ? "" : "(已停用)")  }}</span>
              <span>
                <el-tooltip class="item" effect="dark" content="编辑机构" placement="top-end">
                  <el-button 
                    v-if="!data.root" 
                    type="text" 
                    class="el-icon-edit-outline" 
                    size="mini" 
                    style="margin-left: 5px" 
                    v-hasPermi="[permiList.editOrg]"
                    @click.stop="handleEditOrg(data, node)">
                  </el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="新增机构" placement="top-end">
                  <el-button 
                    type="text" 
                    class="el-icon-plus" 
                    size="mini" 
                    style="margin-left: 5px" 
                    v-hasPermi="[permiList.addOrg]"
                    @click.stop="handleAddOrg(data, node)">
                  </el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除机构" placement="top-end">
                  <el-button 
                    v-if="!data.root" 
                    type="text" 
                    class="el-icon-delete" 
                    size="mini" 
                    style="margin-left: 5px"
                    v-hasPermi="[permiList.removeOrg]"
                    @click.stop="handleDelOrg(data, node)">
                  </el-button>
                </el-tooltip>
              </span>
            </span>
          </el-tree>
        </div>
      </template>

      <template v-slot:right-content>
        <!-- 搜索行 -->
        <base-search 
          ref="baseSearch"
          :paramList="paramList" 
          @handleQuery="handleQuery" 
          v-show="showSearch">
        </base-search>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAddOrg"
              v-hasPermi="[permiList.addOrg]">新增机构
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAddDept"
              v-hasPermi="[permiList.addDept]">新增部门
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="el-icon-sort"
              size="mini"
              @click="toggleExpandAll"
            >展开/折叠</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDeptList"></right-toolbar>
        </el-row>

        <el-table
          ref="table"
          v-if="refreshTable"
          v-loading="loading"
          :data="deptList"
          row-key="id"
          :default-expand-all="isExpandAll"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          :max-height="defaultMaxHeight"
          v-resizeTable="{isResize: true, table:$refs.table, bottomOffset: bottomOffset}"
          
        >
          <el-table-column prop="name" label="部门名称" ></el-table-column>
          <!-- <el-table-column prop="sortNo" label="显示排序" width="100"></el-table-column> -->
          <el-table-column prop="status" label="部门状态" width="100">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding" width="180">
            <template slot-scope="scope">
              <el-button
                size="mini" type="text" icon="el-icon-edit"
                @click="handleEditDept(scope.row)"
                v-hasPermi="[permiList.editDept]"
              >修改</el-button>
              <el-button
                size="mini" type="text" icon="el-icon-plus"
                @click="handleAddDept(scope.row)"
                v-hasPermi="[permiList.addDept]"
              >新增</el-button>
              <el-button
                size="mini" type="text" icon="el-icon-delete"
                @click="handleDelDept(scope.row)"
                v-hasPermi="[permiList.removeDept]"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </FlexibleBox>

    <!-- 添加或修改机构对话框 -->
    <struct-org-add ref="structOrgAdd" @operSuccess="getTreeOptions">
    </struct-org-add>
    <!-- 添加或修改部门对话框 -->
    <struct-dept-add ref="structDeptAdd" @operSuccess="getDeptList">
    </struct-dept-add>

  </div>
</template>

<script>
import { listOrgTree, delOrg, getOrg } from "@/api/struct/org";
import { listDeptTree, delDept, getDept, } from "@/api/struct/dept";
import StructOrgAdd from "./dialog/orgAdd.vue";
import StructDeptAdd from "./dialog/deptAdd.vue";
const permiDefault = {
  addDept:'struct:dept:add',
  removeDept:'struct:dept:remove',
  queryDept:'struct:dept:query',
  editDept:'struct:dept:edit',
  addOrg:'struct:org:add',
  removeOrg:'struct:org:remove',
  queryOrg:'struct:org:query',
  editOrg:'struct:org:edit',
}

export default {
  name: "Dept",
  dicts: ['sys_normal_disable'],
  components: { StructOrgAdd, StructDeptAdd },
  props:{
    permiList:{
      type:Object,
      default(){
        return permiDefault
      }
    }
  },
  data() {
    return {
      // 表格组件高度
      defaultMaxHeight: undefined,
      // 表格下边距
      bottomOffset: 20,
      // 树形结构选项
      treeOptions: undefined,
      // 选中节点
      selectNode: {},
      // 左侧搜索树查询参数
      orgName: '',
      // 左侧搜索树默认属性
      defaultProps: {
        children: "children",
        label: "name"
      },
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "deptName", label: "部门名称", type: "input", param: "", placeholder: "请输入部门名称"},
        {name: "status", label: "部门状态", type: "select", param: "",  placeholder: "部门状态", dict: "sys_normal_disable"}
      ],
      // 查询参数
      queryParams: {},
      // 遮罩层
      loading: false,
      // 部门数据
      deptList: []
    };
  },
  watch: {
    // 根据机构名称筛选机构树
    orgName(val) {
      this.$refs.tree.filter(val);
    },
    showSearch:{
      immediate: false,
      handler(val) {
        this.$nextTick( () => {
          this.resetTable()
        })
      }
    }
  },
  created() {
    this.getTreeOptions()
    this.getDeptList()
  },
  mounted() {
    this.resetTable()
    let that = this
    window.addEventListener("resize", () => {
        that.defaultMaxHeight = window.innerHeight - that.$refs.table.$el.getBoundingClientRect().top - that.bottomOffset
    })
  },
  beforeDestroy() {
    window.removeEventListener("resize",this.resetTable())
  },
  methods: {
    // 重设表格最大高度
    resetTable() {
      this.defaultMaxHeight = window.innerHeight - this.$refs.table.$el.getBoundingClientRect().top - this.bottomOffset
    },
    /** 获取树形结构选项 */
    getTreeOptions() {
      listOrgTree({}, this.getBsType()).then(res => {
        this.treeOptions = res.data 
      })
    },
    /** 筛选节点 */
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      return data.name.indexOf(value) !== -1;
    },
    /** 树形结构选择节点 */
    handleNodeClick(data) {
      this.selectNode = JSON.parse(JSON.stringify(data))
      this.$refs.baseSearch.handleQuery()
    },
    /** 重置选择机构*/
    resetNode() {
      this.selectNode = {}
      this.$refs.tree.setCurrentKey(null)
      delete this.queryParams.orgId
      this.getDeptList()
    },
    /** 新增机构*/
    handleAddOrg(data, node) {
      let _form = { parentId: data.id, sortNo: 0, status: 1 }
      if(this.selectNode.id) {
        _form.parentId = this.selectNode.id
      }
      this.$refs.structOrgAdd.open("添加机构", _form)
    },
    /** 编辑机构*/
    handleEditOrg(data, node) {
      getOrg(data.id, this.getBsType()).then(res => {
        this.$refs.structOrgAdd.open("修改机构", res.data)
      })
    },
    /** 删除机构*/
    handleDelOrg(data, node) {
      let type = this.getBsType()
      this.$modal.confirm('确认删除机构"' + data.name + '"吗？').then( function() {
        return delOrg(data.id, type)
      }).then(() => {
        this.selectNode = {}
        this.getTreeOptions()
        this.$modal.msgSuccess("删除成功");
      }).catch((err) => {console.log(err)});
    },
    /** 查询部门列表 */
    getDeptList() {
      this.loading = true
      let params = this.queryParams
      if(this.selectNode.id) {
        params.orgId = this.selectNode.id
      }
      listDeptTree(params, this.getBsType()).then( res => {
        this.deptList = res.data
        this.loading = false
      })
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getDeptList();
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 新增部门 */
    handleAddDept(row) {
      let _form = { orgId: row.id, sortNo: 0, status: 1 }
      if(this.selectNode.id) {
        _form.orgId = this.selectNode.id
      }
      if(row.id) {
        _form.orgId = row.extendData.orgId
        _form.parentId = row.id
      }
      this.$refs.structDeptAdd.open("添加部门", _form)
    },
    /** 修改部门 */
    handleEditDept(row) {
      getDept(row.id, this.getBsType()).then(res => {
        this.$refs.structDeptAdd.open("修改部门", res.data)
      });
    },
    /** 删除部门 */
    handleDelDept(row) {
      let type = this.getBsType()
      this.$modal.confirm('确认删除部门"' + row.name + '"吗？').then(function() {
        return delDept(row.id, type);
      }).then(() => {
        this.getDeptList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },  
  }
};
</script>


<style scoped>
.app-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.head-container {
  width: 100%;
  margin-bottom: 10px;
}
.search-row {
  width: 100%;
  margin-left: 0px;
}
.tree-container {
  margin: 0;
  padding: 0;
  height: calc( 100% - 52px);
  overflow-y: scroll;
  scrollbar-width: none;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>

<style lang="scss" scoped>
::v-deep .el-table__row:not([class*='el-table__row--level-'])>td:first-child {
padding-left: 23px!important;
}
::v-deep .el-table__placeholder {
  margin-left: 3px!important;
}
</style>