<template>
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    :before-close="cancel"
    width="400px" append-to-body
  >
    <el-upload 
      ref="upload" 
      drag
      action="" 
      accept=".xlsx"
      :limit="1"
      :disabled="uploading"
      :http-request="handleImport"
      :on-exceed="handleExceed"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { importAddress, exportFailData } from "@/api/struct/address";

export default {
  name: 'StructAddressImport',
  data() {
    return {
      // 弹窗开启状态
      visible: false,
      // 弹窗标题
      title:"",
      // 上传中
      uploading: false,
      // 文件数据
      file: undefined
    }
  },
  methods: {
    // 打开弹窗
    open(title) {
      this.reset()
      this.title = title
      this.visible = true
    },
    // 添加文件
    handleImport(params) {
      this.file = params.file
    },
    /** 超出文件上传个数限制 */
    handleExceed() {
      this.$message.warning("单次只能上传一个文件")
    },
    /** 下载文件 */
    downloadFile(name, file) {
      const blob = new Blob([file])
      const fileName = name
      // 非IE
      if('download' in document.createElement('a')) {
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      }
      // IE
      else {
        navigator.msSaveBlob(blob, fileName)
      }
    },
    // 取消按钮
    cancel() {
      this.$refs.upload.clearFiles()
      this.visible = false
    },
     /** 数据重置 */
    reset() {
      this.file = undefined
      this.uploading = false
    },
    // 提交上传文件
    // submitFileForm() {
    //   let form = new FormData()
    //   form.append("file", this.file)
    //   this.uploading = true
    //   importAddress(form, this.getBsType()).then( res => {
    //     res.text().then( resText => {
    //       let resObj = JSON.parse(resText)
    //       // 上传成功
    //       if(resObj.code == 200) {
    //         this.$modal.msgSuccess("导入成功")
    //       }
    //       else {
    //         this.$modal.msgError(resObj.msg)
    //       }
    //     }).catch( err => {
    //         this.$modal.msgError("部分数据导入失败，正在下载至本地")
    //         this.downloadFile("通讯录导入失败数据.xlsx", res)
    //     })
    //     this.$refs.upload.clearFiles()
    //     this.uploading = false
    //     this.cancel()
    //     this.$emit('operSuccess')
    //   })
    // },
    submitFileForm() {
      let form = new FormData()
      form.append("file", this.file)
      this.uploading = true
      importAddress(form, this.getBsType()).then( res => {
        // 失败返回
        if(res.code != 200) {
          this.$modal.msgError(res.msg)
          return 
        }

        // 部分数据导入失败
        if(res.data) {
          this.$modal.msgError(res.msg)
          exportFailData(res.data, this.getBsType()).then( resFail => {
            this.downloadFile("通讯录导入失败数据.xlsx", resFail)
          })
        }
        // 全部数据导入成功
        else {
          this.$modal.msgSuccess("导入成功")
        }
        this.$refs.upload.clearFiles()
        this.uploading = false
        this.cancel()
        this.$emit('operSuccess')
      })
    },
  }
}
</script>

<style></style>