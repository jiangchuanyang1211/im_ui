<template>
  <div class="app-container">
    <!-- 搜索行 -->
    <base-search :paramList="paramList" @handleQuery="handleQuery" v-show="showSearch">
    </base-search>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button 
          type="primary" 
          plain 
          icon="el-icon-plus" 
          size="mini" 
          @click="handleAdd"
          v-hasPermi="['package:firmware:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    
    <!-- 表格 -->
    <ZfTable 
      ref="myTable" 
      :actionWidth="120"
      :table-head-titles="columns" 
      :isSearch="isSearch" 
      :url="url"
      :query-params="queryParams" 
      :showSearch="showSearch"
    >
      <template v-slot:size="{ RowInfo }">
        <div>{{ sizeToStr(RowInfo.row.size)}}</div>
      </template>
      <template v-slot:force="{ RowInfo }">
        <dict-tag :options="dict.type.sys_yes_no" :value="Number(RowInfo.row.force)"/>
      </template>
      <template v-slot:status="{ RowInfo }">
        <dict-tag 
          v-if="!checkPermi(['package:firmware:enable'])"
          :options="dict.type.package_normal_disable" 
          :value="Number(RowInfo.row.status)"
        />
        <el-switch 
          v-model="RowInfo.row.status" 
          :active-value="true" :inactive-value="false"
          v-hasPermi="['package:firmware:enable']"
          @change="handleStatus(RowInfo.row)">
        </el-switch>
      </template>
      <template v-slot:default="{ RowInfo }">
        <el-button 
          size="mini" 
          type="text" 
          icon="el-icon-info" 
          @click="handleDetail(RowInfo.row)"
          v-hasPermi="['package:firmware:detail']"
        >详情
        </el-button>
        <el-button 
          size="mini" 
          type="text" 
          icon="el-icon-delete" 
          @click="handleDelete(RowInfo.row)"
          v-hasPermi="['package:firmware:remove']"
        >删除
        </el-button>
      </template>
    </ZfTable>

    <!-- 固件包新增弹窗 -->
    <firmware-package-add ref="firmwarePackageAdd" @operSuccess="getList">
    </firmware-package-add>
    <!-- 固件包详情弹窗 -->
    <firmware-package-detail ref="firmwarePackageDetail" >
    </firmware-package-detail>

  </div>
</template>

<script>
import { checkPermi } from "@/utils/permission"
import { 
  listFirmware, 
  delFirmware, 
  enableFirmware, 
  disableFirmware, 
  detailFirmware 
} from "@/api/package/firmware";
import FirmwarePackageAdd from "./dialog/add.vue";
import FirmwarePackageDetail from "./dialog/detail.vue";

export default {
  name: "firmwarePackage",
  dicts: ["sys_yes_no", "package_normal_disable"],
  components: {
    FirmwarePackageAdd,
    FirmwarePackageDetail
  },
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 查询参数配置列表
      paramList: [
        {name: "version", label: "版本号", type: "input", param: "", placeholder: "请输入版本号"},
        {name: "packageName", label: "包名称", type: "input", param: "", placeholder: "请输入包名称"},
        {name: "dateRange", label: "发布时间", type: "datePicker", param: [], paramName: ["beginTime", "endTime"]}
      ],
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "packageVersion", key: 0, label: `版本号`, visible: true },
        { name: "packageName", key: 1, label: `包名称`, visible: true },
        { name: "size", key: 2, label: `大小`, visible: true, slot:true  },
        { name: "force", key: 3, label: `强制更新`, visible: true, slot:true  },
        { name: "status", key: 4, label: `状态`, visible: true, slot:true  },
        { name: "publishTime", key: 7, label: `发布时间`, visible: true },

      ],
      // 查询方法
      url: (params) => {
        return listFirmware(params)
      },
      // 搜索中
      isSearch: false,
    };
  },
  methods: {
    /** 验证权限 */
    checkPermi,
    /** 查询参数列表 */
    getList() {
      this.isSearch = !this.isSearch
    },
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      let _form = { force: false, status: false }
      this.$refs.firmwarePackageAdd.open("新增固件包", _form)
    },
    /** 详情按钮操作 */
    handleDetail(row) {
      this.$refs.firmwarePackageDetail.open("固件包详情", row.id)
    },
    // 启用/停用APP包
    handleStatus(row) {
      let text = (row.status === true ? "启用" : "停用");
      this.$modal.confirm(
        '确认' + text + '版本"' + row.packageVersion + '"吗？'
      ).then( function() {
        return row.status == true ? enableFirmware(row.id) : disableFirmware(row.id)
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = (row.status === true ? false : true)
      });
    },
    // 删除APP包
    handleDelete(row) {
      if(row.status) {
        this.$alert( "该版本处于启用状态，请停用后再删除。", "警告", {
          confirmButtonText: "确定",
          type: 'warning'
        }).then().catch()
      }
      else {
        this.$modal.confirm('确认删除版本"' + row.packageVersion + '"吗？').then(function() {
          return delFirmware(row.id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      }
    },
  }
};
</script>