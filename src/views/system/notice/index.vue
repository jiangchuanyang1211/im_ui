<template>
  <div class="app-container">
    <!-- 搜索行 -->
    <base-search 
      :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:notice:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:notice:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:notice:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 表格 -->
    <ZfTable ref="myTable" :table-head-titles="columns" :isNeedSelection="true" :isSearch="isSearch" :url="url"
      :query-params="queryParams" @handleSelectionChange="handleSelectionChange" :showSearch="showSearch">
      <template v-slot:status="{ RowInfo }">
        <dict-tag :options="dict.type.sys_notice_status" :value="RowInfo.row.status" />
      </template>
      <template v-slot:createTime="{ RowInfo }">
        <span>{{ parseTime(RowInfo.row.createTime)}}</span>
      </template>
      <template v-slot:default="{ RowInfo }">
        <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(RowInfo.row)"
          v-hasPermi="['system:notice:edit']">修改</el-button>
        <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(RowInfo.row)"
          v-hasPermi="['system:notice:remove']">删除</el-button>
      </template>
    </ZfTable>

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="title" :visible.sync="isOpen" width="680px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">

        <el-row>
          <el-col :span="24">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="公告状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_notice_status" :key="dict.value"
                  :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
              
            </el-form-item>
          </el-col>
          
        </el-row>
      <el-row :gutter="20">
        <el-col>
          <el-form-item label="机构部门" prop="noticeOrgList">
            <el-checkbox 
              v-model="deptExpand" 
              @change="handleExpand">展开/折叠
            </el-checkbox>
            <el-checkbox 
              v-model="deptNodeAll" 
              @change="handleSelectAll">全选/全不选
            </el-checkbox>
            <el-tree 
              class="tree-border" ref="dept" node-key="id"
              v-loading="treeLoading"
              :props="defaultProps" 
              :data="treeOptions" 
              :check-strictly="false"
              :show-checkbox="true"
              :expand-on-click-node="true"
              :default-expanded-keys="expandNodes"
              :default-expand-all="deptExpand"
              empty-text="请先选择部门" 
              style="height:160px; overflow-y:auto"
            >
            </el-tree>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
            <el-form-item label="公告内容">
              <editor v-model="form.noticeContent" :min-height="192" />
            </el-form-item>
          </el-col>
      </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-throttle>确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listNotice, getNotice, delNotice, addNotice, updateNotice,listOrgDeptByNoticeId} from "@/api/system/notice";
