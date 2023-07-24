<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form>
    <ZfTable ref="myTable" :table-head-titles="tableHeadTitles"  :url="url" :queryParams="queryParams" :isSearch="isSearch">
      <template v-slot:default="{ RowInfo }">
        <el-button size="mini" type="text" icon="el-icon-delete" @click="handleForceLogout(RowInfo.row)"
          v-hasPermi="['monitor:online:forceLogout']">强退</el-button>
      </template>
    </ZfTable>
  </div>
</template>

<script>
import { list, forceLogout } from "@/api/monitor/online";
export default {
  name: "Online",
  data() {
    return {
      // 表格数据
      datalist: [],
      pageNum: 1,
      pageSize: 10,
      // 查询参数
      queryParams: {
        ipaddr: undefined,
        userName: undefined
      },
      tableHeadTitles: [
          { name: 'id', label: '序号', visible: true },
          { name: 'userId', label: '用户id', visible: true },
          { name: 'userName', label: '登录名称',  visible: true},
          { name: 'time', label: '时间' , visible: true},
          { name: 'ciphertext', label: '密文', visible: true },
      ],
      url: (parms) => {
        return list(parms);
      },
      isSearch:false,

    };
  },

  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.$modal.confirm('是否确认强退名称为"' + row.userName + '"的用户？').then(function () {
        return forceLogout(row.tokenId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("强退成功");
      }).catch(() => { });
    }
  }
};
</script>

