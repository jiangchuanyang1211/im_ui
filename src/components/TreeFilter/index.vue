<template>
  <div class="orgDept">
    <div class="head-container">
      <el-row class="search-row" type="flex" justify="space-between">
        <el-input 
          v-model.trim="name" 
          placeholder="请输入搜索内容" 
          clearable size="small" 
          prefix-icon="el-icon-search" 
          style="width: calc( 100% - 30px )" 
        />
        <el-tooltip class="item" effect="dark" content="重置选中机构部门" placement="top-end">
          <el-button 
            type="text" 
            class="el-icon-refresh-right" 
            size="medium"
            style="width: 30px"
            @click="resetNode">
          </el-button>
        </el-tooltip>
      </el-row>
    </div>
    <div class="tree-container">
      <el-tree 
        ref="tree" 
        :data="options" 
        :props="defaultProps" 
        node-key="id"
        default-expand-all 
        highlight-current
        :expand-on-click-node="false"
        :filter-node-method="filterNode" 
        @node-click="handleNodeClick" 
      >
        <span class="custom-tree-node" slot-scope="{ node, data}">
          <svg-icon v-if="data.type=='org'" icon-class="org" className="org-dept-icon"></svg-icon>
          <svg-icon v-else-if="data.type=='dept'" icon-class="dept" className="org-dept-icon"></svg-icon>
          <span style="margin-left: 5px">
            {{ node.label }}
          </span>
        </span>

      </el-tree>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeFilter',
  props: {
    // 表单参数配置列表
    options: { 
      type: Array,
      default(){
        return []
      }
    },      
    // 搜索树默认属性  
    defaultProps: {
      type: Object,
      default() {
        return {
          children: "children",
          label: "label"
        }
      }
    },
  },
  data() {
    return {
      // 左侧搜索树查询参数
      name: undefined,
    }
  },
  watch: {
    // 根据名称筛选部门树
    name(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    // 筛选节点
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      return data[this.defaultProps.label].indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.$emit("nodeClick", data)
    },  
    // 设置当前高亮节点
    setCurrentNode(id) {
      this.$refs.tree.setCurrentKey(id)
    },
    /** 重置选择机构*/
    resetNode() {
      this.$refs.tree.setCurrentKey(null)
      this.$emit("nodeClick")
    },
  },
};
</script>

<style scoped>
.orgDept {
  height: 100%
}
.head-container {
  width: 100%;
  margin-bottom: 10px;
}
.search-row {
  width: 100%;
  margin-left: 0px;
}
.tree-container {
  margin: 0;
  padding: 0;
  height: calc( 100% - 52px);
  overflow-y: scroll;
}
::-webkit-scrollbar {
  width: 0;
  height: 10px;
}
.tree-container {
  scrollbar-width: none;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
}
.org-dept-icon {
  height:16px;
  width:16px;
  margin-top: 1px;
}
</style>