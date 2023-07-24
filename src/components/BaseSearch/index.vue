<template>
	<div class="base-search">
		<el-form :inline="true" ref="queryForm" :model="form" class="demo-form-inline">
			<!-- 表单 -->
			<el-form-item v-for="(item, index) in paramList" :key="index" :label="item.label">
				<!-- 输入框 -->
				<el-input 
          v-if="item.type=='input'" 
          v-model.trim="form[item.name]" 
          :placeholder="item.placeholder"
          :clearable="item.clearable===undefined ? true : item.clearable"
          style="width: 240px"
          @keyup.enter.native="handleQuery">
        </el-input>
        <!-- 下拉框 -->
				<el-select 
          v-if="item.type=='select'" 
          v-model="form[item.name]" 
          :placeholder="item.placeholder"
          :clearable="item.clearable===undefined ? true : item.clearable"
          style="width: 240px">
						<el-option 
              v-for="dict in dict.type[item.dict]" 
              :key="dict.value" 
              :label="dict.label" 
              :value="dict.value">
            </el-option>
				</el-select>
		    <!-- 起止日期选择 -->
        <el-date-picker
          v-if="item.type=='datePicker'"
          v-model="form[item.name]"
          style="width: 240px"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="item.clearable===undefined ? true : item.clearable"
          :default-time="['00:00:00', '23:59:59']">
        </el-date-picker>
			</el-form-item>
			<el-form-item>
					<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
					<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>

		</el-form>
	</div>
</template>

<script>
export default {
	name: "BaseSearch",
  dicts: [],
	props:{
    // 表单参数配置列表
    paramList:{ 
      type: Array,
      default(){
        return [
          {
            name: "param1",
            label: "输入框",
            type: "input",
            param: "",
            placeholder: "请输入",
            clearable: true
          },
          {
            name:"param2",
            label: "下拉框",
            type: "select",
            param: "",
            placeholder: "请输入",
            clearable: true,
            dict: "sys_normal_disable",
          },
          {
            name: "param3",
            label: "日期范围",
            type: "datePicker",
            param: ["", ""],
            clearable: true,
            paramName: ["beginTime", "endTime"],
          }
        ]
      }
    }
	},
	data(){
		let form={}
		for(const obj of this.paramList){
      if(obj.type == "datePicker") {
        form[obj.name] = []
      }
      else  {
        form[obj.name] = undefined
      }
		}
		return {
      form
    }
	},
  beforeCreate() {
    /** create周期生成字典,所以在beforeCreate中将paramList中的取出添加到dicts中 */
    let list = this.$options.propsData.paramList
    for(const obj of list) {
      if(obj.type == "select") {
        this.$options.dicts.push(obj.dict)
      }
    }
  },
	methods:{
    /** 搜索按钮操作 */
		handleQuery() {
      let queryParams = this.dealForm()
			this.$emit('handleQuery', queryParams)
		},
    /** 重置按钮操作 */
    resetQuery() {
		  for(const obj of this.paramList){
        if(obj.type == "datePicker") {
          this.form[obj.name] = []
        }
        else {
          this.form[obj.name] = undefined
        }
		  }
      let queryParams = this.dealForm()
      this.resetForm("queryForm");
      this.$emit("handleQuery", queryParams)
    },
    /** form数据处理 */
    dealForm() {
      let queryParams = {}
      for(const name in this.form) {
        const param = this.paramList.find( 
          item => item.name == name
        )
        if(param.type == "datePicker") {
          if(this.form[name][0]){
            queryParams[param.paramName[0]] = this.form[name][0].toString().split(' (')[0]
          }
          if(this.form[name][1]){
            queryParams[param.paramName[1]] = this.form[name][1].toString().split(' (')[0]
          }
        }
        else {
          if(this.form[name]) {
            queryParams[name] = this.form[name]
          }
        }
      }
      return queryParams
    }
	}
}
</script>