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
          <el-form-item label="上级机构" prop="parentId">
          <treeselect 
            v-model="form.parentId" 
            :options="orgOptions" 
            :normalizer="normalizer"
            :clearable="false"
            placeholder="请选择机构" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="机构名称" prop="orgName">
            <el-input v-model.trim="form.orgName" placeholder="请输入机构名称" />
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
          <el-form-item label="机构编码" prop="orgCode">
            <el-input v-model.trim="form.orgCode" placeholder="请输入机构编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构状态">
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
import { addOrg, editOrg, listOrgTree, listOrgExclude, uniqueOrgCode } from "@/api/struct/org";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import Treeselect from "@riophae/vue-treeselect";

export default {
  name: "StructOrgAdd",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    /** 机构编码查重 */
    const checkOrgCode = async(rule, value, callback)=> {
      if(value) {
        await uniqueOrgCode(this.form, this.getBsType()).then( res => {
          if(res.data == 0) {
            callback()
          } 
          else {
            callback( new Error("编码已被其他机构使用") )
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
      // 表单数据
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: "上级机构不能为空", trigger: "change" }
        ],
        orgName: [
          { required: true, message: "机构名称不能为空", trigger: "blur" },
          { min: 2, max: 10, message: '机构名称长度限制在10字以内', trigger: 'blur' }
        ],
        sortNo: [
          { required: true, message: "显示排序不能为空", trigger: "change" }
        ],
        orgCode: [
          { required: true, message: "机构编码不能为空", trigger: "blur" },
          {
            pattern:/^[A-Za-z0-9]+$/,
            message: "只能包含字母和数字", 
            trigger: "blur"
          },
          { validator: checkOrgCode, trigger: "blur"}
        ],
      }
    };
  },
  watch: {
    "form.parentId": {
      handler(nv, ov) {
        this.$nextTick( () => {
          this.$refs["form"].validateField("parentId")
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
      if(this.form.id) {
        listOrgExclude(this.form.id, this.getBsType()).then( res => {
          this.orgOptions = res.data
          this.delNullChild(this.orgOptions)
        })
      }
      else {
        listOrgTree({}, this.getBsType()).then( res => {
          this.orgOptions = res.data
          this.delNullChild(this.orgOptions)
        })
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
    /** 转换机构数据结构 */
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
      this.form = {};
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function() {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loading = true  
          if(this.form.id) {
            editOrg(this.form, this.getBsType()).then(res => {
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
            addOrg(this.form, this.getBsType()).then(res => {
              this.$modal.msgSuccess("添加成功");
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