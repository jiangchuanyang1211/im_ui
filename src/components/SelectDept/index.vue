<template>
  <!-- 分配机构部门对话框 -->

    <el-form ref="form"  label-width="80px" v-loading="loading">
      <el-row :gutter="20">
        <el-col>
          <el-form-item label="部门">
            <el-checkbox 
              v-model="deptExpand" 
              @change="handleExpand">展开/折叠
            </el-checkbox>
            <el-checkbox 
              v-model="deptNodeAll" 
              @change="handleSelectAll">全选/全不选
            </el-checkbox>
            <el-tree 
              class="tree-border" ref="dept" node-key="id"
              :props="defaultProps" 
              :data="treeOptions" 
              :check-strictly="!deptStrictly"
              :show-checkbox="false"
              :expand-on-click-node="true"
              :default-expanded-keys="expandNodes"
              :default-expand-all="deptExpand"
              empty-text="请先选择机构" 
              style="height:260px; overflow-y:auto"
              
            >
              <span slot-scope="{ node, data }">
                <el-checkbox 
                  v-if="data.type=='dept'" style="margin-right: 8px" 
                  v-model="data.checked" @change="checked=>checkNodes(checked, data)"
                  @click.stop.native="()=>{}"
                ></el-checkbox>
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

</template>

<script>
import { listOrgDept } from "@/api/struct/org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";


export default {
  name: 'AllocOrgDept',
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  props:{
    businessType:{
      type: String,
      default:'group',
    },
    depts:{
      type:Array,
      default(){
        return []
      }
    }
  },
  
  data() {
    return {
      // 加载状态
      loading: false,
      // 机构选择树
      treeOptions: [],
      // 展开节点
      expandNodes: [],
      // 全部展开/收起
      deptExpand: true,
      // 全部选中/取消选中
      deptNodeAll: false,
      // 父子联动模式
      deptStrictly: false,
      // 默认配置
      defaultProps: {
        children: "children",
        label: "name"
      },
      // 表单数据
      // 表单校验
      rules: {
      },
      innerList:[],
      outList:[],
      allList:[],

    }
  },
 
  methods: {
   
    
    /** 获取上级机构选项 */

    getTreeOptions(type) {
      return listOrgDept(type).then(res1 => {
        this.treeOptions = res1.data; 
         this.$set(this.expandNodes, 0, this.treeOptions)
        this.setChecked(this.treeOptions)
      })
    },
    /** 设置选中状态 */
    setChecked(data) {
      for(let i=0; i<data.length; i++) {
        this.$set(data[i], "checked", this.depts.includes(data[i].id))
        this.setChecked(data[i].children)
      }
    },
    setCheckedByKeys(type,depts){
      this.setAll(this.treeOptions,false);
      this.allList = [];
      this.innerList= [];
      this.outList = [];
      if(depts[0]?.deptId){

         depts.map(item => {
            if(item.type=='group'  && !this.innerList.includes(item.deptId)){
              this.innerList.push(item)
            }else if(item.type=='partner'  && !this.outList.includes(item.deptId)){
              this.outList.push(item)
            }
            if(type==item.type  && !this.allList.includes(item.deptId)){
              this.allList.push(item.deptId)
            }
          });
         
        
      }else{
        this.allList = [].concat(depts);
      }
      for(let i=0; i<this.allList.length; i++) {
        this.setCheckedById(this.allList[i],this.treeOptions);
      }
     
    },
    setCheckedById(nodeId, nodes) {
      for (var i=0; i<nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          nodes[i].checked = true;
          return;
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          this.setCheckedById(nodeId, nodes[i].children);
        }
      }
    },
    /** 转换机构数据结构*/
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    /** 展开/折叠 */
    handleExpand(value) {
      let treeOptions = this.treeOptions;
      for (let i = 0; i < treeOptions.length; i++) {
        this.$refs.dept.store.nodesMap[treeOptions[i].id].expanded = value;
      }
    },
    /** 全选/取消全选 */
    handleSelectAll(value) {
      this.$refs.dept.setCheckedNodes(value ? this.treeOptions : []);
      this.innerList = [];
      this.outList = [];
      this.setAll(this.treeOptions, value)
    },
    /** 全选/全不选 */
    setAll(data, val) {
      for(let i=0; i<data.length; i++) {
        this.$set(data[i], "checked", val)
        this.$forceUpdate();
        this.setAll(data[i].children, val)
         this.checkNodes(val, data[i])
        
      }
    },
    findNodeById(topNode,node, id) {
      if (node.id === id) {
        if(node.type=='org'){
          return node
        }else{
          return this.findNodeById(topNode,topNode,node.parentId);
        }
      }
      for (let i = 0; i < node.children.length; i++) {
        const result = this.findNodeById(topNode,node.children[i], id);
        if (result != null) {
          return result;
        }
      }

      return null;
    },
    /** 父子联动 */
    handleSelectStrictly(value) {
      // this.deptStrictly = value 
    },
    /** 获取选中节点 */
    checkNodes(val, data) {
      if(val) {
        if(!this.depts.includes(data.id) && data.type=="dept") {
          this.depts.push(data.id);
          let parent = this.findNodeById(this.treeOptions[0],this.treeOptions[0],data?.parentId);
          if(parent){
            if(this.businessType=='group'){
              this.innerList.push({
                deptName:data.name,
                orgName:parent.name,
                deptId:data.id,
                type:this.businessType
              })
            }else{
              this.outList.push({
                deptName:data.name,
                orgName:parent.name,
                deptId:data.id,
                type:this.businessType
              })
            }
           
          }
        }
      }
      else {
        if(this.businessType=='group'){
          this.innerList = this.innerList.filter(item => item.deptId != data.id)
        }else{
          this.outList = this.outList.filter(item => item.deptId != data.id)
        }
        this.depts.pop(data.id);
      }
    },

  },
};
</script>