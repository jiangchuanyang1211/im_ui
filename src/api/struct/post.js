import request from '@/utils/request'

// 查询岗位列表
export function listPost(query) {
  return request({
    url: '/system/post/page',
    method: 'get',
    params: query
  })
}

// 查询岗位列表(全部)
export function listPostAll(query) {
    return request({
      url: '/system/post/optionselect',
      method: 'get',
      params: query
    })
  }

// 添加岗位信息
export function addPost(data) {
  return request({
    url: '/system/post/add',
    method: 'post',
    data: data
  })
}

// 修改岗位信息
export function editPost(data) {
    return request({
      url: '/system/post/edit',
      method: 'post',
      data: data
    })
  }

// 删除岗位信息
export function delPost(data) {
  return request({
    url: '/system/post/remove',
    method: 'post',
    data: data
  })
}

// 查询岗位详情
export function getPost(postId) {
  return request({
    url: '/system/post/' + postId,
    method: 'get',
  })
}