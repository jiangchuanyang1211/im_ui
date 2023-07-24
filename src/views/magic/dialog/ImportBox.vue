<template>
  <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body :before-close="close" :close-on-click-modal="false">
    <el-upload ref="upload" :limit="1" accept=".xlsx" :headers="upload.headers"
      :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
      :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :on-error="handleUploadError" :auto-upload="false" drag>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将.xlsx文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { getToken } from "@/utils/auth";
import {doUnSm4} from '@/utils/sm4'
export default {
  name: 'ImportBox',
  props: {
    upload: {
      type: Object,
      default: function () {
        return {
          open: false,
          // 弹出层标题（用户导入）
          title: "",
          // 是否禁用上传
          isUploading: false,
          // 是否更新已经存在的用户数据
          updateSupport: 0,
          // 设置上传的请求头部
          headers: { Authorization: "Bearer " + getToken() },
          // 上传的地址
          url: process.env.VUE_APP_BASE_API + "/system/box/importBox",
          afterUpdate: undefined
        };
      }
    }
  },

  methods: {
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      if(typeof response ==='string' && response?.indexOf('1x')>-1 ){
        let temp =  response.split('1x');
        response = JSON.parse(doUnSm4(temp[1]));
      }
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
      this.upload.afterUpdate();
    },
     // 上传失败
     handleUploadError(err) {
      this.$modal.msgError("上传文件失败，请重试");
      this.$modal.closeLoading()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    close(){
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
    }
  }
}
</script>

<style></style>