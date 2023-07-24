<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <el-avatar 
                :src="defaultAvatar"
                :size="160"
                shape="circle">
              </el-avatar>
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户昵称
                <div class="pull-right">{{ user.nickName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.username }}</div>
              </li>
              <li class="list-group-item" v-for="(item, index) in user.orgDeptName" :key="index">
                <svg-icon icon-class="tree"/>{{ "机构部门" + (index + 1)}}
                <div class="pull-right">
                  <span>{{item}}</span>
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import defaultAvatar from "@/assets/images/profile.jpg"
import resetPwd from "./resetPwd";
import user from "@/store/modules/user"

export default {
  name: "Profile",
  components: { resetPwd },
  data() {
    return {
      user: {},
      // 当前管理员信息
      activeTab: "resetPwd",
    };
  },
  created() {
    this.defaultAvatar = defaultAvatar
    this.user = user.state
    this.user.orgDeptName = this.user.orgDeptName.split(",")
  },
  methods: {

  }
};
</script>
