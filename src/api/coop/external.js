import request from '@/utils/request'

// 查询内部协作列表
export function listExternal(query) {
  return request({
    url: '/system/external/coop/page',
    method: 'get',
    params: query
  })
}
// 新增内部协作人员
export function addExternal(data) {
  return request({
    url: '/system/external/coop/add',
    method: 'post',
    data: data
  })
}
// 修改内部协作人员
export function editExternal(data) {
  return request({
    url: '/system/external/coop/edit',
    method: 'post',
    data: data
  })
}

//删除当前协作列表
export function delExternal(ids) {
  return request({
    url: `/system/external/coop/remove`,
    method: 'post',
    data:ids
  })
}
//查询当前协作列表
export function getInfoById(query) {
  let id = query?.id || query
  return request({
    url: `/system/external/coop/${id}`,
    method: 'get',
  })
}
// 判断是否重名
export function isOutSame(data) {
  return request({
    url: `/system/external/coop/unique?cooperateName=${data.cooperateName}&id=${data.id}`,
    method: 'get',
  })
}