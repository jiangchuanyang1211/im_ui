import request from '@/utils/request'

// 获取登录图表数据
export const getLoginChart = () => {
  return request({
    url: 'api2/index/chart/user',
    method: 'get'
  })
}
// 获取登录图表数据
export const geBoxChart = () => {
  return request({
    url: 'api2/index/chart/box',
    method: 'get'
  })
}
/**
 * 
 * @returns 获取集团用户数据
 */
export const getUserData = () => {
  return request({
    url: '/api2/index/count/user',
    method: 'get'
  })
}
/**
 * 
 * @returns 获取机构用户数据
 */
export const getOrgData = () => {
  return request({
    url: '/api2/index/count/org',
    method: 'get'
  })
}
/**
 * 
 * @returns 获取魔盒数据
 */
export const getBoxData = () => {
  return request({
    url: '/api2/index/count/box',
    method: 'get'
  })
}


