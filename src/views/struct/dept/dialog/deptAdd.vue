<template>
  <!-- 添加或修改部门对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    width="600px" append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      
      <el-row :gutter="20">
        <el-col>
          <el-form-item label="上级机构" prop="orgId">
            <treeselect 
              v-model="form.orgId" 
              :options="orgOptions" 
              :normalizer="normalizer" 
              :disabled="false"
              :clearable="false"
              @select="selectOrg"
              placeholder="请选择机构" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col>
          <el-form-item label="上级部门" prop="parentId">
            <treeselect 
              v-model="form.parentId" 
              :options="deptOptions" 
              :normalizer="normalizer"
              :disabled="false" 
              clearable
              noOptionsText="暂无部门"
              placeholder="请选择部门" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model.trim="form.deptName" placeholder="请输入部门名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sortNo">
            <el-input-number v-model="form.sortNo" controls-position="right" :min="0" style="width: 190px;"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门编码" prop="deptCode">
            <el-input v-model.trim="form.deptCode" placeholder="请输入部门编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in dict.type.sys_normal_disable"
                :key="dict.value"
                :label="dict.value"
              >{{dict.label}}</el-radio>
            </el-radio-group>
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
import { listOrgTree } from "@/api/struct/org";
import { addDept, editDept, listDeptTree, listDeptExclude, uniqueDeptCode } from "@/api/struct/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import Treeselect from "@riophae/vue-treeselect";

export default {
  name: "StructDeptAdd",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    /** 部门编码查重 */
    const checkDeptCode = async(rule, value, callback)=> {
      if(value) {
        await uniqueDeptCode(this.form, this.getBsType()).then( res => {
          if(res.data == 0) {
            callback()
          } 
          else {
            callback( new Error("编码已被其他部门使用") )
          }
        })
      }
    }
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
      form: {},
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: "上级机构不能为空", trigger: "change" }
        ],
        deptName: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          { min: 2, max: 10, message: '部门名称长度限制在10字以内', trigger: 'blur' }
       ],
        sortNo: [
          { required: true, message: "显示排序不能为空", trigger: "change" }
        ],
        deptCode: [
          { required: true, message: "部门编码不能为空", trigger: "blur" },
          {
            pattern:/^[A-Za-z0-9]+$/,
            message: "只能包含字母和数字", 
            trigger: "blur"
          },
          { validator: checkDeptCode, trigger: "blur"}
        ]
      }
    };
  },
  watch: {
    "form.orgId": {
      handler(nv, ov) {
        this.$nextTick( () => {
          this.$refs["form"].validateField("orgId")
        })
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(title, form) {
      this.reset()
      this.title = title
      this.form = form
      this.getOrgOptions()
      this.visible = true
    },
    /** 获取上级机构选项 */
    getOrgOptions() {
      listOrgTree({}, this.getBsType()).then(res => {
        this.orgOptions = res.data;
        this.delNullChild(this.orgOptions)
      });
      if(this.form.orgId) {
        this.getDeptOptions()
      }
      else {
        this.deptOptions = []
      }
      // 处理parentId
      if(this.form.parentId == 0) {
        this.form.parentId = undefined
      }
    },
    /** 获取上级部门，by orgId*/
    getDeptOptions() { 
      if(this.form.orgId) {
        if(this.form.id) {
          listDeptExclude(this.form.orgId, this.form.id, this.getBsType()).then( res => {
            this.deptOptions = res.data
            this.delNullChild(this.deptOptions)
          })
        }
        else {
          let params = { orgId: this.form.orgId }
          listDeptTree(params, this.getBsType()).then( res => {
            this.deptOptions = res.data
            this.delNullChild(this.deptOptions)
          })
        }
      }
    },    
    /** 删除null children */
    delNullChild(data) {
      for(let i=0; i<data.length; i++) {
        if(data[i].children === null || !data[i].children.length) {
          delete data[i].children
        }
        else {
          this.delNullChild(data[i].children)
        }
      }
    },
    /** 转换数据结构 */
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
    /** 选择上级机构 */
    selectOrg(value) {
      this.form.orgId = value.id
      this.getDeptOptions()
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
    submitForm: function() {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loading = true
          if (this.form.id) {
            editDept(this.form, this.getBsType()).then(res => {
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
            addDept(this.form, this.getBsType()).then(res => {
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
    }
  }
};
</script>