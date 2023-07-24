<template>
  <div id="app">
    <LockPage v-if="isLock && isLogin" class="lock-page"></LockPage>
    <router-view v-else />
  </div>
</template>

<script>
import {  throttle  } from '@/utils'
export default  {
  name:  'App',
  data() { 
    return {
    } 
  },
  mounted(){
    if( this.$store.state.lockPage.isLock){
        window.removeEventListener('mousemove', this.mousemove);
        localStorage.setItem('isLock', 'isLock');
      }else {
        localStorage.removeItem('isLock');
        if ( this.$store.state.lockPage.isLogin) {
          window.addEventListener('mousemove', this.mousemove)
        }
      }
  },
  computed:{
    isLock(){
      if( this.$store.state.lockPage.isLock){
        window.removeEventListener('mousemove', this.mousemove);
        localStorage.setItem('isLock', 'isLock');
      }else {
        localStorage.removeItem('isLock');
        if ( this.$store.state.lockPage.isLogin) {
          window.addEventListener('mousemove', this.mousemove)
        }
      }
      
      return this.$store.state.lockPage.isLock
    },
    isLogin(){
      if( this.$store.state.lockPage.isLogin ){
        localStorage.setItem('isLogin','isLogin')
        if(!this.$store.state.lockPage.isLock){
          window.addEventListener('mousemove', this.mousemove)
        }else{
          window.removeEventListener('mousemove',this.mousemove);
        }
      }else {
        window.removeEventListener('mousemove',this.mousemove);
        localStorage.removeItem('isLock');
        localStorage.removeItem('isLogin')
        
      }

      return this.$store.state.lockPage.isLogin
    }
  },
  methods: {
     
      mousemove () {
        this.$store.dispatch('setIsLock',false)
      }
  },
    metaInfo() {
        return {
            title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
            titleTemplate: title => {
                return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
            }
        }
    }
}
</script>
