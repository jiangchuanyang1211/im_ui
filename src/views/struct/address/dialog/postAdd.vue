<template>
  <!-- 添加或修改机构对话框 -->
  <el-dialog 
    :title="title" 
    :visible.sync="visible" 
    :close-on-click-modal="false"
    width="600px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      
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
        <el-col>
          <el-form-item label="人员岗位" prop="postIds">
            <el-select 
              v-model="form.postIds" 
              multiple filterable 
              @change="selectPost"
              placeholder="请选择岗位"
              style="width: 480px">
              <el-option
                v-for="item in postOptions"
                :key="item.id"
                :label="item.postName"
                :value="item.id"
                clearable
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listPostAll } from "@/api/struct/post"

export default {
  name: "StructAddressPostAdd",
  data() {
    return {
      // 弹窗开启状态
      visible: false ,
      // 弹窗标题
      title:"",
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
      // 部门选项
      postOptions: [],
      // 表单数据
      form: {},
      // 附带参数
      params: {
        // 数据行号 -1新增，>=0 编辑数据行号
        row: undefined,
        // 已有岗位数据
        orgList: [],
      },
      // 表单校验
      rules:{
        postIds: [
          { type:"array", required: true, message: "岗位不能为空", trigger: "blur" }
        ]
      }
    }
  },
  methods: {
    // 打开弹窗
    open(title, form, params) {
      this.reset()
      this.title = title
      this.form = JSON.parse(JSON.stringify(form))
      this.params = JSON.parse(JSON.stringify(params))
      this.$nextTick( () => {
        this.$refs.selectOrgDept.use(this.form)
      })
      this.init() 
      this.visible = true
    },
    /** 初始化选项数据 */
    init() {
      if(this.form.orgId && this.form.deptId) (
        this.getPostOptions()
      )
    },
    /** 获取岗位选项 */
    getPostOptions() { 
      let params = { 
        orgId: this.form.orgId, 
        deptId: this.form.deptId
      }
      listPostAll(params).then( res => {
        this.postOptions = res.data
      })
    },
    /** 子组件返回表单 */
    returnNewForm(newForm) {
      this.form = JSON.parse(JSON.stringify(newForm))
      if(this.form.deptId) {
        this.getPostOptions()
      }
    },
    /** 选择岗位 */
    selectPost(nodes) {
      this.form.postNames = []
      nodes.map( (item1, i) => {
        this.postOptions.map( (item2, j) => {
          if(item2.id == item1) {
            this.form.postNames.push(item2.postName)
          }
        })
      })
      this.$refs["form"].validateField("postIds")
    },
    // 取消按钮
    cancel() {
      this.visible = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.postOptions = []
      this.form = {
        postIds: []
      }
      this.resetForm("form")
    },
    /** 返回岗位数据 */
    submitForm() {
      const valid1 = new Promise((resolve, reject) => {
        this.$refs.selectOrgDept.validate( valid => {
          if(valid) {
            resolve()
          }
        })
      })
      const valid2 = new Promise((resolve, reject) => {
        this.$refs.form.validate( valid => {
          if(valid) {
            resolve()
          }
        })
      })
      Promise.all([valid1, valid2]).then( () => {
        let result = {
          params: JSON.parse(JSON.stringify(this.params)),
          data: JSON.parse(JSON.stringify(this.form))
        }
        // 验证是否与其他数据重复
        this.params.orgList.map( (item, i) => {
          if(
            i != this.params.row &&
            item.orgId == this.form.orgId &&
            item.deptId == this.form.deptId
          ) {
            result.params.index = i
          }
        })
        // 已含有相同机构部门的数据
        if( result.params.index >= 0 ) {
          this.$confirm("表格中已有相同机构部门的数据，是否替换？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          }).then( () => {
            this.$emit("operSuccess", result)
            this.cancel()
          }).catch( () => {} )
        } 
        // 不含有相同机构部门的数据
        else {
          this.$emit("operSuccess", result)
          this.cancel()
        }
      })
    },
  }
}
</script>
