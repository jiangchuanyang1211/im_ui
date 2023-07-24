<template>
  <!-- 添加或修改通讯录信息对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    width="700px" append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="60px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机" prop="phone">
            <el-input v-model.trim="form.phone" :disabled="!!form.id" controls-position="right" :min="0" placeholder="请输入手机号码"/>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="form.email" controls-position="right" :min="0" placeholder="请输入邮箱"/>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">     
          <el-form-item label="姓名" prop="nickname">
            <el-input v-model.trim="form.nickname" controls-position="right" :min="0" placeholder="请输入姓名"/>
          </el-form-item>

          <el-form-item label="性别">
            <el-select
              v-model="form.gender"
              placeholder="请选择性别"
              style="width:260px"
            >
              <el-option 
                v-for="dict in dict.type.sys_user_sex" 
                :key="dict.value" 
                :label="dict.label" 
                :value="dict.value">
              </el-option> 
            </el-select>
          </el-form-item>

        </el-col>
      </el-row>
      
      <el-row :gutter="20" v-show="(businessType=='partner')" type="flex" justify="end">
        <el-col >        
          <SelectOrgDept 
            ref="selectOrgDept"
            :config="config"
            @returnNewForm="returnNewForm">
          </SelectOrgDept>
        </el-col>   
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in dict.type.sys_normal_disable"
                :key="dict.value"
                :label="dict.value"
              >{{dict.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型">
            <el-radio-group v-model="form.type">
              <el-radio
                v-for="dict in dict.type.sys_address_type"
                :key="dict.value"
                :label="dict.value"
              >{{dict.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-show="(businessType=='group')">
        <el-col>
          <el-button
            type="primary" size="mini" plain
            @click="addPost">添加岗位
          </el-button>
          <el-form-item prop="orgList" label-width="0" style="margin-top: 10px">
            <el-table  max-height="200" :data="form.orgList" empty-text="暂无岗位信息">
              <el-table-column label="机构" prop="orgName">
              </el-table-column>
              <el-table-column label="部门" prop="deptName">
              </el-table-column>
              <el-table-column label="岗位" prop="postNames">
                <template slot-scope="scope">
                  <div v-for="(item, index) in scope.row.postNames" :key="index">{{item}}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100px">
                <template slot-scope="scope"> 
                  <el-button type="text" size="small" @click="editPost(scope.$index, scope.row)">编辑</el-button>
                  <el-button type="text" size="small" @click="delPost(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :disabled="disable">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <struct-address-post-add ref="postAdd" @operSuccess="updateList">
    </struct-address-post-add>

  </el-dialog>
</template>

<script>
import { getToken } from "@/utils/auth"
import { uploadFile } from "@/api/tool/uploadFile"
import { addAddress, editAddress, getAddress } from "@/api/struct/address"
import StructAddressPostAdd from "./postAdd.vue"

export default {
  name: "StructAddressAdd",
  dicts: ["sys_user_sex", "sys_normal_disable","sys_address_type"],
  components: { StructAddressPostAdd },
  data() {
    return {
      // 类型 集团 协作 特殊机构
      businessType: undefined,
      // 弹窗开启状态
      visible: false,
      // 加载状态
      loading: false,
      // 提交按钮禁用
      disable: false,
      // 弹窗标题
      title:"",
      // 图片地址
      avatarUrl: process.env.VUE_APP_BASE_API + "/file/multi/down",
      // 图片链接参数
      avatarParams: "",
      // 头像上传中
      avatarUploading: false,
      // label参数
      config: {
        styleType: 1,   
        businessType: "partner", 
        labelWidth: "60px",
        org: {
          label: "机构",
          required: "true"
        },
        dept: {
          label: "部门",
          required: "true"
        }
      },
      // 表单数据
      form: {},
      // 表单校验
      rules: {
        phone: [
          { required: true, message: "手机不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        nickname: [
          { required: true, message: "姓名不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '姓名长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: "blur"
          }
        ],
        orgList: [
          { type:"array", required: true, message: "岗位信息不能为空", trigger: "change" }
        ]
      },
    };
  },
  created() {
    this.businessType = this.getBsType()
    this.initRules()
  },
  methods: {
    // 打开弹窗
    open(title, form) {
      this.reset()
      this.title = title
      this.form = form
      this.setRules()
      // this.setAvatarParams()
      this.init()
      this.visible = true
    },
    /** 初始化 */    
    init() {
          if(this.businessType == "group") {
            this.initOrgList()
          }
          else if(this.businessType == "partner") {
            this.initOrgDept()
          }
    },
    /** 初始化岗位列表数据 */
    initOrgList() {
      if(this.form.id) {
        this.form.orgList.forEach( item => {
          item.postIds = []
          item.postNames = []
          item.postList.map( i => {
            item.postIds.push(i.id)
            item.postNames.push(i.postName)
          })
        })
      }
      else {
        this.form.orgList = []
      }
    },
    /** 初始化机构部门数据 */
    initOrgDept() {
      if(this.form.id) {
        this.form.orgId = this.form.orgList[0].orgId
        this.form.deptId = this.form.orgList[0].deptId 
      }
      this.$nextTick( () => {
        this.$refs.selectOrgDept.use(this.form)
      })
    },
    /** 初始化校验规则 */
    initRules() {
      this.config.org.required = (this.businessType=='partner') ? true : false
      this.config.dept.required = (this.businessType=='partner') ? true : false
      this.rules.orgList[0].required = (this.businessType=="group") ? true : false
    },
    /** 设置校验规则 */
    setRules() {
      this.rules.phone[0].required = this.form.id ? false : true 
      this.rules.phone[1] = this.form.id ? {} : {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
      }
    },
    /** ========group======= */
    /** 添加一条岗位数据 */
    addPost() {
      let _form = {
        orgId: undefined,
        deptId: undefined,
        postIds: [],
      }
      let _params = {
        // -1代表新增，>=0 代表编辑 数据行号
        row: -1,
        // 用于验证重复信息
        orgList: [...this.form.orgList]
      }
      this.$refs.postAdd.open("添加岗位", _form, _params)
    },
    /** 修改一条岗位数据 */
    editPost(index, row) {
      let _form = JSON.parse(JSON.stringify(row))
      let _params = {
        // -1代表新增，>=0 代表编辑 数据行号
        row: index,
        // 用于验证重复信息
        orgList: [...this.form.orgList]
      }
      this.$refs.postAdd.open("修改岗位", _form, _params)
    },
    /** 删除一条岗位数据 */
    delPost(index) {
      this.form.orgList.splice(index, 1)
    },
    /** 更新岗位数据 */
    updateList(result) {
      if(result.params.row >= 0) {
        this.$set(
          this.form.orgList, 
          result.params.row, 
          (JSON.parse(JSON.stringify(result.data)))
        )
      }
      else {
        this.$set(
          this.form.orgList, 
          this.form.orgList.length, 
          (JSON.parse(JSON.stringify(result.data)))
        )
      }
      if(result.params.index >= 0) {
        this.form.orgList.splice(result.params.index, 1)
      }
      this.$refs["form"].validateField("orgList")
    },
    /** =======partner====== */
    /** 子组件返回表单 */
    returnNewForm(newForm) {
      this.form.orgId = newForm.orgId
      this.form.deptId = newForm.deptId
    },
    // 取消按钮
    cancel() {
      this.visible = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.loading = false
      this.disable = false
      this.form = {}
      this.resetForm("form")
    },
    /** 提交按钮 */
    submitForm: function() {
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
      Promise.all([valid1, valid2]).then( () => {
        if(this.businessType == "partner") {
          this.form.orgList = [{
            "deptId": this.form.deptId,
            "orgId": this.form.orgId,
          }]
        }
        this.loading = true
        if(this.form.id) {
          editAddress(this.form, this.businessType).then(res => {
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
          addAddress(this.form, this.getBsType()).then(res => {
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
      })
    },
  }
};
</script>

<style scope>
  .avatar-uploader .el-upload {
    width: 150px;
    height: 150px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
  .avatar {
    width: 150px;
    height: 150px;
    display: block;
  }
  .postList {
    border: 1px;
    border-color: rgb(229, 230, 231);
    border-radius: 4px;
    border-style: solid;
    padding: 10px;
  }
</style>