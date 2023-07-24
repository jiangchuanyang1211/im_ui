import request from '@/utils/request'

// 查询部门列表
export function listDept(query, type) {
  return request({
    url: '/system/dept/' + type + '/list',
    method: 'get',
    params: query
  })
}

// 查询部门列表树
export function listDeptTree(query, type) {
  return request({
    url: '/system/dept/' + type + '/listTree',
    method: 'get',
    params: query
  })
}

// 查询部门列表（排除子节点）
export function listDeptExclude(orgId, deptId, type) {
  return request({
    url: '/system/dept/' + type + '/list/exclude/' + orgId + '/' + deptId,
    method: 'get',
  })
}

// 添加部门信息
export function addDept(data, type) {
  return request({
    url: '/system/dept/' + type + '/add',
    method: 'post',
    data: data
  })
}

// 修改部门信息
export function editDept(data, type) {
    return request({
      url: '/system/dept/' + type + '/edit',
      method: 'post',
      data: data
    })
  }

// 删除部门信息
export function delDept(deptId, type) {
  return request({
    url: '/system/dept/' + type + '/' + deptId,
    method: 'delete',
  })
}

// 部门编码查重
export function uniqueDeptCode(query, type) {
  return request({
    url: '/system/dept/' + type + '/unique',
    method: 'get',
    params: query
  })
}

// 查询部门详情
export function getDept(deptId, type) {
  return request({
    url: '/system/dept/' + type + '/' + deptId,
    method: 'get',
  })
}