<template>
  <!-- 添加或修改管理员信息对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible"
    :close-on-click-modal="false" 
    width="600px" append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      
      <el-row :gutter="20" v-show="!form.id">
        <el-col :span="12">
          <el-form-item label="用户账号" prop="empId">
            <el-select 
              v-model="form.empId" 
              filterable 
              remote
              reserve-keyword
              placeholder="请输入手机号搜索用户"
              :remote-method="getAddressList"
              @focus="focusGet"
              @change="selectAddress"
            >
              <el-option
                v-for="item in addressOptions"
                :key="item.id"
                :label="item.phone + '(' + item.nickname + ')'"
                :value="item.id"
                clearable>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户姓名" prop="nickName">
            <el-input v-model.trim="form.nickName" placeholder="请输入用户姓名" maxlength="20" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">  
        <el-col :span="12">
          <el-form-item label="机构部门" prop="orgDept">
            <el-select 
              value-key="id"
              v-model="form.orgDept" 
              filterable
              multiple
              placeholder="请选择机构部门"
              @change="selectOrgDept"
            >
              <el-option
                v-for="(item, index) in orgDeptOptions"
                :key="index"
                :label="item.orgName + '/' + item.deptName"
                :value="item.orgId + '/' + item.deptId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户角色" prop="roleList">
            <el-select 
              v-model="form.roleList" 
              multiple filterable 
              value-key="id"
              placeholder="请选择角色">
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
                clearable
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-form-item label="用户状态">
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

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model.trim="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import { getAddressAsAdmin } from "@/api/struct/admin"
import { getAddress } from "@/api/struct/address"
import { listRoleByOrgDept } from "@/api/auth/role"
import { addAdmin, editAdmin } from "@/api/struct/admin";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'StructAdminAdd',
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
      // 通讯录选项
      addressOptions: [],
      // 机构部门选项
      orgDeptOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单数据
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "用户账号不能为空", trigger: "change" },
        ],
        nickName: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '用户姓名长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        orgDept: [
          { required: true, message: "机构部门不能为空", trigger: "change" },
        ],
        roleList: [
          { required: true, message: "角色不能为空", trigger: "change" },
        ],
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
      if(this.form.id) {
        // 初始化orgDept
        this.$set(this.form, "orgDept", this.form.orgDeptId.split(','))
        // 初始化roleList
        let rList = []
        this.form.roleList.map( item => {
          rList.push(item.id)
        })
        this.$set(this.form, "roleList", rList)
        // 查通讯录获取机构部门列表orgList，用于机构部门的选项
        this.getOrgList()
      }
      else {
        this.$set(this.form, "orgDept", [])
        this.$set(this.form, "roleList", [])
      }
    },
    /** 聚焦获取通讯录列表 */
    focusGet() {
      getAddressAsAdmin().then( res => {
        this.addressOptions = res.data
      })
    },
    /** 获取通讯录列表 */
    getAddressList(keyword, cb) {
      let params = {}
      if(keyword) {
        params.keyword = keyword.toString()
      }
      getAddressAsAdmin(params).then( res => {
        this.addressOptions = res.data
      })
    },
    /** 获取机构部门选项 */
    getOrgList() {
      getAddress(this.form.empId, this.getBsType()).then( res => {
        this.orgDeptOptions = res.data.orgList
        // 查询机构部门下的角色，用于角色选项
        this.getRoleList()
      })
    },
    /** 获取角色列表 */
    getRoleList() {
      let params = {
        orgList: [],
        deptList: []
      }
      this.form.orgDept.map( item => {
        params.orgList.push(item.split("/")[0])
        params.deptList.push(item.split("/")[1])
      })
      listRoleByOrgDept(params).then( res => {
        this.roleOptions = res.data
      })
    },
    /** 选择通讯录用户 */
    selectAddress(id) {
      getAddress(id, this.getBsType()).then( res => {
        this.$set(this.form, "nickName", res.data.nickname)
        this.$set(this.form, "username", res.data.phone)
        this.orgDeptOptions = res.data.orgList
        this.$refs["form"].validateField("nickName")
      })
    },
    /** 选择机构部门 */
    selectOrgDept() {
      this.$set(this.form, "roleList", [])
      this.getRoleList()
    },
    /** 设置rules */
    setRules() {
      if(this.form.id) {
        this.rules.empId[0].required = true
      }
      else {
        this.rules.empId[0].required = false
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
      this.addressOptions = [],
      this.orgDeptOptions = [],
      this.roleOptions = [],
      this.form = {};
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.orgList = []
          this.form.orgDept.map( item => {
            this.form.orgList.push(
              {
                orgId: item.split("/")[0],
                deptId: item.split("/")[1]
              }
            )
          })
          this.loading = true 
          if (this.form.id) {
            editAdmin(this.form).then(res => {
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
            addAdmin(this.form).then(res => {
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

<style  scoped>
  .postList {
    border: 1px;
    border-color: rgb(229, 230, 231);
    border-radius: 4px;
    border-style: solid;
    margin-bottom: 20px;
  }
</style>