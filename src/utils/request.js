import axios from 'axios'
import router from '../router' // 导入路由实例，用于跳转登录页
import { useAuthStore } from '../stores/auth'
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_KOA_BASE_URL, // API基础URL
  timeout: 5000, // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如添加token
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 处理请求错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const data = response.data
    const status = response.status
    // 处理文件响应（非JSON格式）
    if (
      response.headers['content-type'] &&
      (response.headers['content-type'].includes('application/octet-stream') ||
        response.headers['content-type'].includes('image/'))
    ) {
      return data
    }

    // 处理JSON响应
    if (typeof data === 'object') {
      // 成功响应
      if (data.status === 'success') {
        // 可选：对特定成功操作显示提示
        if (data.msg && data.msg !== 'success') {
          console.log(data.message || data.msg)
          // NotifyPlugin('success', {
          //   title: '操作成功',
          //   content: data.message || data.msg,
          //   duration: 2000,
          //   placement: 'bottom-right',
          //   closeBtn: true,
          // })
        }
        return data
      }

      // 业务错误响应
      if (data.status === 'fail') {
        console.warn('业务错误:', data)
        // 显示业务错误信息
        console.log(data.message || data.msg || '业务处理失败')
        // NotifyPlugin('warning', {
        //   title: '操作提示',
        //   content: data.message || data.msg || '业务处理失败',
        //   duration: 3000,
        //   closeBtn: true,
        //   placement: 'bottom-right',
        // })
        // 返回错误信息，便于业务代码处理
        return Promise.reject({
          type: 'business',
          code: data.code,
          message: data.message || data.msg || '业务处理失败',
          data: data,
        })
      }

      // HTTP错误响应（状态码非200但返回了JSON）
      if (data.status === 'error') {
        console.error('HTTP错误:', data)
        // NotifyPlugin('error', {
        //   title: '请求错误',
        //   content: data.message || data.msg || `服务器错误 (${status})`,
        //   duration: 3000,
        //   placement: 'bottom-right',
        //   closeBtn: true,
        // })
        return Promise.reject({
          type: 'http',
          status: status,
          code: data.code,
          message: data.message || data.msg || `服务器错误 (${status})`,
          data: data,
        })
      }
    }

    // 未定义格式的响应
    return data
  },
  (error) => {
    // 处理响应错误
    console.error('响应错误:', error)

    // 网络错误
    if (error.code === 'ERR_NETWORK') {
      // NotifyPlugin('error', {
      //   title: '网络错误',
      //   content: '请检查网络连接是否正常',
      //   duration: 3000,
      //   closeBtn: true,
      //   placement: 'bottom-right',
      // })
      return Promise.reject({
        type: 'network',
        message: '网络连接错误',
      })
    }

    // 超时错误
    if (error.code === 'ECONNABORTED') {
      // NotifyPlugin('error', {
      //   title: '请求超时',
      //   content: '服务器响应超时，请稍后重试',
      //   duration: 3000,
      //   closeBtn: true,
      //   placement: 'bottom-right',
      // })
      return Promise.reject({
        type: 'timeout',
        message: '请求超时',
      })
    }

    // 服务器响应的错误
    if (error.response) {
      const status = error.response.status
      const data = error.response.data || {}

      // 401 未授权/令牌过期
      if (status === 401) {
        // 清除token并跳转到登录页
        localStorage.removeItem('token')
        // NotifyPlugin('error', {
        //   title: '身份验证失败',
        //   content: data.message || data.msg || '您的登录已过期，请重新登录',
        //   duration: 3000,
        //   closeBtn: true,
        //   placement: 'bottom-right',
        // })
        // 跳转到登录页，记录当前路径以便登录后返回
        router.replace({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
        return Promise.reject({
          type: 'auth',
          status: status,
          message: data.message || data.msg || '未授权访问',
        })
      }

      // 403 权限不足
      if (status === 403) {
        // NotifyPlugin('error', {
        //   title: '权限不足',
        //   content: data.msg || '您没有执行此操作的权限',
        //   duration: 3000,
        //   closeBtn: true,
        //   placement: 'bottom-right',
        // })
        return Promise.reject({
          type: 'permission',
          status: status,
          message: data.message || data.msg || '权限不足',
        })
      }

      // 404 资源不存在
      if (status === 404) {
        // NotifyPlugin('error', {
        //   title: '资源不存在',
        //   content: data.msg || '请求的资源不存在',
        //   duration: 3000,
        //   closeBtn: true,
        //   placement: 'bottom-right',
        // })
        return Promise.reject({
          type: 'notFound',
          status: status,
          message: data.message || data.msg || '资源不存在',
        })
      }

      // 429 请求过于频繁
      if (status === 429) {
        // NotifyPlugin('error', {
        //   title: '请求频繁',
        //   content: data.message || data.msg || '请求过于频繁，请稍后再试',
        //   duration: 3000,
        //   closeBtn: true,
        //   placement: 'bottom-right',
        // })
        return Promise.reject({
          type: 'tooManyRequests',
          status: status,
          message: data.message || data.msg || '请求过于频繁',
        })
      }

      // 5xx 服务器错误
      if (status >= 500) {
        // NotifyPlugin('error', {
        //   title: '服务器错误',
        //   content: '服务器内部错误，请稍后重试',
        //   duration: 3000,
        //   closeBtn: true,
        //   placement: 'bottom-right',
        // })
        return Promise.reject({
          type: 'server',
          status: status,
          message: data.message || data.msg || '服务器内部错误',
        })
      }

      // 其他错误
      // NotifyPlugin('error', {
      //   title: '请求错误',
      //   content: data.message || data.msg || `操作失败 (${status})`,
      //   duration: 3000,
      //   closeBtn: true,
      //   placement: 'bottom-right',
      // })
      return Promise.reject({
        type: 'http',
        status: status,
        message: data.message || data.msg || `请求错误 (${status})`,
      })
    }

    // 其他未知错误
    // NotifyPlugin('error', {
    //   title: '未知错误',
    //   content: '发生未知错误，请稍后重试',
    //   duration: 3000,
    //   closeBtn: true,
    //   placement: 'bottom-right',
    // })
    return Promise.reject(error)
  },
)

export default service
