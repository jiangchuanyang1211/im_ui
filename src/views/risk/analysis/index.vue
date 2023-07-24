<template>
  <div class="app-container">
    <base-search 
      :paramList="paramList"
      @handleQuery="handleQuery"
      v-show="showSearch">
    </base-search>
    <ZfTable ref="myTable" :table-head-titles="tableHeadTitles"  :url="url" :queryParams="queryParams" :isSearch="isSearch" :isDisplayAction="false">
  
    </ZfTable>
  </div>
</template>

<script>
import { list, forceLogout } from "@/api/monitor/online";
export default {
  name: "Analysis",
  data() {
    return {
      // 表格数据
      datalist: [],
      pageNum: 1,
      pageSize: 10,
      // 查询参数
      queryParams: {},
      time:[],
      tableHeadTitles: [
          { name: 'id', label: '序号', visible: true },
          { name: 'time', label: '时间' , visible: true},
          { name: 'type', label: '风险类别', visible: true },
          { name: 'description', label: '风险描述', visible: true }
      ],
      paramList: [
        {name: "time", label: "时间", type: "datePicker", param: []},
        {name: "type", label: "风险类别", type: "select", param: "", dict: "sys_normal_disable"},
      ],
        // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
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
    /** 搜索&重置搜索操作 */
    handleQuery(params) {    
      this.queryParams = params
      this.getList();
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

