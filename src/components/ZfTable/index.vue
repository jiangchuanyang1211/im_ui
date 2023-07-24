<template>
    <div>
        <el-table ref="table" v-loading="loading" :data="tableData" style="width: 100%"  @cell-click="cellClick" @selection-change="handleSelectionChange"
            :max-height="maxHeight || defaultMaxHeight" v-resizeTable="resizeParams"
            >
            <el-table-column v-if="isNeedSelection" type="selection" width="55" />
            <el-table-column v-for="item in columns"  :prop="item.name" :label="item.label" :width="item.width" :sortable="item.sort"
                :key="item.name">
                <template slot-scope="{row, $index}" >
                    <span key="item.formatter(row[item.name])" v-if="item.formatter" v-html="item.formatter(row[item.name])"></span>
                    <slot v-else-if="item.slot" :prop="row[item.name]" :RowInfo="{ row, $index }" :name="item.name"></slot>
                    <span v-else key="row[item.name]">{{ row[item.name] }}</span>
                </template>
            </el-table-column>
            <el-table-column v-if="isDisplayAction" fixed="right" label="操作" :width="actionWidth">
                <template slot-scope="{row, $index}">
                    <slot :RowInfo="{ row, $index }"></slot>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-show="isPageNation && pageNation.total > 0" :total="pageNation.total" :page.sync="pageNation.pageNum"
            :limit.sync="pageNation.pageSize" @pagination="handleCurrentChange" @size-change="handleSizeChange" />
    </div>
</template>
    
<script> 
import { throttle } from '@/utils'
export default {
    // 这里看实际需要增加或减少属性
    props: {
        isDisplayAction: { // 是否需要操作栏
            type: Boolean,
            default: true
        },
        actionWidth: { // 操作栏宽度
            type: Number,
            default: 120
        },
        isNeedSelection: { // 是否需要多选
            type: Boolean,
            default: false
        },
        tableHeadTitles: { // 表格字段
            type: Array,
            required: true
        },
        url: { // 封装好的接口url
            type: Function,
            required: true
        },
        queryParams: { // 查询参数
            type: Object,
            required: true
        },
        pageInfo: {
            type: Object,
            default: function () {
                return {
                    pageNum: 1,
                    pageSize: 10,
                    total: 0
                };
            }
        },
        isSearch: {
            type: Boolean,
            required: false
        },
        isClear: {
            type: Boolean,
            default:true
        },
        isPageNation:{
            type:Boolean,
            default:true
        },
        maxHeight:{
            type:Number
        },
        isNowLoad:{
            type:Boolean,
            default:true
        },
        // 下边距
        bottomOffset:{
            type:Number,
            default:75
        },
        // 父组件搜索框显隐
        showSearch: {
            type:Boolean,
        }
    },
    
    data() {
        return {
            pageNation: this.pageInfo,
            tableData: [],
            loading:false,
            // 默认表格最大高度
            defaultMaxHeight:undefined,
            // 表格重置指令参数
            resizeParams:{}
        };
    },
    mounted() {
        // 如果props没有传入maxHeight，启用以下代码
        if(!this.maxHeight) {
            // 设置自定义指令监听参数,
            this.resizeParams = {
                isResize: !this.maxHeight, 
                table: this.$refs.table, 
                bottomOffset: this.bottomOffset
            }
            this.resetTable()
            let that = this
            window.addEventListener("resize", () => {
                that.defaultMaxHeight = window.innerHeight - that.$refs.table.$el.getBoundingClientRect().top - that.bottomOffset
            })
        }

        this.pageNation.pageNum = 1;
        this.pageNation.pageSize = 10;
        if(this.isNowLoad){
            this.getTableData();
        }
        

    },
    beforeDestroy() {
        window.removeEventListener("resize",this.resetTable())
    },
    computed:{
        columns:function(){
            return this.tableHeadTitles.filter(item=>{
                return item.visible
            })
        }
    },

    watch: {
        isSearch:throttle(function(){
            this.getTableData();
        },500),
        isClear:{
            immediate: false,
            handler(val) {
                this.tableData = [];
                this.pageNation.pageNum = 1;
                this.pageNation.pageSize = 10;
            }
        },
        showSearch:{
            immediate: false,
            handler(val) {
                this.resetTable()
            }
        }
    },
    methods: {
        // 重设表格最大高度
        resetTable() {
            this.defaultMaxHeight = window.innerHeight - this.$refs.table.$el.getBoundingClientRect().top - this.bottomOffset
        },
        // 点击单元格
        cellClick(row, column, cell, event) {
            this.$emit('cell-click', row, column);
        },
        // 多选
        handleSelectionChange(val) {
            this.$emit('handleSelectionChange', val);
        },
        // 切换条数
        handleSizeChange(val) {
            this.pageNation.pageNum = 1;
            this.pageNation.pageSize = val;
            this.getTableData();
        },
        // 切换页数
        handleCurrentChange(val) {
            this.pageNation.pageNum = val.page;
            this.getTableData();
        },
        getTableData() {
            this.loading = true;
            try {
                if (!this.url) {
                    return console.error('url is required');
                }
                
                const $API = this.url;
                const params = {
                    ...this.queryParams,
                    pageNum: this.pageNation.pageNum,
                    pageSize: this.pageNation.pageSize
                };
                $API(params).then(res => {
                    res = res.data;
                    this.tableData = res?.records;
                    this.loading = false;
                    this.pageNation.total = res?.total || res?.records?.length ;
                });
            } catch (e) {
                console.log('e!!!', e);
            }
        }
    }
};
</script>