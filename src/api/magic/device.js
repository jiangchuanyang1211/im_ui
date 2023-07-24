import request from '@/utils/request'


 // 查询魔盒列表
export function list(query) {
  return request({
    url: '/system/boxes',
    method: 'get',
    params: query
  })
}


 // 销毁魔盒
  export function destroyBox(id) {
    return request({
      url: '/system/box/destroyBox',
      method: 'post',
    })
  }
// 冻结魔盒
export function freezeBox(id) {
  return request({
    url: `/system/boxes/${id}/freeze`,
    method: 'post',
  })
}
// 解冻魔盒
export function unFreezeBox(id) {
  return request({
    url: `/system/boxes/${id}/unfreeze`,
    method: 'post',
  })
}
/**
 * 
 * 禁用魔盒
 * @param {*} data 
 * @returns 
 */
export function disableBox(id) {
  return request({
    url: `/system/boxes/${id}/disable`,
    method: 'post',
  })
}
/**
 * 
 * 启用魔盒
 * @param {*} data 
 * @returns 
 */
export function enableBox(id) {
  return request({
    url: `/system/boxes/${id}/enable`,
    method: 'post',
  })
}

/**
 * 查询魔盒详情
 * @param {*} id 
 * @returns 
 */
export function getBoxInfoById(id) {
  return request({
    url: '/system/boxes/'+id,
    method: 'get',
  })
}
/**
 * 获取魔盒激活码
 * @param {*} snCode 
 * @returns 
 */
export function getCode(snCode) {
  return request({
    url: `/system/boxes/${snCode}/activate`,
    method: 'post',
  })
}



/**
 * 重置密码错误次数
 * @param {*} id 
 * @returns 
 */
export function resetPwdCount(id) {
  return request({
    url: '/system/box/resetPasswordNumber',
    method: 'post',
    data:{
      id:id
    }
  })
}


/**
 * 重置密码错误次数
 * @param {*} id 
 * @returns 
 */
export function getUnbindBox(query) {
  return request({
    url: '/system/boxes/unbind',
    method: 'get',
    params: query,
  })
}
/**
 * 魔盒绑定
 * @param {*} obj 
 * {
 * snCode,
 * userId
 * }
 * @returns 
 */
export function bindBox(obj) {
  return request({
    url: '/system/boxes/activate',
    method: 'post',
    data: obj,
  })
}
/**
 * 魔盒解绑
 * @param {*} obj 
 * {
 * snCode,
 * userId
 * }
 * @returns 
 */
export function unbind(id) {
  return request({
    url: '/system/boxes/unbind',
    method: 'post',
    data: {
      'userId':id
    },
  })
}
/**
 * 魔盒解锁
 * @param {*} obj 
 * @returns 
 */
export function unlock(id) {
  return request({
    url: `/system/boxes/${id}/unlock`,
    method: 'post',
  })
}
/**
 * 获取短信验证码
 * @param {*} obj 
 * @returns 
 */
export function getPhoneCode() {
  return request({
    url: `/system/sms/message/export`,
    method: 'get',
  })
}
/**
 * 魔盒信息导出
 * @param {*} obj 
 * @returns 
 */
export function exportData(query) {
  return request({
    url: `/system/boxes/message/export`,
    method: 'post',
    data: query
  })
}
/**
 * 魔盒安全码重置
 * @param {*} obj 
 * @returns 
 */
export function resetCode(id) {
  return request({
    url: `/system/boxes/${id}/security_code/reset`,
    method: 'post',
  })
}
