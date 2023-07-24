import request from '@/utils/request'

// 查询内部协作列表
export function listInternal(query) {
  return request({
    url: '/system/internal/coop/page',
    method: 'get',
    params: query
  })
}
// 新增内部协作人员
export function addInternal(data) {
  return request({
    url: '/system/internal/coop/add',
    method: 'post',
    data: data
  })
}
// 修改内部协作人员
export function editInternal(data) {
  return request({
    url: '/system/internal/coop/edit',
    method: 'post',
    data: data
  })
}

//删除当前协作列表
export function delInternal(ids) {
  return request({
    url: `/system/internal/coop/remove`,
    method: 'post',
    data:ids
  })
}
//查询当前协作列表
export function getInfoById(query) {
  let id = query?.id || query
  return request({
    url: `/system/internal/coop/${id}`,
    method: 'get',
  })
}

export function isInSame(data) {
  return request({
    url: `/system/internal/coop/unique?cooperateName=${data.cooperateName}&id=${data.id}`,
    method: 'get',
  })
}