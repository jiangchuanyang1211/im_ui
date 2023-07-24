<template>
    <!-- 添加APP包对话框 -->
    <el-dialog :title="title" :visible.sync="visible" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      
        <el-row>
          <el-col>
            <el-form-item label="版本号" prop="packageVersion">
              <el-input v-model.trim="form.packageVersion" controls-position="right" :min="0" placeholder="请输版本号"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="强制更新" prop="force">
              <el-radio-group v-model="form.force">
                <el-radio
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.package_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="安装包" prop="packageName">
              <el-input v-model="form.packageName" placeholder="请上传包文件" disabled/>
            </el-form-item>
          </el-col>

        <el-col :span="4">
          <el-upload
            ref="upload"
            :action="upload.url"
            :headers="upload.headers"
            :data="upload.data"
            accept=".bin"
            :limit="1"
            :show-file-list="false"
            :auto-upload="true"
            :before-upload="beforUpload"
            :on-success="uploadSuccess"
            :on-error="uploadErr"
            :on-progress="uploadProgress"
            v-loading="uploading"
          >
            <el-button 
              ref="uploadButton"
              type="info" plain
              icon="el-icon-upload2" 
              size="mini" 
              style="margin-top: 4px">上传
            </el-button>
          </el-upload>

          <el-progress 
            v-show="uploading"
            type="line" :show-text="false" 
            :percentage="progress" 
            style="margin-top:5px;width:73px">
          </el-progress>
        </el-col>
        </el-row>
        
        <el-row>  
          <el-col>
            <el-form-item label="备注">
              <el-input v-model.trim="form.description" type="textarea" placeholder="请输入更新描述"></el-input>
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
import { getToken } from "@/utils/auth";
import { addFirmware, checkFirmwareVersion } from "@/api/package/firmware";

export default {
  name: "FirmwarePackageAdd",
  dicts: [ "sys_yes_no", "package_normal_disable", ],
  data() {
    /** 固件包版本查重 */
    const checkVersion = async(rule, value, callback)=> {
      if(value) {
        let params = { version: this.form.packageVersion }
        await checkFirmwareVersion(params).then( res => {
          if(res.data == 0) {
            callback()
          } 
          else {
            callback( new Error("版本已存在") )
          }
        })
      }
    }
    return {
      // 弹窗开启状态
      visible: false,
      // 加载状态
      loading: false,
      // 提交按钮禁用
      disable: false,
      // 弹窗标题
      title:"",
      // 表单数据
      form: {},
      // 文件上传中
      uploading: false,
      // 文件上传进度
      progress: 0,
      // 上传
      upload: {
        url: process.env.VUE_APP_BASE_API + "/file/multi/upload",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        data: {
          businessType: 5,
        }
      },
      // 表单校验
      rules: {
        packageVersion: [
          { required: true, message: "版本号不能为空", trigger: "blur" },
          { validator: checkVersion, trigger: "blur"}
        ],
        packageName: [
          { 
            required: true, 
            message: "请上传包文件",
            trigger: "change" 
          }
        ]
      }
    };
  },

  methods: {
    // 打开弹窗
    open(title, form) {
      this.reset()
      this.title = title
      this.form = form 
      this.visible = true
    },
    // 上传前
    beforUpload() {
      this.uploading = true
    },
    // 上传中
    uploadProgress(event, file, fileList) {
      if(event.percent >= 100) {
        this.progress = 100
      }
      else {
        this.progress = Math.floor(event.percent)
      }
    },
    // 上传成功
    uploadSuccess(response, file, fileList) {
      this.uploadComplete(response, file)
    },
    // 上传失败
    uploadErr(err, file, fileList) {
      this.uploadComplete(err, file)
    },
    // 上传完成处理
    uploadComplete(res, file) {
      this.$set(this.form, "packageName", (res.code==200 ? file.name : undefined))
      this.form.size = res.code==200 ? file.size : undefined
      this.form.path = res.code==200 ? res.data.path : undefined
      this.form.checksum = res.code==200 ? res.data.sign : undefined
      this.uploadReset()
      if(res.code==200) {
        this.$modal.msgSuccess("包文件上传成功")
      }
      else {
        this.$modal.msgError(res.msg ? res.msg : "文件上传失败")
      }
    },
    // 上传重置
    uploadReset() {
      this.progress = 0
      this.$refs.upload.clearFiles()
      this.uploading = false 
      this.$refs.upload.$el.blur()
    },
    // 取消按钮
    cancel() {
      this.visible = false,
      this.$refs.upload.abort()
      this.reset()
      this.uploadReset()
    },
    // 表单重置
    reset() {
      this.loading = false
      this.disable = false
      this.form = {};
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function() {
      this.disable = true
      this.$refs["form"].validate(valid => {
        if(valid) {
          this.loading = true
          addFirmware(this.form).then(res => {
            this.$modal.msgSuccess("新增成功")
            this.cancel()
            this.$emit("operSuccess")
            this.loading = false
            this.disable = false
          }).catch( err => {
            this.loading = false
            this.disable = false
          })
        }
        else {
          this.disable = false
        }
      });
    },
  }
};
</script>