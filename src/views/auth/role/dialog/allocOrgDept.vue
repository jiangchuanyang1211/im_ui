<template>
  <!-- 分配机构部门对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    width="600px" append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="12" >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="form.roleName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" >
          <el-form-item label="权限字符" prop="roleCode">
            <el-input v-model="form.roleCode" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col>
          <el-form-item label="部门">
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
              :props="defaultProps" 
              :data="treeOptions" 
              :check-strictly="!deptStrictly"
              :show-checkbox="false"
              :expand-on-click-node="true"
              :default-expanded-keys="expandNodes"
              empty-text="请先选择机构" 
              style="height:260px; overflow-y:auto"
            >
              <span slot-scope="{ node, data }">
                <el-checkbox 
                  v-if="data.type=='dept'" style="margin-right: 8px" 
                  v-model="data.checked" @change="checked=>checkNodes(checked, data)"
                  @click.stop.native="()=>{}"
                ></el-checkbox>
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :disabled="disable">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listOrgDept } from "@/api/struct/org";
import { listOrgDeptByRoleId } from "@/api/auth/role";
import { allocOrgDept } from "@/api/auth/role";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";


export default {
  name: 'AllocOrgDept',
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // 弹窗开启状态
      visible: false,
      // 加载状态
      loading: false,
      // 提交按钮禁用
      disable: false,
      // 弹窗标题
      title:"",
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
      // 表单数据
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(title, form) {
      this.reset()
      this.title = title
      this.form = form
      this.init()
      this.visible = true
    },
    /** 初始化 */
    init() {
      this.getTreeOptions()
    },
    /** 获取上级机构选项 */

    getTreeOptions() {
      listOrgDept(this.getBsType()).then(res1 => {
        this.treeOptions = res1.data; 
        this.$set(this.expandNodes, 0, this.treeOptions[0].id)
        return listOrgDeptByRoleId(this.form.roleId)
      }).then( res2 => {
        this.form.deptIds = res2.data
        this.setChecked(this.treeOptions)
        
      })
    },
    /** 设置选中状态 */
    setChecked(data) {
      for(let i=0; i<data.length; i++) {
        this.$set(data[i], "checked", this.form.deptIds.includes(data[i].id))
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
      this.setAll(this.treeOptions, value)
    },
    /** 全选/全不选 */
    setAll(data, val) {
      for(let i=0; i<data.length; i++) {
        this.$set(data[i], "checked", val)
        this.setAll(data[i].children, val)
        this.checkNodes(val, data[i])
      }
    },
    /** 父子联动 */
    handleSelectStrictly(value) {
      // this.deptStrictly = value 
    },
    /** 获取选中节点 */
    checkNodes(val, data) {
      if(val) {
        if(!this.form.deptIds.includes(data.id) && data.type=="dept") {
          this.form.deptIds.push(data.id)
        }
      }
      else {
        let _deptIds = this.form.deptIds.filter(item => item != data.id)
        this.$set(this.form, "deptIds", _deptIds)
      }
    },
    /** 取消按钮 */
    cancel() {
      this.visible = false,
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.loading = false
      this.disable = false
      this.deptExpand = true,
      this.deptNodeAll = false,
      this.treeOptions = []
      this.form = {};
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loading = true
          allocOrgDept(this.form).then(res => {
            this.$modal.msgSuccess("修改成功");
            this.cancel()
            this.$emit('operSuccess')
            this.loading = false
            this.disable = false
          }).catch( err => {
            this.loading = false
            this.disable = false
          })
        }
        else {
          this.disable = false
        }
      });
    },
  },
};
</script>