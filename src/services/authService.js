import request from '@/utils/request'

export function getUserInfo(data) {
  return request({
    url: '/login/api/get-user-info',
    method: 'get',
    params: data,
  })
}
