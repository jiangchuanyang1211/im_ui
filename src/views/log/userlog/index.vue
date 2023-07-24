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
          v-hasPermi="['log:userlog:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['log:userlog:remove']"
        >清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['log:userlog:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <ZfTable ref="myTable" :table-head-titles="columns" :isNeedSelection="true" :isSearch="isSearch"  :url="url" :query-params="queryParams"  @handleSelectionChange="handleSelectionChange">
      <template v-slot:status="{prop}" >
        <dict-tag :options="dict.type.sys_common_status" :value="Number(prop)"/>
      </template>
      <template v-slot:accessTime="{prop}">
        <span>{{ parseTime(prop) }}</span>
      </template>
      <template v-slot:default="{ RowInfo }">
        <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(RowInfo.row,RowInfo.index)"
            v-hasPermi="['log:userlog:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(RowInfo.row,RowInfo.index)"
            v-hasPermi="['log:userlog:query']"
          >详细</el-button>
      </template>
    </ZfTable>
   
     <!-- 用户日志详细 -->
     <el-dialog title="用户日志详细" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作方法：">{{ form.functionName }}</el-form-item>
            <el-form-item
              label="登录信息："
            >{{ form.operator }} / {{ form.remoteAddress }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.methodUrl }}</el-form-item>
            <!-- <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item> -->
            <el-form-item label="操作类型：">{{ form.operationType }}</el-form-item>
          </el-col>
          
          
          <el-col :span="12">
            <el-form-item label="操作IP：">{{ form.remoteAddress }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === true">正常</div>
              <div v-else-if="form.status === false">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ parseTime(form.accessTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status == false">{{ form.msg }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.requestData }}</el-form-item>
            <el-form-item label="返回参数：">{{ form.responseData }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor,getUserLogById } from "@/api/log/userlog";

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
        {name: "operator", label: "用户名称", type: "input", param: "", placeholder: "请输入用户名称"},
        // {name: "status", label: "登录状态", type: "select", param: "",  placeholder: "登录状态", dict: "sys_common_status"},
        {name: "dateRange", label: "访问时间", type: "datePicker", param: [], paramName: ["beginTime", "endTime"]}
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
        { name: "id", key: 0, label: `访问编号`, visible: true},
        { name: "operator", key: 1, label: `用户名称`, visible: true,sort:true },
        { name: "status", key: 3, label: `登录状态`, visible: true,slot:true },
        { name: "functionName", key: 4, label: `操作方法`, visible: true },
        { name: "accessTime", key: 4, label: `访问时间`, visible: true,slot:true,sort:true},
        { name: "operationType", key: 4, label: `操作类型`, visible: true,sort:true},
      ],
      // 查询方法
      url: (parms) => {
        return list(this.addDateRange(parms, this.dateRange))
      },
      // 查询调用标识
      isSearch: false,
      open: false,
      form:{}
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
      this.ids = selection.map(item => item.id)
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
      const infoIds = row.id?[row.id]:this.ids;;
      this.$modal.confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？').then(function() {
        return delLogininfor({ids:infoIds});
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
        this.$modal.msgSuccess(this.$enum.CLEAR_SUCCESS);
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/system/logs/user/export', {
        ...this.queryParams
      }, `logininfor_${new Date().getTime()}.xlsx`)
    },
     /** 详细按钮操作 */
     handleView(row) {
      getUserLogById(row.id).then(res=>{
      this.form = res?.data
      this.form.msg = res?.msg
      this.open = true;
      })
     
    },
  }
};
</script>

