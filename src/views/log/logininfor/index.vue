<template>
  <div class="app-container">
    <!-- 搜索行 -->
    <base-search :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['log:logininfor:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['log:logininfor:remove']"
        >清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-unlock"
          size="mini"
          :disabled="single"
          @click="handleUnlock"
          v-hasPermi="['log:logininfor:unlock']"
        >解锁</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['log:logininfor:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <ZfTable ref="myTable" :table-head-titles="columns" :isDisplayAction="false" :isNeedSelection="true" :isSearch="isSearch"  :url="url" :query-params="queryParams"  @handleSelectionChange="handleSelectionChange">
      <template v-slot:status="{prop}" >
        <dict-tag :options="dict.type.sys_common_status" :value="prop"/>
      </template>
    </ZfTable>
   
  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/system/logininfor";

export default {
  name: "Logininfor",
  dicts: ['sys_common_status'],
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选择用户名
      selectName: "",
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "ipaddr", label: "登录地址", type: "input", param: "", placeholder: "请输入登录地址"},
        {name: "userName", label: "用户名称", type: "input", param: "", placeholder: "请输入用户名称"},
        {name: "status", label: "登陆状态", type: "select", param: "",  placeholder: "登录状态", dict: "sys_common_status"},
        {name: "dateRange", label: "登陆时间", type: "datePicker", param: []}
      ],
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: {prop: 'loginTime', order: 'descending'},
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "infoId", key: 0, label: `访问编号`, visible: true, width: 100 },
        { name: "userName", key: 1, label: `用户名称`, visible: true,sort:true },
        { name: "ipaddr", key: 2, label: `地址`, visible: true },
        { name: "status", key: 3, label: `登录状态`, visible: true,slot:true },
        { name: "msg", key: 4, label: `描述`, visible: true },
        { name: "accessTime", key: 4, label: `访问时间`, visible: true,sort:true},
      ],
      // 查询方法
      url: (parms) => {
        return list(this.addDateRange(parms, this.dateRange))
      },
      // 查询调用标识
      isSearch: false,
    };
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getList();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.single = selection.length!=1
      this.multiple = !selection.length
      this.selectName = selection.map(item => item.userName);
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids;
      this.$modal.confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？').then(function() {
        return delLogininfor(infoIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal.confirm('是否确认清空所有登录日志数据项？').then(function() {
        return cleanLogininfor();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("清空成功");
      }).catch(() => {});
    },
    /** 解锁按钮操作 */
    handleUnlock() {
      const username = this.selectName;
      this.$modal.confirm('是否确认解锁用户"' + username + '"数据项?').then(function() {
        return unlockLogininfor(username);
      }).then(() => {
        this.$modal.msgSuccess("用户" + username + "解锁成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/logininfor/export', {
        ...this.queryParams
      }, `logininfor_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

