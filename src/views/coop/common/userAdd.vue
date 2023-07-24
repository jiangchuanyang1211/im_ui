<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="700px" append-to-body
    :close-on-click-modal="false"	>
    <el-form ref="form" :model="form" label-width="85px">
      
      <el-row :gutter="20" v-if="type=='partner'">
        <el-col>
          <el-form-item label="机构类型" prop="type">
            <el-select 
              v-model="form.type" 
              placeholder="请选择机构类型"
              style="width: 235px"
              @change="chooseType"
              >
                <el-option 
                  v-for="dict in dict.type.org_type" 
                  :key="dict.value" 
                  :label="dict.label" 
                  :value="dict.value">
                </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="z-index:3000">
        <el-col>        
          <SelectDept ref="selectDept" :businessType="businessType" :depts="depts">
          </SelectDept>
        </el-col>   
      </el-row>

      

    </el-form>

  <div slot="footer" class="dialog-footer">
    <el-button type="primary" @click="submitForm">确 定</el-button>
    <el-button @click="cancel">取 消</el-button>
  </div>
  </el-dialog>
</template>

<script>
import { getAddressByIds } from "@/api/struct/address";


export default {
  name: 'CoopUserAdd',
  dicts: ['org_type'],
  data() {
    let formatter = function(val){
      if(!val)return '';
      let arr = val.split(',');
      let str = '';
      for(var i=0;i<arr.length;i++){
          str+= `<div>${arr[i]}</div>`
      }
      return str;
    }
    return {
      // 弹窗开启状态
      visible: false,
      // 弹窗标题
      title:"",
      
      queryParams: {
        "deptId": "",
        "orgId": "",
        "phonebookIds": [],
        "pageNum": 1,
        "pageSize": 10,
      },
    
      // 表单数据
      form: {
        type:'group',
      },
      type:this.$enum.BUSINESS_TYPE.GROUP.value,
      businessType:this.$enum.BUSINESS_TYPE.GROUP.value,
      depts:[],
    };
  },
  methods: {
    // 打开弹窗
    open(title, form, type) {
      this.reset()
      this.title = title
      this.form = JSON.parse(JSON.stringify(form))
      this.type = type;
      this.form.type = this.businessType;
      this.init()
      this.visible = true;
      this.$nextTick( () => {
        this.$refs.selectOrgDept?.use(this.form)
        this.$refs.selectDept?.getTreeOptions(this.businessType).then(()=>{
          this.$refs.selectDept?.setCheckedByKeys(this.businessType,form?form:[])
        })
      
      })
      
     
    },
    /** 初始化 */
    init() {
      if(!this.form.type) {
        this.form.type = this.$enum.BUSINESS_TYPE.GROUP.value
      }
    },
    /** 选择机构类型 */
    chooseType(type){
      this.businessType= type;
     
      this.form.orgId = undefined
      this.form.orgName = undefined
      this.form.deptId = undefined
      this.form.deptName = undefined
      this.$set( this.form, 'type',type  )
      this.$forceUpdate();
      this.$nextTick( () => {
        this.$refs.selectOrgDept?.use(this.form)
        this.$refs.selectDept.getTreeOptions(type).then(()=>{
          let selectItem = [].concat(this.$refs.selectDept?.innerList).concat(this.$refs.selectDept?.outList);
          this.$refs.selectDept?.setCheckedByKeys(this.businessType,selectItem)
        });
      })
    },
   
   
    // 取消按钮
    cancel() {
      this.visible = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        addressList: []
      }
      this.resetForm("form")
    },
    submitForm() {
      let temps = [].concat(this.$refs.selectDept.outList).concat(this.$refs.selectDept.innerList)
      this.$emit("operSuccess", temps)
      this.cancel()
    }
  },
};
</script>