<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" >
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            集团用户总数
            <count-to :start-val="0" :end-val="user.allCount" :duration="20" class="card-panel-num" />
          </div>
          
          <div class="card-panel-text">
            集团魔盒App用户总数
            <count-to :start-val="0" :end-val="user.userCount" :duration="20" class="card-panel-num" />
          </div>
          
          <div class="card-panel-text">
            集团管理员用户总数
            <count-to :start-val="0" :end-val="user.adminCount" :duration="20" class="card-panel-num" />
          </div>
          
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" >
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            集团下属机构总数
            <count-to :start-val="0" :end-val="org.orgCount" :duration="20" class="card-panel-num" />
          </div>
          
          <div class="card-panel-text">
            下属机构内部总数
            <count-to :start-val="0" :end-val="org.groupOrgCount" :duration="20" class="card-panel-num" />
          </div>
          
          <div class="card-panel-text">
            下属外部机构总数
            <count-to :start-val="0" :end-val="org.partnerOrgCount" :duration="20" class="card-panel-num" />
          </div>
          
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" >
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            魔盒总数量
            <count-to :start-val="0" :end-val="box.boxCount" :duration="2600" class="card-panel-num" />
          </div>
          
          <div class="card-panel-text">
            已激活
            <count-to :start-val="0" :end-val="box.activatedBoxCount" :duration="2600" class="card-panel-num" />
          </div>
          
          <div class="card-panel-text">
            剩余激活
            <count-to :start-val="0" :end-val="box.notActivatedBoxCount" :duration="2600" class="card-panel-num" />
          </div>
          
        </div>
      </div>
    </el-col>
   
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { getUserData,getOrgData,getBoxData,getLoginData } from "@/api/index"; 

export default {
  components: {
    CountTo
  },
  data(){
    return {
      user:{
        "adminCount": 0,
        "allCount": 0,
        "userCount": 0
      },
      org:{
        "groupOrgCount": 0,
        "orgCount": 0,
        "partnerOrgCount": 0
      },
      box:{
        "activatedBoxCount": 0,
        "boxCount": 0,
        "notActivatedBoxCount": 0
      }
    }
  },
  created(){
    getUserData().then(res=>{
      this.user = res.data
    });
    getOrgData().then(res=>{
      this.org = res.data;
    });
    getBoxData().then(res=>{
      this.box = res.data;
    })

  },
  methods: {
    
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    display: flex;
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 40px 11px 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin-top: 10px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
        color:#666;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
