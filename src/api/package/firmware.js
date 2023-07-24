import request from '@/utils/request'

// 查询固件包列表
export function listFirmware(query) {
  return request({
    url: '/system/package/box/versions',
    method: 'get',
    params: query
  })
}

// 添加固件包
export function addFirmware(data) {
  return request({
    url: '/system/package/box/version',
    method: 'post',
    data: data
  })
}

// 删除固件包信息
export function delFirmware(id) {
  return request({
    url: '/system/package/box/version/' + id,
    method: 'delete',
  })
}

// 启用固件包
export function enableFirmware(id) {
  return request({
    url: '/system/package/box/version/'+ id +'/enable',
    method: 'patch',
  })
}

// 停用固件包
export function disableFirmware(id) {
  return request({
    url: '/system/package/box/version/'+ id +'/disable',
    method: 'patch',

  })
}

// 获取固件包详情
export function detailFirmware(id) {
  return request({
    url: '/system/package/box/version/' + id,
    method: 'get',
  })
}

// 检查APP版本
export function checkFirmwareVersion(query) {
  return request({
    url: '/system/package/box/version/check',
    method: 'get',
    params: query
  })
}