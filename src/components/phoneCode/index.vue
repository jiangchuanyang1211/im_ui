<template>
  <div>
    <el-col :span="17" :style="{width:inputWid}">
      <el-input placeholder="请输入验证码" v-model="loginForm.smsCode">
          <i slot="prefix" class="el-icon-tickets"></i>
      </el-input>
    </el-col>
    <el-col :span="6" style="padding:0;" class="height-code">
        <el-button style="padding:10px 15px;width:100px;height:100%" @click="handleSendCodeClick" :loading="isSending" :disabled="secondsLeft > 0">{{ secondsLeft > 0 ? secondsLeft + '秒' : '发送验证码' }}</el-button>
    </el-col>
 
 </div>
</template>

<script>
import {getCode } from "@/api/login";
import { getPhoneCode } from "../../api/magic/device";
export default {
  name:'PhoneCode',
  props:{
    loginForm:{
      type: Object,
      required: true
    },
    inputWid:{
      type: String,
      default:'250px'
    }
  },
  data () {
    return {
      mobileNumber: '',
      verificationCode: '',
      secondsLeft: 0,
      isSending: false,
    }
  },
  methods: {
    async handleSendCodeClick () {
      try {
        this.isSending = true
        // 替换以下代码为你自己的短信验证码发送函数
        await this.sendCode()
        this.secondsLeft = 60
        const intervalId = setInterval(() => {
          this.secondsLeft--
          if (this.secondsLeft === 0) {
            clearInterval(intervalId)
          }
        }, 1000)
      } catch (e) {
        this.$message.error('短信发送失败')
      } finally {
        this.isSending = false
      }
    },
    sendCode(){
      if(!this.loginForm.username){
        getPhoneCode();
      }else{
        let data = {
          phone:this.loginForm.username
        }
        getCode(data).then(res=>{
        },err=>{
            this.secondsLeft = 0;
        })
      }
      },
    }
    }
</script>
<style>
  .login .el-form-item__content .height-code{
    height:38px;
  }
</style>

