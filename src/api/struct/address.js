import request from '@/utils/request'

// 查询通讯录列表
export function listAddress(query, type) {
  return request({
    url: '/system/phonebook/' + type + '/page',
    method: 'get',
    params: query
  })
}

// 新增通讯录
export function addAddress(data, type) {
  return request({
    url: '/system/phonebook/' + type + '/add',
    method: 'post',
    data: data
  })
}

// 修改通讯录
export function editAddress(data, type) {
  return request({
    url: '/system/phonebook/' + type + '/edit',
    method: 'post',
    data: data
  })
}

// 删除通讯录
export function delAddress(data, type) {
  return request({
    url: '/system/phonebook/' + type + '/remove',
    method: 'post',
    data: data
  })
}

// 修改通讯录状态
export function enableAddress(data, type) {
  return request({
    url: '/system/phonebook/' + type + '/changeStatus',
    method: 'post',
    data: data
  })
}

// 导入通讯录
// export function importAddress(data, type) {
//   return request({
//     url: '/system/phonebook/' + type + '/import',
//     method: 'post',
//     data: data,
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     },
//     responseType: "blob"
//   })
// }
export function importAddress(data, type) {
  return request({
    url: '/system/phonebook/' + type + '/import',
    method: 'post',
    data: data,
  })
}

// 导出通讯录导入失败数据
export function exportFailData(id, type) {
  return request({
    url: '/system/phonebook/' + type + '/exportFailWorkBook/' + id,
    method: 'get',
    responseType: "blob"
  })
}

// 导出通讯录模板
export function exportTemplate(type) {
  return request({
    url: '/system/phonebook/' + type + '/exportTemplate',
    method: 'get',
    responseType: "blob"
  })
}

// 获取通讯录详情
export function getAddress(id, type) {
  return request({
    url: '/system/phonebook/' + type + '/' + id,
    method: 'get',
  })
}

// 根据id数组过滤通讯录
export function getAddressByIds(data,type) {
  return request({
    url: `/system/phonebook/${type}/pagePhonebookExclude`,
    method: 'post',
    data: data
  })
}
