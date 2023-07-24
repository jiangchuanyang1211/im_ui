<template>
  <!-- 添加或修改角色配置对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    width="600px" append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="95px" v-loading="loading">
      
      <el-row :gutter="20">
        <el-col>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model.trim="form.roleName" placeholder="请输入角色名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col>
          <el-form-item label="权限字符" prop="roleCode">
            <el-input v-model.trim="form.roleCode" placeholder="请输入权限字符" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色顺序" prop="sortNo">
            <el-input-number v-model="form.sortNo" controls-position="right" :min="0" :max="99999" style="width: 175px;"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value"
                :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col>
          <el-form-item label="菜单权限">
            <el-checkbox 
              v-model="menuExpand" 
              @change="handleExpand">展开/折叠
            </el-checkbox>
            <el-checkbox 
              v-model="menuNodeAll" 
              @change="handleSelectAll">全选/全不选
            </el-checkbox>
            <el-tree 
              class="tree-border" ref="menu" node-key="id" show-checkbox
              :props="defaultProps" 
              :data="menuOptions" 
              :check-strictly="!menuStrictly"
              @check="getCheckNodes"
              empty-text="加载中，请稍候" 
              style="height:260px; overflow-y:auto"
            >
            </el-tree>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="form.remark" type="textarea" placeholder="请输入内容" 
            maxlength="255" show-word-limit></el-input>
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
import { getRole, addRole, editRole } from "@/api/auth/role";
import { roleMenuTreeselect as listMenuByRole } from "@/api/system/menu" 
export default {
  name: 'AuthRoleAdd',
  dicts: ['sys_normal_disable'],
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
      // 全部展开/收起
      menuExpand: false,
      // 全部选中/取消选中
      menuNodeAll: false,
      // 父子联动模式
      menuStrictly: true,
      // 菜单选项
      menuOptions: [],
      // 默认配置
      defaultProps: {
        children: "children",
        label: "menuName"
      },
      // 表单数据
      form: {},
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
          NAME_RULE,
          LENGTH_RULE_2_20
        ],
        roleCode: [
          { required: true, message: "权限字符不能为空", trigger: "blur" },
          CODE_RULE,
          LENGTH_RULE_2_20
        ],
        sortNo: [
          { required: true, message: "角色顺序不能为空", trigger: "change" },
        ],
        remark: [
          NAME_RULE,
          LENGTH_RULE_0_255
        ]
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(title, form) {
      this.reset()
      this.title = title
      this.form = form
      this.getMenuTree()
      this.visible = true
    },
    /** 获取菜单选项 */
    getMenuTree() {        
      this.menuStrictly = false
      listMenuByRole(this.form.id).then( res => {
        this.menuOptions = res.data.menus
        this.form.menuList = res.data.checkedKeys
        this.$refs.menu.setCheckedKeys(this.form.menuList)
        this.menuStrictly = true
      })
    },
    /** 展开/折叠 */
    handleExpand(value) {
      let treeOptions = this.menuOptions;
      for (let i = 0; i < treeOptions.length; i++) {
        this.$refs.menu.store.nodesMap[treeOptions[i].id].expanded = value;
      }
    },
    /** 全选/取消全选 */
    handleSelectAll(value) {
      this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
      this.getCheckNodes()
    },
    /** 父子联动 */
    handleSelectStrictly(value) {
      this.menuStrictly = value 
    },
    /** 获取选中节点 */
    getCheckNodes(n, nodes) {
      let check = this.$refs.menu.getCheckedKeys()
      let halfCheck = this.$refs.menu.getHalfCheckedKeys()
      this.form.menuList = [...check, ...halfCheck]
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
      this.menuExpand = false,
      this.menuNodeAll = false,
      this.menuOptions = []
      this.form = {};
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loading = true     
          if (this.form.id) {
            editRole(this.form).then(res => {
              this.$modal.msgSuccess("修改成功");
              this.cancel()
              this.$emit('operSuccess')
              this.loading = false
              this.disable = false
            }).catch( err => {
              this.loading = false
              this.disable = false
            })
          } else {
            addRole(this.form).then(res => {
              this.$modal.msgSuccess("新增成功");
              this.cancel()
              this.$emit('operSuccess')
              this.loading = false
              this.disable = false
            }).catch( err => {
              this.loading = false
              this.disable = false
            })
          }
        }
        else {
          this.disable = false
        }
      });
    },
  },
};
</script>