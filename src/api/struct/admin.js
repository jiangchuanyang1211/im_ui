import request from '@/utils/request'

// 查询管理员列表
export function listAdmin(query) {
  return request({
    url: '/system/user/page',
    method: 'get',
    params: query
  })
}
  
// 新增管理员
export function addAdmin(data) {
  return request({
    url: '/system/user/add',
    method: 'post',
    data: data
  })
}

// 删除管理员
export function delAdmin(data) {
  return request({
    url: '/system/user/remove',
    method: 'post',
    data: data
  })
}

// 修改管理员信息
export function editAdmin(data) {
  return request({
    url: '/system/user/edit',
    method: 'post',
    data: data
  })
}

// 修改管理员状态
export function enableAdmin(data) {
  return request({
    url: '/system/user/changeStatus',
    method: 'post',
    data: data
  })
}

// 获取管理员详细信息
export function getAdmin(id) {
  return request({
    url: '/system/user/' + id,
    method: 'get',
  })
}

// 重置管理员密码
export function resetAdminPwd(query) {
  return request({
    url: '/system/user/resetPwd',
    method: 'post',
    params: query
  })
}

// 查询可添加为管理员的通讯录用户
export function getAddressAsAdmin(query) {
  return request({
    url: '/system/user/getPhonebookList',
    method: 'get',
    params: query
  })
}

// 修改当前用户密码
export function updatePwd(data) {
  return request({
    url: '/system/user/editPassword',
    method: 'post',
    data: data
  })
}