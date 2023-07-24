<template>
  <div class="app-container">   
    <!-- 搜索行 -->
    <base-search 
      :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:config:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:config:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:config:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-refresh" size="mini" @click="handleRefreshCache"
          v-hasPermi="['system:config:remove']">刷新缓存</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 表格 -->
    <ZfTable ref="myTable" :table-head-titles="columns" :isNeedSelection="true" :isSearch="isSearch" :url="url"
      :query-params="queryParams" @handleSelectionChange="handleSelectionChange" :showSearch="showSearch">
      <template v-slot:configType="{ RowInfo }">
        <dict-tag :options="dict.type.sys_yes_no" :value="RowInfo.row.configType" />
      </template>
      <template v-slot:default="{ RowInfo }">
        <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(RowInfo.row)"
          v-hasPermi="['system:config:edit']">修改</el-button>
        <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(RowInfo.row)"
          v-hasPermi="['system:config:remove']">删除</el-button>
      </template>
    </ZfTable>
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-throttle>确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config";

export default {
  name: "Config",
  dicts: ['sys_yes_no'],
  data() {
    return {
      // 选中数组
      ids: [],
      names:[],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "configName", label: "参数名称", type: "input", param: "", placeholder: "请输入参数名称"},
        {name: "configKey", label: "参数键名", type: "input", param: "", placeholder: "请输入参数键名"},
        {name: "dateRange", label: "创建时间", type: "datePicker", param: []}
      ],
      // 总条数
      total: 0,
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "id", key: 0, label: `id`, visible: false, width: 100 },
        { name: "configName", key: 1, label: `参数名称`, visible: true },
        { name: "configKey", key: 2, label: `参数键名`, visible: true },
        { name: "configValue", key: 3, label: `参数键值`, visible: true },
        { name: "createBy", key: 4, label: `创建人`, visible: false},
        { name: "createTime", key: 5, label: `创建时间`, visible: true},
        { name: "delFlag", key: 6, label: `删除标识`, visible: false},
        { name: "remark", key: 7, label: `备注`, visible: true},
        { name: "updateBy", key: 8, label: `更新人`, visible: false },
        { name: "updateTime", key: 9, label: `更新时间`, visible: false },
      ],
      // 查询方法
      url: (parms) => {
        return listConfig(this.addDateRange(parms, this.dateRange))
      },
      // 查询调用标识
      isSearch: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [
        { required: true, message: "参数名称不能为空", trigger: "blur" },
          this.$enum.NAME_RULE,
          this.$enum.LENGTH_RULE_2_20
        ],
        configKey: [
          { required: true, message: "参数键名不能为空", trigger: "blur" },
          this.$enum.CODE_RULE,
          this.$enum.LENGTH_RULE_2_20
        ],
        configValue: [
          { required: true, message: "参数键值不能为空", trigger: "blur" },
          this.$enum.CODE_RULE,
          this.$enum.LENGTH_RULE_2_20
        ]
      }
    };
  },
  methods: {
    /** 查询授权用户列表 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = this.$enum.ADD_CONFIG_TITLE;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.names = selection.map(item => item.configName)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$enum.EDIT_CONFIG_TITLE;
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            let data = {
              configKey:this.form.configKey,
              configName:this.form.configName,
              configValue:this.form.configValue,
              id:this.form.id,
              remark:this.form.remark

            }
            updateConfig(data).then(response => {
              this.$modal.msgSuccess(this.$enum.EDIT_SUCCESS);
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(this.form).then(response => {
              this.$modal.msgSuccess(this.$enum.ADD_SUCCESS);
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id?[row.id]:this.ids;
      const names = row.configName?row.configName:this.names
      this.$modal.confirm('是否确认删除参数名称为"' + names + '"的数据项？').then(function () {
        return delConfig(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.DELETE_SUCCESS);
      }).catch(() => { });
    },
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      refreshCache().then(() => {
        this.$modal.msgSuccess(this.$enum.REFRESH_SUCCESS);
      });
    }
  }
};
</script>