<template>
  <!-- 添加或修改机构对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    width="600px" append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      <el-row :gutter="20">
        <el-col>        
          <SelectOrgDept
            ref="selectOrgDept"
            :config="config"
            @returnNewForm="returnNewForm">
          </SelectOrgDept>
        </el-col>   
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="岗位名称" prop="postName">
            <el-input v-model.trim="form.postName" placeholder="请输入岗位名称" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="postSort">
            <el-input-number v-model="form.postSort" controls-position="right" :min="0" style="width: 190px;"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="岗位状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label
          }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="form.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :disabled="disable">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addPost, editPost } from "@/api/struct/post";

export default {
  name: "StructPostAdd",
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
      // 机构选择树
      orgOptions: [],
      // 部门选择树
      deptOptions: [],
      // 表单数据
      // label参数
      config: {
        styleType: 2,   
        businessType: "group", 
        labelWidth: "80px",
        org: {
          label: "所属机构",
          required: "true"
        },
        dept: {
          label: "所属部门",
          required: "true"
        }
      },
      form: {},
      // 表单校验
      rules: {
        postName: [
          { required: true, message: "岗位名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '岗位名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        postSort: [
          { required: true, message: "显示排序不能为空", trigger: "change" }
        ]
      }
    };
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
      this.$nextTick( () => {
        this.$refs.selectOrgDept.use(this.form)
      })
    },
    /** 子组件返回表单 */
    returnNewForm(newForm) {
      this.form.orgId = newForm.orgId
      this.form.deptId = newForm.deptId
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
      this.orgOptions = []
      this.deptOptions = []
      this.form = {};
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.disable = true
      const valid1 = new Promise((resolve, reject) => {
        this.$refs.selectOrgDept.validate( valid => {
          if(valid) {
            resolve()
          }
          else {
            this.disable = false
          }
        })
      })
      const valid2 = new Promise((resolve, reject) => {
        this.$refs.form.validate( valid => {
          if(valid) {
            resolve()
          }
          else {
            this.disable = false
          }
        })
      })
      Promise.all([valid1, valid2]).then( res => {
        this.loading = true 
        if (this.form.id) {
          editPost(this.form).then(res => {
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
          addPost(this.form).then(res => {
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
      })
    },
  }
};
</script>