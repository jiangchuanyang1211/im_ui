<template>
  <!-- 添加或修改角色配置对话框 -->
  <el-dialog :title="title" :visible.sync="visible" width="700px" append-to-body>
    <el-row :gutter="20">
      <el-col :span="20">
        <el-descriptions title="发起部门" :column="2">
          <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
            label="协作名称">{{ info.cooperateName }}</el-descriptions-item>
          <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
            label="结束时间">{{ info.endTime }}</el-descriptions-item>
            <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
            label="所属机构">{{ info.orgName }}</el-descriptions-item>
          <el-descriptions-item label-class-name="device-label" content-class-name="device-content"
            label="所属部门">{{ info.deptName }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col>
        <el-descriptions title="协作部门" :column="2">
        </el-descriptions>
        <ZfTable 
        ref="myTable" 
        :actionWidth="240"
        :table-head-titles="columns" 
        :isSearch="isSearch" 
        :url="url"
        :query-params="queryParams"
        :isDisplayAction="false"
        :isPageNation="false"
        :maxHeight="Number(400)">
      </ZfTable>
      </el-col>
    </el-row>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'InterInfo',
  dicts: ['sys_normal_disable'],
  props:{
    info:{
        type: Object,
        required: true
    },
    getInfoById:{
      type: Function,
      required: true
    },


    },
  data() {
    let formatter = function(val){
      let arr = val?.split(',');
      let str = '';
      for(var i=0;i<arr.length;i++){
          str+= `<div>${arr[i]}</div>`
      }
      return str;
    }
    return {
      // 弹窗开启状态
      visible: false,
      // 默认配置
      addressList:[],
      // 表单数据
      form: {},
      // 表单校验
      title:'内部合作对象详情',
      showSearch: true,
      // 查询参数
      queryParams: {
        id:''
      },
      // 列信息
      columns: [
        { name: "orgName", key: 4, label: "机构", visible: true},
        { name: "deptName", key: 4, label: "部门", visible: true,width:200},
      ],
      // 查询方法
      url: (params) => {
        return this.getInfo(params)
      },
      // 查询调用标识
      isSearch: false,
       // 选中数组
      depts: [],
      // 非多个禁用
      multiple: true,
    }
  },
  methods: {
    /** 打开弹窗 */
    open(id,type) {
      this.queryParams.id = id;
      this.visible = true;
      this.getList();
      if(type!=="group"){
        this.title="外部合作对象详情"
      }
    },
    getInfo(params){
      return new Promise((reslove)=>{
        this.getInfoById(params).then(res=>{
          let data={
            data:{
              records:res.data.depts,
              total:res.data.depts.length
            }
          }
          reslove(data)
        })
        
      })
    },
    getList() {
      this.isSearch = !this.isSearch;
    },
   
    /** 取消按钮 */
    cancel() {
      this.visible = false
    },
   
  },
};
</script>