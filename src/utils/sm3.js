/**
 * sm3加密
 * @param {*} txt 
 * @returns 
 */
export function doSm3(str) {
  const sm3 = require('sm-crypto').sm3
  return sm3(str+'imi')
}