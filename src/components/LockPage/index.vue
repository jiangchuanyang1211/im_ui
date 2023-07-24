<template>
  <div class="lock-wrap">
    <div>
    <el-dialog
      :visible.sync="showScreenLock"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :lock-scroll="false"
      :show-close="false"
      width="400px"
      :custom-class="'screen-lock'"
      style="border-radius: 5px;"
    >
      <div class="lock-container">
        <h3>{{ title }}</h3>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" onsubmit="return false">
          <el-form-item prop="password">
            <el-input
              type="password"
              placeholder="请输入密码"
              v-model="loginForm.password"
              @keyup.enter.native="submit"
              autocomplete="off"
              show-password
            >
              <template slot="prefix">
                <i class="el-input__icon el-icon-lock"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submit" style="width:100px">{{ buttonText }}</el-button>
            <el-button type="danger" @click="logout" style="width:100px">{{ logoutText }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
    </div>
</template>
<script>
import {unlock} from '@/api/login'
import {doSm3} from '@/utils/sm3'
import { logout } from '@/api/login'
export default {
  name: 'LockPage',
  components: {},
  data() {
   
    return {
      showScreenLock: true,
      title: "屏幕已锁定，请输入密码解锁",
      buttonText: "解锁",
      logoutText: "退出登录",
      loginForm: {
        password: "",
      },
      loginRules: {
        password: [
          { required: true, trigger: "blur", message: "请输入密码" }
        ],
      },
    };
  },
mounted(){
  this.$nextTick(()=>{
    let doc = document.getElementsByClassName('v-modal')
    doc[0].style.background="url(../../assets/images/beijin.png)";
  })
  
},
   methods: {
  
    handleLogin() {
      // 省略解锁逻辑
      this.$store.dispatch('setIsLock', false)
    },
    openScreenLock() {
      this.showScreenLock = true;
    },
    submit() {
      let data = {
        password:doSm3(this.loginForm.password),

      }
      this.$refs.loginForm.validate(valid => {
        if(valid){
          unlock(data).then(res=>{
            if(res.code==200){
              this.showScreenLock = false;
              this.loginForm.password = "";
              this.handleLogin();
            }else {
              this.$message.error("密码错误，请重新输入");
            }
          })
        }
      })
      
      
    },
    logout(){
      logout().then( () => {
          this.$store.commit('SET_ISLOGIN',false);
          localStorage.removeItem('isLogin');
          localStorage.removeItem('isLock');
          this.$store.dispatch('setIsLock',false);
          return this.$store.dispatch('LogOut')
        }).then( () => {
          location.href = '/login'
      })
    }
  },
 
    }
</script>
<style lang="scss">
.lock-wrap .screen-lock .el-dialog__wrapper {
  z-index: 99999;
}
.lock-wrap .lock-container {
  padding: 0 20px;
   text-align: center;
   margin-bottom:30px
}
.lock-wrap.lock-container h3 {
  margin-bottom: 20px;
}
.lock-wrap .el-dialog__header {
    padding: 0;
    padding-bottom: 0;
}
.lock-wrap{
  width:100%;
  height:100%;
  background-image: url('../../assets/images/beijin.png')!important;
  background-repeat: no-repeat;
  background-size: cover;

}
.lock-wrap .screen-lock{
  border-radius:5px;
}
.lock-wrap .el-dialog__body {
    padding: 20px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}

</style>