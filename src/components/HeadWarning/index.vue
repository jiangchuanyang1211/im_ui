<template>
   <div class="warn-wrap">
    <el-popover
      placement="bottom"
      width="320"
      trigger="click" popper-class="pad0">
      <div class="warn-head">告警列表</div>
      <ul class="warn-list" v-if="alarmList.length > 0">
        <li v-for="(item, index) in alarmList" :key="index">
          <div style="display: flex ;justify-content: space-between;">
            <span>{{ item.name }}</span>
            <span :class="{'alarm-level-high': item.level === '紧急', 'alarm-level-middle': item.level === '重要', 'alarm-level-low': item.level === '一般'}">{{ item.level }}</span>
          </div>
          <div>{{ item.time }}</div>
        </li>
        <li class="warn-more">加载更多</li>
      </ul>
      <div v-else style="text-align: center;">暂无告警信息</div>
      <div slot="reference"><i class="el-icon-message-solid" style="transform: scale(1.3);color:#5a5e66"></i></div>
    </el-popover>
  
    </div>
</template>

<script>
export default {
  name:'HeadWarning',
  data(){
    return {
      popoverVisible: false,
      alarmList: []
    }
  },
  created(){
    this.getAlarmList();
    
  },
  methods: {
      showAlarmList() {
        this.popoverVisible = true;
      },
      getAlarmList() {
        // 模拟获取告警数据
        setTimeout(() => {
          this.alarmList = [
            { name: 'CPU利用率过高', level: '紧急', time: '2021-10-01 12:01:00' },
            { name: '磁盘空间不足', level: '重要', time: '2021-10-02 10:30:12' },
            { name: '网络连接中断', level: '一般', time: '2021-10-03 15:20:45' },
          ]
        }, 1000)
      }
    },
}
</script>

<style >
  .pad0{
    padding:0px!important;
  }
  .warn-head{
    height:45px;
    padding:12px;
    background-color: #f4f6f7;
  }
  .warn-list{
    list-style: none;
    padding:0;
    margin:0;
  }
  .warn-list li:hover{
    background: #f4f6f7;
  }
  .warn-list li{
    height:55px;
    padding:7px;
    border-bottom:1px solid #f4f6f7;
  }
  .warn-list .warn-more{
    height:35px;
    padding:0;
    line-height:35px;
    text-align: center;
    background:#f4f6f7;
    cursor: pointer;
  }
   .alarm-tooltip .el-tooltip__popper {
    width: 100px;
  }
  .alarm-tooltip .el-tooltip__popper .el-tooltip__content {
    padding: 5px;
  }
  .alarm-tooltip .el-tooltip__popper .el-tooltip__content:before {
    border-width: 6px 6px 0;
    border-color: transparent transparent #409EFF;
  }
  .alarm-level-high {
    background-color: #F56C6C;
    color: #fff;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .alarm-level-middle {
    background-color: #E6A23C;
    color: #fff;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .alarm-level-low {
    background-color: #909399;
    color: #fff;
    padding: 2px 5px;
    border-radius: 3px;
  }
</style>