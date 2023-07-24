<template>
  <div class="login">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">魔盒企业版管理系统</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="goSlider"
          show-password
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width:100%;"
          @click.native.prevent="goSlider"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
<!--      <span>Copyright © 2018-2022 imi.vip All Rights Reserved.</span>-->
    </div>
    <el-dialog
      title="密码修改"
      :visible.sync="dialogVisible"
      width="450px"
      :before-close="handleClose"
      >
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="80px" class="demo-ruleForm">
        <el-form-item label="密码" prop="pass">
          <span slot="label">
            <el-tooltip content="首次登录请修改密码,密码需12-16位包含数字，大写字母，小写字母，特殊字符" placement="top">
            <i class="el-icon-question"></i>
            </el-tooltip>
            密码
          </span>
          <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')" v-throttle>提交</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
        <el-button @click="handleClose">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="请拖动滑块完成拼图" width="360px" :visible.sync="isShowSliderVerify" :close-on-click-modal="false" @closed="refresh" append-to-body>
        <SliderVertify ref="sliderCom" @success="onSuccess" @fail="onFail" @again="onAgain"/>
      </el-dialog>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import SliderVertify from '@/components/SliderVertify'
export default {
  name: "SuperLogin",
  components:{SliderVertify},
  data() {
    let validatePass = function(rule, value, callback){
      if(!value || value==""){
        callback(new Error('请输入密码'));
      }else{
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?!.*\s).{12,16}$/
        if(!regex.test(value)){
          callback(new Error('请输入密码包含数字，大写字母，小写字母，特殊字符'));
        }else{
          callback()
        }
      
      }
    };
    var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
    return {
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        // code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: false,
      redirect: undefined,
      dialogVisible:false,
      ruleForm:{

      },
      rules:{
        pass: [
        { min:12,max:16, message: '密码需12到16位', trigger: 'blur' },
        {validator: validatePass,required: true,trigger: "blur"},
        ],
        checkPass: [
          {validator: validatePass2,required: true,trigger: "blur"}
        ],
      },
      isShowSliderVerify:false,


    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCookie();
  },
  methods: {
   
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : password,
      };
    },
    goSlider(){
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.isShowSliderVerify = true;
          self.$refs?.sliderCom?.verifySuccessEvent();
        }
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          Cookies.remove("username");
          Cookies.remove("password");
          this.$store.dispatch("SuperLogin", this.loginForm).then((res) => {
            if(res.data.changePwd){
              this.dialogVisible = true;
            }else{
              this.$store.commit('SET_ISLOGIN',true);
              localStorage.setItem('isLogin','isLogin')
              this.$router.push({ path: this.redirect || "/struct/address" }).catch(()=>{});
            }
          }).catch(() => {
            this.loading = false;
            this.refresh();
          });
        }
      });
    },
   
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.loading = false;
          this.dialogVisible = false,
          this.$refs.ruleForm.resetFields();
          removeToken();
          done();

        }).catch(_ => {});
    },
    submitForm(form){
      this.$refs[form].validate(valid => {
        if(valid){
          let _form = {
            newPassword: doSm3(this.ruleForm.pass),
            oldPassword: doSm3(this.loginForm.password)
          }
          updatePwd(_form).then( res => {
            this.$modal.msgSuccess(this.$enum.EDIT_SUCCESS);
            this.dialogVisible = false,
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          });
        }
      })
    },
        /* 滑动验证成功*/
    onSuccess(captcha) {
      Object.assign(this.loginForm, captcha);
      this.handleLogin();
    },
    /* 滑动验证失败*/
    onFail(msg) {
      this.message('error', msg || '验证失败，请控制拼图对齐缺口');
    },
    /* 滑动验证异常*/
    onAgain() {
      this.message('error', '滑动操作异常，请重试');
    },
    /* 刷新验证码*/
    refresh() {
      this.$refs.sliderCom.refresh();
    },
    /* 提示弹框*/
    message(type, message) {
      this.$message({
        showClose: true,
        type: type,
        message: message,
        duration: 1500,
      });
    },

  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/beijin.png");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 35px 25px 25px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 29%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}
</style>
