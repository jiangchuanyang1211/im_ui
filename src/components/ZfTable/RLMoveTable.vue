
<template>
  <div>
   
      <el-form style="height: 400px;text-align: center">
        <el-col :span="9" style="padding-right: 5px;text-align: center">
          <el-table :data="leftData" style="width: 100%" height="400px" border  @selection-change="saveLeft" ref="leftData">
            <el-table-column type="selection"></el-table-column>
            <el-table-column v-for="item in colLeft"  :prop="item.name" :label="item.label" :width="item.width"
                :key="item.name"></el-table-column>
          </el-table>
        </el-col>
 
        <el-col :span="2" style="margin-top: 10%">
          <el-button type="primary" icon="el-icon-arrow-left" style="margin-bottom: 10px" @click="remove" ></el-button>
          <el-button type="primary" @click="add" style="margin-right: 7px"><i class="el-icon-arrow-right" ></i></el-button>
        </el-col>
 
        <el-col :span="13" style="padding-left: 5px;text-align: center">
          <el-table :data="rightData" style="width: 100%" height="400px" border  ref="rightData" @selection-change="saveRight">
            <el-table-column type="selection"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="标题一" label="标题一" width="180px"></el-table-column>
            <el-table-column  prop="标题二" label="标题二" ></el-table-column>
            <el-table-column  prop="标题三" label="标题三"  >
              <template slot-scope="scope">
                <!--这一列中只能选中一个-->
                <el-checkbox v-model="scope.row.standard"  :checked="scope.row.standard ==1? true : false" @change="selectRow(scope.$index,scope.row)"
                             :true-label="1" :false-label="0"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="标题四" label="标题四" >
              <template>
                <el-checkbox></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="operate">
              <template slot-scope="scope">
                <img src="/"  @click="update(scope.$index,scope.row)"
                     width="16px" height="16px" style="cursor: pointer;margin-left: 10px"/>
                <img src="/"  size="small" @click="letDown(scope.$index,scope.row)"
                     width="16px" height="16px" style="cursor: pointer;margin-left: 20px"/>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="dialog.dialogFormVisible = false">保存</el-button>
        <el-button @click="dialog.dialogFormVisible = false">取消</el-button>
      </div>
  </div>
</template>\
<script>
 
  async function openDialog() {
    this.dialog.dialogFormVisible = true;
  }
 
  function update(index) {    //index: 第几个
    let that = this;
    if (index > 0) {
      let upDate = that.rightData[index - 1];  //上一行的数据
      that.rightData.splice(index - 1, 1);
      that.rightData.splice(index, 0, upDate)     //表示从index那个位置插入 upDate
    } else {
      this.$message.warning("已经是第一条，不可上移！")
    }
  }
 
  function letDown(index,row) {    //index 所在行的下标
    let that = this;
    if ((index +1) === this.rightData.length){
      this.$message.warning("已经是最后一条，不可下移！")
    }else{
      let downDate = that.rightData[index + 1]
      that.rightData.splice(index + 1,1)         //  加入数据之后  下一行会多出来一条上一行的数据   所以把下一行的数据去掉
      that.rightData.splice( index ,0 ,downDate)   //0表示加入数据  必须为0
    }
  }
 
 
  function saveLeft(rows) {
    this.left = [];
    if (rows) {
      rows.forEach(row => {
        if (row) {
          this.left.push(row);
        }
      });
    }
  }
 
  function saveRight(rows) {
    this.right = [];
    if (rows) {
      rows.forEach(row => {
        if (row) {
         this.right.push(row);
        }
      });
    }
  }
 
  // 左边表格选择项移到右边
  function add() {
    setTimeout(() => {
      this.$refs["leftData"].clearSelection();
      this.$refs["rightData"].clearSelection();
    }, 0);
    this.left.forEach((value) => {
      value.standard = 0;
      value.delete = 0;
      value.position = '';
        this.rightData.push(value);
        this.leftData.forEach((item, index) => {
          if (item.headId == value.headId) {
            this.leftData.splice(index, 1)
          }
        })
 
    })
  }
 
  // 右边表格选择项移到左边
  function remove() {
    setTimeout(() => {
      this.$refs["leftData"].clearSelection();
      this.$refs["rightData"].clearSelection();
    }, 0);
    this.right.forEach(value=> {
      if (value.standard ==0){
        this.leftData.push(value);
        this.rightData.forEach((item,index)=>{
          if (item.headId == value.headId){
            this.rightData.splice(index,1)
          }
        })
      }else{
        this.$message.warning("标题三选中行无法左移！")
      }
    });
  }
 
  function selectRow(index,val){  //  val  所在行的信息
      this.rightData.forEach(item=>{
        if (val.headId == item.headId){   //点击的那一行的id和遍历的数据中的id对应   确定是哪一行
          item.standard= 1;
        }else{
          item.standard=0;
        }
    })
  }
 
  export default {
    data(){
      return{
        colLeft:[
          { name: 'id',key: 0, label: '序号', visible: true },
          { name: 'boxSn',key: 1, label: '魔盒SN', visible: true },
          { name: 'importTime',key: 2, label: '导入时间', visible: true },
        ],
        colRight:[
          { name: 'id',key: 0, label: '序号', visible: true },
          { name: 'boxSn',key: 1, label: '魔盒SN', visible: true },
          { name: 'operator',key: 2, label: '操作人', visible: true },
        ],
        rightData: [{标题一: "标题一1",标题二: "标题二1",标题三: "标题三1",standard: 0,delete:0,position:1,headId:111},
          {标题一: "标题一2", 标题二: "标题二2", 标题三: "标题三2", standard: 0, delete:1, position:2, headId: 222},
          {标题一: "标题一3", 标题二: "标题二3", 标题三: "标题三3", standard: 0, delete:0, position:3, headId: 333},
          {标题一: "标题一4", 标题二: "标题二4", 标题三: "标题三4", standard: 0, delete:1, position:4, headId: 444}],
        leftData: [],
        right: [],   //右边选中的数据
        left: [],  //左边选中的数据
        dialog: {
          dialogFormVisible: false,
        },
      }
    },
    methods:{
      openDialog,
      update,
      letDown,
      remove,
      add,
      selectRow,
      saveLeft,
      saveRight,
    }
  }
 
</script>