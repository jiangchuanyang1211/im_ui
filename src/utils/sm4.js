/**
 * sm4加密
 * @param {*} txt 
 * @returns 
 */
export function doSm4(str) {
  // // 导入 sm-crypto 库
    const sm = require('sm-crypto').sm4;
    // 定义密钥和明文
    const key = 'c6fd71b5b12361bc26daa4444349454b';
    const cipherText = sm.encrypt(str, key, {mode: 'cbc',padding:'pkcs#7' ,iv: '626865746e3562336973386478326464'})
    return cipherText;
}
/**
 * sm4解密
 * @param {*} txt 
 * @returns 
 */
export function doUnSm4(str) {
  // 导入 sm-crypto 库
    const sm = require('sm-crypto').sm4;
    // 定义密钥和明文
    const key = 'c6fd71b5b12361bc26daa4444349454b';
    const decryptedText = sm.decrypt(str, key, {mode: 'cbc',padding:'pkcs#7' , iv: '626865746e3562336973386478326464'})
    return decryptedText;
}