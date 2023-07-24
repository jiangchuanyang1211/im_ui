<template>
  <!-- 添加机构对话框 -->
  <el-dialog 
    :title="title" :visible.sync="visible" 
    :close-on-click-modal="false"
    width="600px" append-to-body
  >
    <el-row :gutter="20">
      <el-col :span="16">
        <el-row>
          <el-descriptions :column="5" >
            <el-descriptions-item 
              :span="3"
              label="手机" label-class-name="device-label" content-class-name="device-content"
            >{{ data.phone }}
            </el-descriptions-item>

            <el-descriptions-item 
              :span="2"
              label="姓名" label-class-name="device-label" content-class-name="device-content"
            >{{ data.nickname }}
            </el-descriptions-item>

            <el-descriptions-item 
              :span="3"
              label="邮箱" label-class-name="device-label" content-class-name="device-content"
            >{{ data.email }}
            </el-descriptions-item>

            <el-descriptions-item 
              :span="2"
              label="性别" label-class-name="device-label" content-class-name="device-content"
            >{{ data.gender == 1 ? "男" : (data.gender == 2 ? "女" : "未知") }}
            </el-descriptions-item>

            <el-descriptions-item 
              :span="3"
              label="状态" label-class-name="device-label" content-class-name="device-content"
            >{{ data.status == 1 ? "正常" : "停用" }}
            </el-descriptions-item>

            <el-descriptions-item
              :span="2" 
              label="类型" label-class-name="device-label" content-class-name="device-content"
            >{{ data.type == 1 ? "正式" : "非正式" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-row>
      </el-col>
    </el-row>

    <el-table  max-height="200" :data="data.orgList" empty-text="暂无岗位信息" style="margin-top: 10px">
      <el-table-column label="机构" prop="orgName">
      </el-table-column>
      <el-table-column label="部门" prop="deptName">
      </el-table-column>
      <el-table-column label="岗位" prop="postNames">
        <template slot-scope="scope">
          <div v-for="(item, index) in scope.row.postNames" :key="index">{{item}}</div>
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getToken } from "@/utils/auth"
import defaultAvatar from "@/assets/images/profile.jpg"

export default {
  name: "StructAddressDetail",
  data() {
    return {
      // 弹窗开启状态
      visible: false,
      // 弹窗标题
      title:"",
      // 数据
      data: {},
      // 默认头像
      defaultAvatar: defaultAvatar,
      // 图片地址
      avatarUrl: process.env.VUE_APP_BASE_API + "/file/multi/down",
      // 图片链接参数
      avatarParams: "",
    };
  },

  methods: {
    // 打开弹窗
    open(title, data) {
      this.title = title
      this.data = data
      this.initOrgList()
      this.setAvatarParams()
      this.visible = true
    },
    /** 初始化岗位列表数据 */
    initOrgList() {
      if(this.data.id) {
        this.data.orgList.forEach( item => {
          item.postIds = []
          item.postNames = []
          item.postList.map( i => {
            item.postIds.push(i.id)
            item.postNames.push(i.postName)
          })
        })
      }
    },
    /** 设置头像图片链接参数 */
    setAvatarParams() {
      if(this.data.avatar) {
        this.avatarParams = "?path=" + this.data.avatar + "&access_token=" + getToken()
      }
    },
    // 关闭按钮
    cancel() {
      this.visible = false
    },
  }
};
</script>