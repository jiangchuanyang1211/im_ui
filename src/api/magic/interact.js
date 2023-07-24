import request from '@/utils/request'
/**
 * 查询交流数据
 * @param {*} query 
 * @returns 
 */
 export function interactList(query) {
    return request({
      url: '/api1/test/profile',
      method: 'get',
        params: query
    })
  }