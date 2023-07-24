<template>
  <!-- 分配管理员对话框 -->
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
        <el-col :span="12" >
          <el-button 
            type="primary" plain icon="el-icon-plus" size="mini" 
            @click="addAdmin(null, uList.length)">新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-form label-width="70px">
      <div class="adminList" style="height:260px; overflow-y:auto"> 
        <el-row 
          :gutter="10" type="flex" align="middle" style="margin: 10px"
          v-for="(item, index) in uList" :key="index"  
        >
          <el-col :span="10">
            <el-form-item label="用户名称" prop="item.userId" style="margin-bottom: 0px">
              <el-select
                v-model="item.userId"
                filterable
                placeholder="请选择用户"
              >
                <el-option 
                  v-for="i in adminOptions" 
                  :key="i.userId" 
                  :label="i.nickName + '(' +i.username + ')'"  
                  :value="i.userId"
                  :disabled="!!uList.find( j => j.userId == i.userId )"
                >
                </el-option> 
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="数据权限" prop="item.scope" style="margin-bottom: 0px">
              <el-select 
                v-model="item.scope"
                placeholder="请选择数据权限">
                <el-option 
                  v-for="dict in dict.type.sys_data_scope" 
                  :key="dict.value" 
                  :label="dict.label" 
                  :value="dict.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-row type="flex" justify="end">
              <el-button
                type="danger" circle plain icon="el-icon-delete" size="mini"
                @click="delAdmin(item, index)">
              </el-button>
              <el-button
                type="primary" circle icon="el-icon-plus" size="mini"
                @click="addAdmin(item, index)">
              </el-button>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :disabled="disable">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { allocAdmin, listAdminByRoleId } from "@/api/auth/role";

export default {
  name: 'AllocAdmin',
  dicts: ['sys_data_scope'],
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
      // 管理员选项
      adminOptions:[],
      // 添加管理员
      uList: [],
      // 表单数据
      form: {},
      // 表单校验
      rules: {},
    }
  },
  methods: {
    /** 打开弹窗 */
    open(title, form) {
      this.reset()
      this.title = title
      this.form = form
      this.getAdmins()
      this.visible = true
    },
    /** 获取管理员 */
    getAdmins() {
      // 清空
      this.adminOptions = []
      this.uList = []
      listAdminByRoleId(this.form.roleId).then( res => {
        res.data.bindUsers.forEach( item => {
          item.userId = item.id
          this.uList.push({
            userId: item.id,
            scope: item.scope,
          })
        })
        res.data.unBindUsers.forEach( item => {
          item.userId = item.id
        })
        // 合并生成adminOptions
        this.adminOptions = [...res.data.bindUsers, ...res.data.unBindUsers]
        if(this.uList.length == 0) {
          this.uList.push( { userId: "", scope: 5 } )
        }
      })
    },
    /** 添加关联管理员 */
    addAdmin(item,index) {
      this.uList.splice(index + 1, 0, {userId: "",scope: 5})
    },
    /** 删除关联管理员 */
    delAdmin(item,index) {
      this.uList.splice(index, 1)
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
      this.adminOptions = []
      this.uList = []
      this.form = {}
      this.resetForm("form")
    },
    /** 提交按钮 */
    submitForm: function () {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.confirmSub()
        }
        else {
          this.disable = false
        }
      });
    },
    /** list验证 */
    confirmSub() {
      if( this.uList.find( item => item.userId == "" ) ) {
        this.$alert(
          "请完善用户信息", 
          "提示", 
          { confirmButtonText: "确定" }
        )
      }
      else {
        this.form.userList = this.uList
        this.loading = true
        allocAdmin(this.form).then(res => {
          this.$modal.msgSuccess("分配成功");
          this.cancel()
          this.$emit('operSuccess')
          this.loading = false
          this.disable = false
        }).catch( err => {
          this.loading = false
          this.disable = false
        })
      }
    },
  },
};
</script>

<style scoped>
  .adminList {
    border: 1px;
    border-color: rgb(229, 230, 231);
    border-radius: 4px;
    border-style: solid;
    margin-top: 10px;
  }
</style>