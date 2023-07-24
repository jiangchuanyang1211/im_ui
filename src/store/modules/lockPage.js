
const lockPage = {
  state : {
    isLock:localStorage.getItem('isLock')==='isLock',
    isLogin:localStorage.getItem('isLogin')==='isLogin',
  },
  mutations :{
    SET_ISLOCK:(state,isLock)=>{
      state.isLock = isLock;
    },
    SET_ISLOGIN:(state,isLogin)=>{
      state.isLogin = isLogin;
    }
  }, 
 actions : {
   setIsLock ({ commit, state }, isLock) {
    commit('SET_ISLOCK', isLock)
    if (!isLock) {
      if(window?.lockTimeOut){
        clearTimeout(window.lockTimeOut)
      }
      window.lockTimeOut = setTimeout(() => {
        commit('SET_ISLOCK', true)
      }, 1000*60*5)
      //设置时间内未操作，则设置锁屏状态为true
      
    }
  }
  },
}

export default lockPage
