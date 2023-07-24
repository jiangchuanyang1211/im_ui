<template>
  <!-- 机构部门选择框 -->
  <el-form ref="form" :model="form" :rules="rules" :label-width="config.labelWidth">
    <!-- 单行显示 -->
    <el-row :gutter="20">
      <el-col :span="config.styleType==1?12:24">
        <el-form-item :label="config.org.label" prop="orgId">
          <treeselect 
            v-model="form.orgId" 
            :options="orgOptions" 
            :normalizer="normalizer" 
            :clearable="false"
            @select="selectOrg"
            noOptionsText="暂无机构"
            placeholder="请选择机构" />
        </el-form-item>
      </el-col>

      <el-col :span="config.styleType==1?12:24">
        <el-form-item :label="config.dept.label" prop="deptId">
          <treeselect 
            v-model="form.deptId" 
            :options="deptOptions" 
            :normalizer="normalizer"
            :clearable="false"
            @select="selectDept"
            noOptionsText="暂无部门"
            placeholder="请选择部门" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { listOrgTree } from "@/api/struct/org";
import { listDeptTree } from "@/api/struct/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "SelectOrgDept",
  components: { Treeselect },
  props: {
    config: {
      type: Object,
      default() {
        return {
          // 1 单行双列  2 双行单列
          styleType: 1,  
          businessType: "group", 
          labelWidth: "80px",
          org: {
            label: "机构",
            required: "true"
          },
          dept: {
            label: "部门",
            required: "true"
          }
        }
      }
    },
    status:{
      type:Number,
      default:0
    }
  }, 
  data() {
    return {
      // 机构选择树
      orgOptions: [],
      // 部门选择树
      deptOptions: [],
      // 表单数据
      form: {},
      // 表单校验
      rules:{
        orgId: [
          { required: true, message: "机构不能为空", trigger: "change" }
        ],
        deptId: [
          { required: true, message: "部门不能为空", trigger: "change" }
        ],
      }
    }
  },
  watch: {
    "config.org.required": {
      immediate: true,
      handler(newV, oldV) {
        this.rules.orgId[0].required = newV
      }
    },
    "config.dept.required": {
      immediate: true,
      handler(newV, oldV) {
        this.rules.deptId[0].required = newV
      }
    },
  },
  methods: {
    // 打开弹窗
    use(form) {
      this.reset()
      this.form = JSON.parse(JSON.stringify(form))
      this.initOptions()
    },
    /** 初始化选项数据 */
    initOptions() {
      this.getOrgOptions()
      if(this.form.orgId) (
        this.getDeptOptions()
      )
    },
    /** 获取上级机构选项 */
    getOrgOptions() {
      let param = {}
      if(this.status!=0){
        param = {status:this.status}
      }
      listOrgTree(param, this.config.businessType).then(res => {
        this.orgOptions = res.data;
        this.delNullChild(this.orgOptions)
      });
    },
    /** 获取部门选项 */
    getDeptOptions() { 
      let params = { orgId: this.form.orgId }
      if(this.status!=0){
        params = {status:this.status,orgId: this.form.orgId}
      }
      listDeptTree(params, this.config.businessType).then( res => {
        this.deptOptions = res.data
        this.delNullChild(this.deptOptions)
      })
    },  
    /** 选择机构 */
    selectOrg(node) {
      this.$set(this.form, "orgId", node.id)
      this.$set(this.form, "orgName", node.name)
      this.$set(this.form, "deptId", undefined)
      this.$set(this.form, "deptName", undefined)
      this.deptOptions = []
      this.$refs["form"].validateField("orgId")
      this.$emit("returnNewForm", this.form)
      this.getDeptOptions()
    },
    /** 选择部门 */
    selectDept(node) {
      this.$set(this.form, "deptId", node.id)
      this.$set(this.form, "deptName", node.name)
      this.$refs["form"].validateField("deptId")
      this.$emit("returnNewForm", this.form)
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
    // 表单重置
    reset() {
      this.orgOptions = []
      this.deptOptions = []
      this.form = {}
      this.resetForm("form")
    },
    validate(callback) {
      this.$refs.form.validate( valid => {
        callback(valid)
      })
    }
  }
}
</script>