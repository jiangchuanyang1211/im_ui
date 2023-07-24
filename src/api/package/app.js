import request from '@/utils/request'

// 查询APP包列表
export function listApp(query) {
  return request({
    url: '/system/package/app/versions',
    method: 'get',
    params: query
  })
}

// 添加APP包
export function addApp(data) {
  return request({
    url: '/system/package/app/version',
    method: 'post',
    data: data
  })
}

// 删除APP包信息
export function delApp(id) {
  return request({
    url: '/system/package/app/version/' + id,
    method: 'delete',
  })
}

// 启用APP包
export function enableApp(id) {
  return request({
    url: '/system/package/app/version/'+ id +'/enable',
    method: 'patch',
  })
}

// 停用APP包
export function disableApp(id) {
  return request({
    url: '/system/package/app/version/'+ id +'/disable',
    method: 'patch',
  })
}

// 获取APP包详情
export function detailApp(id) {
  return request({
    url: '/system/package/app/version/' + id,
    method: 'get',
  })
}

// 检查APP版本
export function checkAppVersion(query) {
  return request({
    url: '/system/package/app/version/check',
    method: 'get',
    params: query
  })
}