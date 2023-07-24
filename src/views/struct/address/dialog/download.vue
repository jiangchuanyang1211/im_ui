<template>
  <!-- <el-button type="text" @click="dialogFormVisible = true">打开嵌套表单的 Dialog</el-button> -->
  <el-dialog :title="title" :visible.sync="downloadVisible" :close-on-click-modal="false" width="26%" >
    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item label="时间" :label-width="formLabelWidth" prop="dateRange">
        <!-- value-format="yyyy-MM-dd" -->
        <el-date-picker v-model="form.dateRange" style="width: 240px;margin-left:10px"  type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']"></el-date-picker>
      </el-form-item>
      <el-form-item label="短信验证码" :label-width="formLabelWidth" prop="smsCode">
        <el-row :gutter="20">
          <!-- <el-col :span="17">
              <el-input placeholder="请输入验证码" v-model="form.code">
                  <i slot="prefix" class="el-icon-tickets"></i>
              </el-input>
          </el-col>
          <el-col :span="2" style="padding-left:0">
              <el-button style="width:90px;padding:10px" @click="sendCode" :disabled="disabled">{{ btnText }}</el-button>
          </el-col> -->
          <PhoneCode :loginForm="form" inputWid="260px"></PhoneCode>
        </el-row>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {exportData} from '@/api/magic/device'
import PhoneCode from '@/components/phoneCode';
export default {
  name:'DownloadDataDialog',
  components:{
    PhoneCode
  },
  data(){
    var validateCode = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请输入验证码'));
        } else {
            if (!/^\d{6}$/.test(value)) {
                callback(new Error('请输入6位数字'));
            }
            callback();
        }
    }
    return {
      downloadVisible:false,
      title:'导出交流数据',
      form:{
        smsCode:'',
        dateRange: []
      },
      userId:'',
      formLabelWidth:"95px",
      btnText: "发送验证码",
      rules: {
        smsCode: [
            { required: true, trigger: "blur", message: "请输入验证码" },
            { validator: validateCode, trigger: 'blur' },
        ],
        dateRange:[
        { required: true, trigger: "blur", message: "请选择时间段" },
        ]
      },
      disabled:false,
      style:''
      
    }
  },
  methods:{
     // 打开弹窗
     open(id) {
      this.downloadVisible = true;
      this.userId = id;

    },
    // 取消按钮
    cancel() {
      this.downloadVisible = false,
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let data = {
            beginTime:Date.parse(this.form.dateRange[0]),
            endTime:	Date.parse(this.form.dateRange[1]),
            userId:this.userId,
            verifyCode:this.form.smsCode
          }
          this.downloadVisible = false;
          exportData(data).then(()=>{
            this.$modal.msgSuccess("导出成功");
            this.cancel()
          }).catch(()=>{
            this.cancel()
          })
          
        }
      });
    },
    sendCode(){

    }
  }

}
</script>

<style>

</style>