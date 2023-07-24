<template>
  <div class="app-container">
    

    <!-- 搜索行 -->
    <base-search 
      :paramList="paramList"
      @handleQuery="handleQuery"
      v-show="showSearch">
    </base-search>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:dict:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:dict:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:dict:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefreshCache"
          v-hasPermi="['system:dict:remove']"
        >刷新缓存</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <ZfTable ref="myTable" :table-head-titles="column" :isNeedSelection="true" :isSearch="isSearch"  :url="url" :query-params="queryParams"  @handleSelectionChange="handleSelectionChange">
      <template v-slot:dictType="{prop,RowInfo}" >
          <router-link :to="'/system/dict-data/index/'+ RowInfo.row.dictType" class="link-type">
            <span>{{ prop }}</span>
          </router-link>
        </template>
      <template v-slot:status="{prop}" >
          <dict-tag :options="dict.type.sys_normal_disable" :value="prop"/>
      </template>
      <template v-slot:default="{ RowInfo }">
        <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(RowInfo.row)"
            v-hasPermi="['system:dict:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(RowInfo.row)"
            v-hasPermi="['system:dict:remove']"
          >删除</el-button>
      </template>
    </ZfTable>
   
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import { listType, getType, delType, addType, updateType, refreshCache } from "@/api/system/dict/type";
import { validateString,validateInput} from '@/utils/validate'

export default {
  name: "Dict",
  dicts: ['sys_normal_disable'],
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
        {name: "dictName", label: "字典名称", type: "input", param: "", placeholder: "请输入字典名称"},
        {name: "dictType", label: "字典字符", type: "input", param: "", placeholder: "请输入字典类型"},
        {name: "status", label: "状态", type: "select", param: "",  placeholder: "字典状态", dict: "sys_normal_disable"},
      ],

      // 总条数
      total: 0,
      // 字典表格数据
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {},
      column: [
        { name: 'id', label: '字典编号', visible: false },
        { name: 'dictName', label: '字典名称',visible: true },
        { name: 'dictType', label: '字典类型',slot:true,visible: true},
        { name: 'status', label: '操作状态',slot:true ,visible: true },
        { name: 'remark', label: '备注',visible: true },
        { name: 'createTime', label: '创建时间',visible: true },
      ],
      url: (parms) => {
        return listType(this.addDateRange(parms, this.dateRange));
      },
      isSearch:false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictName: [
          { required: true, message: "字典名称不能为空", trigger: "blur" },
          this.$enum.NAME_RULE,
          this.$enum.LENGTH_RULE_2_20
        ],
        dictType: [
          { required: true, message: "字典类型不能为空", trigger: "blur" },
          this.$enum.CODE_RULE,
          this.$enum.LENGTH_RULE_2_20
        ],
        remark:[
          {validator: this.$enum.REMARK_RULE,trigger: "blur"}, 
          this.$enum.LENGTH_RULE_0_255
        ]
      }
    };
  },
  methods: {
    /** 查询字典类型列表 */
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
        id: "",
        dictName: "",
        dictType: "",
        status: 1,
        remark: "",
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
      this.title = this.$enum.ADD_DICTTYPE_TITLE;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.names = selection.map(item => item.dictName)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const dictId = row.id || this.ids[0]
      getType(dictId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$enum.EDIT_DICTTYPE_TITLE;
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != "") {
            updateType(this.form).then(response => {
              this.$modal.msgSuccess(this.$enum.EDIT_SUCCESS);
              this.open = false;
              this.getList();
            });
          } else {
            addType(this.form).then(response => {
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
      const dictIds = row.id || this.ids;
      const names = row.dictName || this.names
      this.$modal.confirm('是否确认删除字典名称为"' + names + '"的数据项？').then(function() {
        return delType(dictIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$enum.DELETE_SUCCESS);
      }).catch(() => {});
    },
   
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      refreshCache().then(() => {
        this.$modal.msgSuccess(this.$enum.REFRESH_SUCCESS);
        this.$store.dispatch('dict/cleanDict');
      });
    }
  }
};
</script>
