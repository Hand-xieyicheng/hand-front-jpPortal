import request from '@/utils/request'

export function getUserInfo(data) {
  return request({
    url: '/login/api/get-user-info',
    method: 'get',
    params: data,
  })
}

// get book list
export function getBookList(params) {
  return request({
    url: '/book/getBookList',
    method: 'get',
    params,
  })
}

// get course list
export function getLessonListByBookId(params) {
  return request({
    url: '/lesson/getLessonListByBookId',
    method: 'get',
    params,
  })
}

// get course detail
export function getLessonByLessonId(params) {
  return request({
    url: '/lesson/getLessonByLessonId',
    method: 'get',
    params,
  })
}

// get vocabulary list
export function getWordsListByLessonId(params) {
  return request({
    url: '/word/getWordsListByLessonId',
    method: 'get',
    params,
  })
}
