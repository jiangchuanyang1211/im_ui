import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/system/logs/user',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLogininfor(data) {
  return request({
    url: `/system/logs/user/delete`,
    method: 'post',
    data:data
  })
}

// 解锁用户登录状态
export function unlockLogininfor(userName) {
  return request({
    url: '/system/logininfor/unlock/' + userName,
    method: 'get'
  })
}
/**
 * 查询用户日志详情
 * @param {*} id 
 * @returns 
 */
export function getUserLogById(id) {
  return request({
    url: `/system/logs/user/${id}`,
    method: 'get'
  })
}

// 清空登录日志
export function cleanLogininfor() {
  return request({
    url: '/system/logs/user/clear',
    method: 'post'
  })
}
