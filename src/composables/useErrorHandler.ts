import { ref, readonly } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

export interface ErrorInfo {
  message: string
  code?: string | number
  type: 'network' | 'business' | 'validation' | 'permission' | 'unknown'
  timestamp: Date
  context?: any
}

// 全局错误状态
const errors = ref<ErrorInfo[]>([])
const isOnline = ref(navigator.onLine)

// 监听网络状态
window.addEventListener('online', () => {
  isOnline.value = true
  ElMessage.success('网络连接已恢复')
})

window.addEventListener('offline', () => {
  isOnline.value = false
  ElMessage.warning('网络连接断开，请检查网络设置')
})

export function useErrorHandler() {
  // 添加错误记录
  const addError = (error: Partial<ErrorInfo>) => {
    const errorInfo: ErrorInfo = {
      message: error.message || '未知错误',
      code: error.code,
      type: error.type || 'unknown',
      timestamp: new Date(),
      context: error.context,
    }

    errors.value.unshift(errorInfo)

    // 保持错误记录不超过100条
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(0, 100)
    }
  }

  // 处理API错误
  const handleApiError = (error: any, context?: string) => {
    console.error('API Error:', error, 'Context:', context)

    let message = '操作失败，请重试'
    let type: ErrorInfo['type'] = 'network'
    const code = error?.response?.status

    if (!isOnline.value) {
      message = '网络连接断开，请检查网络设置'
      type = 'network'
    } else if (error?.response?.status === 401) {
      message = '登录已过期，请重新登录'
      type = 'permission'
      // 可以在这里触发重新登录逻辑
    } else if (error?.response?.status === 403) {
      message = '没有权限执行此操作'
      type = 'permission'
    } else if (error?.response?.status === 404) {
      message = '请求的资源不存在'
      type = 'business'
    } else if (error?.response?.status >= 500) {
      message = '服务器错误，请稍后重试'
      type = 'network'
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
      type = 'business'
    } else if (error?.message) {
      message = error.message
      type = 'unknown'
    }

    addError({
      message,
      code,
      type,
      context: context || 'API调用',
    })

    // 根据错误类型选择不同的提示方式
    if (type === 'permission') {
      ElNotification({
        title: '权限错误',
        message,
        type: 'warning',
        duration: 5000,
      })
    } else if (type === 'network') {
      ElMessage.error({
        message,
        duration: 3000,
        showClose: true,
      })
    } else {
      ElMessage.error(message)
    }
  }

  // 处理表单验证错误
  const handleValidationError = (errors: any, context?: string) => {
    console.warn('Validation Error:', errors, 'Context:', context)

    let message = '请检查表单填写是否正确'

    if (typeof errors === 'object' && errors !== null) {
      const firstError = Object.values(errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        message = firstError[0] as string
      } else if (typeof firstError === 'string') {
        message = firstError
      }
    } else if (typeof errors === 'string') {
      message = errors
    }

    addError({
      message,
      type: 'validation',
      context: context || '表单验证',
    })

    ElMessage.warning(message)
  }

  // 处理业务逻辑错误
  const handleBusinessError = (message: string, context?: string) => {
    console.warn('Business Error:', message, 'Context:', context)

    addError({
      message,
      type: 'business',
      context: context || '业务逻辑',
    })

    ElMessage.warning(message)
  }

  // 处理未知错误
  const handleUnknownError = (error: any, context?: string) => {
    console.error('Unknown Error:', error, 'Context:', context)

    const message = error?.message || '发生未知错误，请重试'

    addError({
      message,
      type: 'unknown',
      context: context || '未知操作',
    })

    ElMessage.error(message)
  }

  // 网络重试机制
  const retry = async (fn: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    let lastError: any

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        if (i === maxRetries) {
          throw error
        }

        // 如果是网络错误且不在线，等待网络恢复
        if (!isOnline.value) {
          await new Promise((resolve) => {
            const checkOnline = () => {
              if (isOnline.value) {
                resolve(void 0)
              } else {
                setTimeout(checkOnline, 1000)
              }
            }
            checkOnline()
          })
        } else {
          // 指数退避延迟
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        }
      }
    }

    throw lastError
  }

  // 清空错误记录
  const clearErrors = () => {
    errors.value = []
  }

  // 获取特定类型的错误
  const getErrorsByType = (type: ErrorInfo['type']) => {
    return errors.value.filter((error) => error.type === type)
  }

  // 检查是否有未处理的重要错误
  const hasUnresolvedErrors = () => {
    return errors.value.some((error) => error.type === 'permission' || error.type === 'network')
  }

  return {
    // 状态
    errors: readonly(errors),
    isOnline: readonly(isOnline),

    // 错误处理方法
    handleApiError,
    handleValidationError,
    handleBusinessError,
    handleUnknownError,

    // 工具方法
    retry,
    clearErrors,
    getErrorsByType,
    hasUnresolvedErrors,
    addError,
  }
}

// 全局错误处理器
export const globalErrorHandler = useErrorHandler()

// Vue应用错误处理
export function setupGlobalErrorHandler(app: any) {
  app.config.errorHandler = (error: any, instance: any, info: string) => {
    console.error('Vue Error:', error, 'Instance:', instance, 'Info:', info)
    globalErrorHandler.handleUnknownError(error, `Vue错误: ${info}`)
  }
}

// Promise未处理错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
  globalErrorHandler.handleUnknownError(event.reason, 'Promise拒绝')
  event.preventDefault()
})

// 脚本错误
window.addEventListener('error', (event) => {
  console.error('Script Error:', event.error)
  globalErrorHandler.handleUnknownError(event.error, '脚本错误')
})
