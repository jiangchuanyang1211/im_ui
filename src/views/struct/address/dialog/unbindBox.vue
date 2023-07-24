<template>
  <!-- 添加或修改机构对话框 -->
  <el-dialog 
    :title="title" 
    :visible.sync="visible" 
    :close-on-click-modal="false"
    :userId="userId"
    width="600px" append-to-body>
   
    <ZfTable 
      :actionWidth="240"
      :table-head-titles="columns" 
      :isSearch="isSearch" 
      :url="url" 
      :query-params="queryParams"
      @cell-click="singleElection"
      highlight-current-row
      :isDisplayAction="false">
      <template v-slot:size="{RowInfo}">
        <span>{{ sizeToStr(RowInfo.row.size) }}</span>
      </template>
      <template v-slot:choose="{RowInfo}">
        <el-radio  v-model="templateSelection" :label="RowInfo.row.snCode" :key="RowInfo.row.snCode" ><span>&emsp;</span> </el-radio>
      </template>
    </ZfTable>
    <el-form ref="formBox" :model="formBox" :rules="rules" label-width="80px">
      <el-form-item  prop="checkObj" v-model="formBox.checkObj" label-width="0px">
      </el-form-item>
    </el-form> 
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>

</template>

<script>
import {getUnbindBox,bindBox,exportData} from "@/api/magic/device";
export default {
  name:'UnbindBox',
  props:{
    userId:{
      required: true,
      type:String
    }
  },
  components:{

  },
  data(){
    return {
      title:'添加绑定魔盒',
      visible:false,
      queryParams: {

      },
      // 列信息
      columns: [
        { name: "choose", key: 1, label: "选择", visible: true,slot:true },
        { name: "snCode", key: 1, label: "snCode", visible: true, },
        { name: "size", key: 2, label: "容量", visible: true,slot:true},
      ],
      // 查询方法
      url: (params) => {
        return getUnbindBox(params)
      },
      // 查询调用标识
      isSearch: false,
      //   当前选择的行的id
      templateSelection: "",
      //   当前选择的行的数据
      formBox:{
        checkObj:null
      },
      rules:{
        checkObj: [
          { required: true, message: "请选择绑定魔盒", trigger: "blur" }
        ],
        
      }
    
    }
  },
  methods:{
    getList(){
      this.isSearch = !this.isSearch
    },
    open(){
      this.visible = true;
      this.templateSelection="";
      this.formBox.checkObj=null;
      this.getList();
    },
    cancel(){
      this.visible = false;
    },
    submitForm(){
      this.$refs["formBox"].validate( valid => {
         if(valid){
          bindBox(this.formBox.checkObj).then(res=>{
            this.$modal.msgSuccess("魔盒绑定成功");
            this.$parent.getList();

          })
          this.visible = false;
         }
      })
     
    },
    singleElection(row) {
      this.templateSelection = row.snCode;
      this.formBox.checkObj = {
        snCode:row.snCode,
        userId:this.userId
      };
    },
  }
}
</script>

<style>

</style>