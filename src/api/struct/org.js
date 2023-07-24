import request from '@/utils/request'

// 查询机构列表
export function listOrg(query, type) {
  return request({
    url: '/system/org/' + type + '/list',
    method: 'get',
    params: query
  })
}

// 查询机构列表(树形结构)
export function listOrgTree(query, type) {
  return request({
    url: '/system/org/' + type + '/listTree',
    method: 'get',
    params: query
  })
}

// 查询机构列表(排除子节点)
export function listOrgExclude(orgId, type) {
  return request({
    url: '/system/org/' + type + '/list/exclude/' + orgId,
    method: 'get',
  })
}

// 查询机构部门tree
export function listOrgDept(type) {
  return request({
    url: '/system/org/' + type + '/orgDeptTree',
    method: 'get',
  })
}

// 添加机构信息
export function addOrg(data, type) {
  return request({
    url: '/system/org/' + type + '/add',
    method: 'post',
    data: data
  })
}

// 修改机构信息
export function editOrg(data, type) {
  return request({
    url: '/system/org/' + type + '/edit',
    method: 'post',
    data: data
  })
}

// 删除机构信息
export function delOrg(orgId, type) {
  return request({
    url: '/system/org/' + type + '/' + orgId,
    method: 'delete',
  })
}

// 机构编码查重
export function uniqueOrgCode(query, type) {
  return request({
    url: '/system/org/' + type + '/unique',
    method: 'get',
    params: query
  })
}

// 获取机构详情
export function getOrg(orgId, type) {
  return request({
    url: '/system/org/' + type + '/' + orgId,
    method: 'get',
  })
}