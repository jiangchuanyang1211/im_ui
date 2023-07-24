import request from '@/utils/request'

// 登录方法
export function superlogin(username, password, code, uuid) {
  return request({
    url: '/auth/super/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: { username, password, code, uuid }
  })
}
// 登录方法
export function login(smsCode,username, password, code, uuid) {
  return request({
    url: '/auth/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: { smsCode,username, password, code, uuid }
  })
}

// 刷新方法
export function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'delete'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/auth/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

// 获滑块验证码
export function getSliderImg() {
  return request({
    url: '/auth/slider',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}
// 获取短信验证码
export function getCode(data) {
  return request({
    url: '/auth/sms/login/code',
    headers: {
      isToken: false
    },
    data:data,
    method: 'post',
    timeout: 20000
  })
}
//获取前端白名单
export function getWhiteList() {
  return request({
    url: '/auth/front/white/list',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

//验证密码接口
export function unlock(data) {
  return request({
    url: '/auth/unlock',
    method: 'post',
    data: data
  })
}