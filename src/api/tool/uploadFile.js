import request from '@/utils/request'

// 上传文件
export function uploadFile(url, params) {
  return request({
    url: url,
    method: 'post',
    data: params,
    headers: { 
      'Content-Type': 'multipart/form-data',
    },
  })
}

// // 下载文件
// export function downloadFile(url, params) {
//   return request({
//     url: url,
//     method: 'post',
//     data: params,
//     headers: { 
//       'Content-Type': 'multipart/form-data',
//     },
//   })
// }