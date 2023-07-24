<template>
  <!-- 添加或修改角色配置对话框 -->
  <el-dialog 
    :title="title" 
    :visible.sync="visible" 
    :close-on-click-modal="false"
    width="700px" append-to-body 
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="协作名称" prop="cooperateName">
            <el-input v-model="form.cooperateName" placeholder="请输入协作名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="选择日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 240px"
              :picker-options="pickerBeginOption"
            >
          </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col>        
          <SelectOrgDept 
            ref="selectOrgDept"
            :config="config"
            :status="status"
            @returnNewForm="returnNewForm">
          </SelectOrgDept>
        </el-col>   
      </el-row>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button 
            type="primary" plain icon="el-icon-edit" size="mini" 
            @click="handleAdd">{{ form.deptIds.length>0?'修改部门':'新增部门' }}
          </el-button>
        </el-col>
      </el-row>
    
      <el-row :gutter="20">
        <el-col >
          <el-form-item  prop="deptIds" v-model="form.deptIds" label-width="0px">
            <ZfTable 
            ref="myTable" 
            :actionWidth="240"
            :table-head-titles="columns" 
            :isSearch="isSearch" 
            :url="url"
            :maxHeight="400"
            :query-params="queryParams"
            @handleSelectionChange="handleSelectionChange"
            :isDisplayAction="false"
            :isPageNation="false"
            >
          </ZfTable>

        </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" v-throttle >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <coop-user-add ref="coopUserAdd" @operSuccess="addAddress">
    </coop-user-add>

  </el-dialog>
</template>

<script>
import { addExternal, editExternal, isOutSame } from "@/api/coop/external"
import { addInternal, editInternal, isInSame } from "@/api/coop/internal"
import CoopUserAdd from "./userAdd.vue"

