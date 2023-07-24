import request from '@/utils/request'

// 查询操作日志列表
export function list(query) {
  return request({
    url: '/system/logs/system',
    method: 'get',
    params: query
  })
}
export function getLogById(id) {
  return request({
    url: `/system/logs/system/${id}`,
    method: 'get',
  })
}

// 删除操作日志
export function delOperlog(data) {
  return request({
    url: `/system/logs/system/delete`,
    method: 'post',
    data:data
  })
}

// 清空操作日志
export function cleanOperlog() {
  return request({
    url: '/system/logs/system/clear',
    method: 'post'
  })
}
