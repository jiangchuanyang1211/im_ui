<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password/>
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password/>
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认新密码" type="password" show-password/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updatePwd } from "@/api/struct/admin";
import { doSm3 } from '@/utils/sm3'
import { logout } from '@/api/login'
import store from '@/store'

export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        oldPassword: [
          { required: true, message: "旧密码不能为空", trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          {
            pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=`~\[\]{}|;':",.\/<>?])[0-9a-zA-Z!@#$%^&*()_+\-=`~\[\]\\;',./{}|:"<>?]/,
            message: "密码需包含数字，大写字母，小写字母，特殊字符", 
            trigger: "blur"
          },
          { min: 12, max: 16, message: '密码长度需在12至16位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let _form = {
            newPassword: doSm3(this.user.newPassword),
            oldPassword: doSm3(this.user.oldPassword)
          }
          updatePwd(_form).then( res => {
            this.$modal.msgSuccess("修改成功");
            this.resetForm("form");
            logout().then( () => {
              this.$store.commit('SET_ISLOGIN',false);
              localStorage.removeItem('isLogin')
              return store.dispatch('LogOut')
            }).then( () => {
              location.href = '/login'
            })
          });
        }
      });
    },
    close() {
      this.$tab.closePage();
    }
  }
};
</script>