export default {
  name: 'InternalUserAdd',
  components: { CoopUserAdd },
  data() {
    return {
      // 弹窗开启状态
      visible: false,
      // 弹窗标题
      title:"",
      // 日期选择器开始时间设置
      pickerBeginOption: {
        disabledDate: (time) => {
          return time.getTime() < Date.now() - 1 * 24 * 60 * 60 * 1000
        }
      },
      // label参数
      config: {
          styleType: 1,
          businessType: "group", 
          labelWidth: "80px",
          org: {
            label: "所属机构",
            required: "true"
          },
          dept: {
            label: "所属部门",
            required: "true"
          }
      },
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 查询参数
      queryParams: {},
      // 列信息
      columns: [
        { name: "orgName", key: 3, label: "机构名称", visible: true, },
        { name: "deptName", key: 4, label: "部门名称", visible: true},
      ],
      // 查询调用标识
      isSearch: false,
      // 表单数据
      form: {
        deptIds:[]
      },
      // 表单校验
      rules: {
        cooperateName: [
          { required: true, message: "协作名称不能为空", trigger: "blur" },
          this.$enum.NAME_RULE,
          this.$enum.LENGTH_RULE_2_20,
          { validator: this.checkName, trigger: "change" }

        ],
        orgId: [
          { required: true, message: "所属机构不能为空", trigger: "blur" }
        ],
        deptId: [
          { required: true, message: "所属部门不能为空", trigger: "blur" }
        ],
        deptIds:[
          { type:"array", required: true, message: "请添加协作部门", trigger: "blur" }
        ]
      },
      type:this.$enum.BUSINESS_TYPE.GROUP.value,
      status:1,
      phonebookList:[],
      setDeptTitle:'修改部门',
    }
  },
  
  methods: {
    /** 打开弹窗 */
    open(type, form) {
      this.type = type;
      this.form = form;
      this.phonebookList = [];
      this.form.deptIds = [];
      if(form && form.depts){

        this.phonebookList = [].concat(form.depts)
      }
      if(type==this.$enum.BUSINESS_TYPE.GROUP.value && !form.id){
      this.reset()
        this.status=1;
        this.title = this.$enum.ADD_IN_TITLE;
      }else if(type==this.$enum.BUSINESS_TYPE.GROUP.value && form.id){
        this.status=0;
        this.title = this.$enum.UDIT_IN_TITLE;
        form.depts.map(item=>{
          this.form.deptIds.push({
            deptId:item.deptId,
            type:type,
            deptName:item.deptName,
            orgName:item.orgName
          })
        })
      }else if(type==this.$enum.BUSINESS_TYPE.PARTNER.value && form.id){
        this.status=0;
        this.title = this.$enum.UDIT_OUT_TITLE;
        form.depts.map(item=>{
          this.form.deptIds.push({
            deptId:item.deptId,
            type:item.type,
            deptName:item.deptName,
            orgName:item.orgName
          })
        })
      }else{
      this.reset()
        this.title = this.$enum.ADD_OUT_TITLE;
        this.status=1;
      }
    
      
     
      this.$nextTick( () => {
        this.$refs.selectOrgDept?.use(this.form)
      })
      this.init()
      this.visible = true;
    },
    /** 初始化 */
    init() {
      if(!this.form.deptIds) {
        this.form.deptIds = []
      }
      this.getList()
    },
    /** 子组件返回表单 */
    returnNewForm(newForm) {
      this.form.orgId = newForm.orgId
      this.form.deptId = newForm.deptId
    },
    /** 接口，获取已添加通讯录 */
    url(){
      return new Promise((resolve, reject)=>{
        if(!this.form.deptIds) {
          this.form.deptIds = []
        }
        let data = {
          'records':this.phonebookList,
          'total':this.phonebookList.length || 0
        };
        resolve({data:data});
      })
    },
    /** 查询已添加通讯录 */
    getList() {
      this.isSearch = !this.isSearch;
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.phonebookId)
      this.multiple = !selection.length;
    },
    /** 新增 */
    handleAdd() {
      this.$refs.coopUserAdd.open("选择协作部门",this.form.deptIds, this.type)
    },
   
    /** 添加新选择用户 */
    addAddress(list) {
      this.form.deptIds = []
      for(var i=0;i<list.length;i++){
        if(!this.form.deptIds.includes(list[i].id)){
          this.form.deptIds.push(list[i])
        }
      }
      this.phonebookList = [].concat(list)
      this.getList()
    },
    /** 取消按钮 */
    cancel() {
      this.visible = false,
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        deptIds: []
      };
      this.resetForm("form");
    },
    /** 协作名称校验 */
    checkName(rule, value, callback){
      if(!value || value==""){
        callback(new Error('协作名称不能为空'));
      }else{
        let same = this.type===this.$enum.BUSINESS_TYPE.GROUP.value?isInSame:isOutSame;
        let temp = same({
          id:this.form.id,
          cooperateName:value
        })
         temp.then(res=>{
           if(!res.data==0){
            callback(new Error('协作名称已经存在请重新输入'));
           }else{
            callback();
           }
         })
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      const valid1 = new Promise((resolve, reject) => {
        this.$refs.selectOrgDept?.validate( valid => {
          if(valid) {
            resolve()
          }
        })
      })
      const valid2 = new Promise((resolve, reject) => {
        this.$refs["form"].validate( valid => {
          if(valid) {
            resolve()
          }
        })
      })
      Promise.all([valid1, valid2]).then( () => {
        if(!this.form.id){
          let add = this.type===this.$enum.BUSINESS_TYPE.GROUP.value?addInternal:addExternal;
          add(this.form).then(res=>{
            if(res.data===1){
              this.$modal.msgSuccess(this.$enum.ADD_SUCCESS);
              this.visible = false;
              this.$emit('getList')
            }
          })
        }else{
          let edit = this.type===this.$enum.BUSINESS_TYPE.GROUP.value?editInternal:editExternal;
          edit(this.form).then(res=>{
            if(res.data===1){
              this.$modal.msgSuccess(this.$enum.EDIT_SUCCESS);
              this.visible = false;
              this.$emit('getList')
            }
          })
        }
      })
    },
  },
};
</script>