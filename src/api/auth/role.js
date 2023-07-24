import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/system/role/page',
    method: 'get',
    params: query
  })
}
  
// 新增角色
export function addRole(data) {
  return request({
    url: '/system/role/add',
    method: 'post',
    data: data
  })
}

// 删除角色
export function delRole(data) {
  return request({
    url: '/system/role/remove',
    method: 'post',
    data: data
  })
}

// 修改角色信息
export function editRole(data) {
  return request({
    url: '/system/role/edit',
    method: 'post',
    data: data
  })
}

// 修改角色状态
export function enableRole(data) {
  return request({
    url: '/system/role/changeStatus',
    method: 'post',
    data: data
  })
}

// 获取角色详细信息
export function getRole(id) {
  return request({
    url: '/system/role/'+ id,
    method: 'get',
  })
}

// 分配用户
export function allocAdmin(data) {
  return request({
    url: '/system/role/addUser',
    method: 'post',
    data: data
  })
}

// 分配机构部门
export function allocOrgDept(data) {
  return request({
    url: '/system/role/addOrgDept',
    method: 'post',
    data: data
  })
}

// 查询角色相关管理员
export function listAdminByRoleId(roleId) {
  return request({
    url: '/system/role/bindUserList/' + roleId,
    method: 'get',
  })
}

// 查询角色相关部门
export function listOrgDeptByRoleId(roleId) {
  return request({
    url: '/system/role/bindOrgList/' + roleId,
    method: 'get',
  })
}

// 根据机构部门查询角色
export function listRoleByOrgDept(data) {
  return request({
    url: '/system/role/list',
    method: 'post',
    data: data
  })
}