import { listOrgDept } from "@/api/struct/org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getToken } from "@/utils/auth";
export default {
  name: "Notice",
  components: { Treeselect },
  dicts: ['sys_notice_status' ],
  data() {
    return {
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
        {name: "noticeTitle", label: "公告标题", type: "input", param: "", placeholder: "请输入公告标题"},
        {name: "status", label: "公告状态", type: "select", param: "",  placeholder: "公告状态", dict: "sys_notice_status"},
      ],
      // 公告表格数据
      noticeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      isOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        status:undefined
      },
      // 列信息
      columns: [
        { name: "id", key: 0, label: `序号`, visible: false, width: 100 },
        { name: "noticeTitle", key: 1, label: `公告标题`, visible: true },
        { name: "status", key: 3, label: `状态`, visible: true, slot: true },
        { name: "createUserName", key: 4, label: `创建者`, visible: true },
        { name: "createTime", key: 4, label: `创建时间`, visible: true , slot: true },
      ],
      // 查询方法
      url: (parms) => {
        return listNotice(parms);
      },
      // 查询调用标识
      isSearch: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        noticeTitle: [
          { required: true, message: "公告标题不能为空", trigger: "blur" },
          this.$enum.NAME_RULE,
          this.$enum.LENGTH_RULE_2_20
        ],
        noticeOrgList: [
          { required: true, message: "部门不能为空", trigger: "blur" },
        ],
      },
      // 机构选择树
      treeOptions: [],
      // 展开节点
      expandNodes: [],
      // 全部展开/收起
      deptExpand: true,
      // 全部选中/取消选中
      deptNodeAll: false,
      // 父子联动模式
      deptStrictly: false,
      // 默认配置
      defaultProps: {
        children: "children",
        label: "name"
      },
      token:'',
      names:[],
      treeLoading:true,
    };
  },
  created(){
    this.token = getToken();
  },
  methods: {
    /** 查询公告列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    // 取消按钮
    cancel() {
      this.isOpen = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.treeLoading = true;
      this.deptExpand = true,
      this.deptNodeAll = false,
      this.treeOptions = []
      this.form = {
        id: undefined,
        noticeTitle: undefined,
        noticeContent: undefined,
        noticeOrgList:undefined,
        status: 1
      };
      this.resetForm("form");
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.names = selection.map(item => item.noticeTitle)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      let title = "添加公告";
      let form = {};
      form.status  = 1;
      this.open(title,form)
    },
    setForm(data){
      if(data){
        this.form.id = data.id;
        this.form.noticeTitle = data.noticeTitle;
        this.form.noticeContent = data.noticeContent;
        this.form.status = data.status;
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      let id  = row.id || this.ids
      getNotice(id).then(response => {
        this.setForm(response.data);
        this.form.noticeContent = this.form.noticeContent.replace('{token}',`access_token=${this.token}`);
        this.isOpen = true;
        this.title = "修改公告";
        listOrgDept(this.getBsType()).then(res1 => {
           this.treeOptions = this.deleteNodes(res1.data); 
          let ids = [];
          response.data.noticeOrgList?.map(item=>{
            ids.push(item.deptId)
          })
          this.$refs.dept.setCheckedKeys(ids);
          this.deptExpand = true;
          this.treeLoading = false
        })
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.checkNodes();
      this.$refs["form"].validate(valid => {
        if (valid) {
          let temp = this.form.noticeContent;
          temp = temp.split('&amp;')[1];
          this.isOpen = false;
          this.form.noticeContent = this.form.noticeContent.replace(temp,'{token}')
          if (this.form.id != undefined) {
            updateNotice(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
            });
          } else {
            addNotice(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const noticeIds = row.id?[row.id]:this.ids
      this.$modal.confirm('是否确认删除公告标题为"' + this.names + '"的数据项？').then(function () {
        return delNotice(noticeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },

     /** 打开弹窗 */
     open(title, form) {
      this.reset()
      this.title = title
      this.init();
      this.form = form
      this.isOpen = true
      this.$refs?.dept?.setCheckedKeys(form?.noticeOrgList || []);
    },
    /** 初始化 */
    init() {
      this.getTreeOptions()
    },
    /** 获取上级机构选项 */

    getTreeOptions() {
      listOrgDept(this.getBsType()).then(res1 => {
        this.treeOptions = this.deleteNodes(res1.data); 
        this.$set(this.expandNodes, 0, this.treeOptions[0].id);
        this.treeLoading = false
      })
      
    },
    deleteNodes(tree) {
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.type === 'org' && (!node.children || node.children.length < 1)) {
          tree.splice(i, 1);
          i--;
        } else if (node.children && node.children.length > 0) {
          this.deleteNodes(node.children);
        }
      }
      return tree;
    },
    /** 删除null children */
    setChecked(data) {
      for(let i=0; i<data.length; i++) {
        this.$set(data[i], "checked", this.form.noticeOrgList.includes(data[i].id))
        this.setChecked(data[i].children)
      }
    },
    /** 转换机构数据结构*/
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    /** 展开/折叠 */
    handleExpand(value) {
      let treeOptions = this.treeOptions;
      for (let i = 0; i < treeOptions.length; i++) {
        this.$refs.dept.store.nodesMap[treeOptions[i].id].expanded = value;
      }
    },
    /** 全选/取消全选 */
    handleSelectAll(value) {
      this.$refs.dept.setCheckedNodes(value ? this.treeOptions : []);
    },
    /** 父子联动 */
    handleSelectStrictly(value) {
      // this.deptStrictly = value 
    },
    /** 获取选中节点 */
    checkNodes(data, checked, indeterminate) {
       let choose = this.$refs.dept.getCheckedNodes();
       let _noteDeptList = []
         choose.map(item=>{
          if(item.type=='dept'){
            _noteDeptList.push(item.id)
          }
         })
        this.$set(this.form, "noticeOrgList", _noteDeptList)
    },
    
  }
};
</script>