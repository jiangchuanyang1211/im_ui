<template>
  <!-- APP包详情 -->
  <el-dialog :title="title" :visible.sync="visible" width="600px" append-to-body>

      <el-row :gutter="20">
        <el-col>
          <el-descriptions :column="2" v-loading="loading">
            <el-descriptions-item :span="2"
              label="应用名称" label-class-name="device-label" content-class-name="device-content"
            >{{ data.appName }}
            </el-descriptions-item>

            <el-descriptions-item :span="1"
              label="版本号" label-class-name="device-label" content-class-name="device-content"
            >{{ data.packageVersion }}
            </el-descriptions-item>

            <el-descriptions-item :span="1"
              label="发布时间" label-class-name="device-label" content-class-name="device-content"
            >{{ formatDate(data.publishTime) }}
            </el-descriptions-item>

            <el-descriptions-item :span="1"
              label="强制更新" label-class-name="device-label" content-class-name="device-content"
            >{{ data.force == true ? "是" : "否"}}
            </el-descriptions-item>

            <el-descriptions-item :span="1"
              label="状态" label-class-name="device-label" content-class-name="device-content"
            >{{ data.status == true ? "启用" : "停用" }}
            </el-descriptions-item>

            <el-descriptions-item :span="1"
              label="包名称" label-class-name="device-label" content-class-name="device-content"
            >{{ data.packageName }}
            </el-descriptions-item>

            <el-descriptions-item :span="1"
              label="包大小" label-class-name="device-label" content-class-name="device-content"
            >{{ sizeToStr(data.size) }}
            </el-descriptions-item>

            <el-descriptions-item :span="2"
              label="路径" label-class-name="device-label" content-class-name="device-content"
            >{{ data.path }}
            </el-descriptions-item>

            <el-descriptions-item :span="2"
              label="备注" label-class-name="device-label" content-class-name="device-content"
            >{{ data.description }}
            </el-descriptions-item>
          </el-descriptions>    
        </el-col>
      </el-row>  
              
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { detailApp } from "@/api/package/app";
import { formatDate } from "@/utils/index.js"

export default {
  name: "AppPackageDetail",
  data() {
    return {
      // 弹窗开启状态
      visible: false,
      // 加载状态
      loading: true,
      // 弹窗标题
      title:"",
      // 数据
      data: {},
    };
  },
  methods: {
    formatDate,
    // 打开弹窗
    open(title, id) {
      this.reset()
      this.title = title
      this.init(id)
      this.visible = true
    },
    init(id) {
      detailApp(id).then( res => {
        this.data = res.data
        this.$set(this.data, "publishTime", this.formatDate(this.data.publishTime))
        this.loading = false
      })
    },
    // 关闭按钮
    cancel() {
      this.visible = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.loading = true
      this.data = {}
    },
  }
};
</script>