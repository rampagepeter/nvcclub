import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authApi } from '@/services/api'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('accessToken'))
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 登录
  const login = async (credentials: LoginRequest) => {
    loading.value = true
    try {
      const response = await authApi.login(credentials)
      if (response.success && response.data) {
        const { accessToken, user: userData } = response.data

        // 保存到localStorage
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))

        // 更新store状态
        token.value = accessToken
        user.value = userData

        ElMessage.success('登录成功！')
        return true
      } else {
        ElMessage.error(response.message || '登录失败')
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (credentials: RegisterRequest) => {
    loading.value = true
    try {
      const response = await authApi.register(credentials)
      if (response.success) {
        ElMessage.success('注册成功！请登录')
        return true
      } else {
        ElMessage.error(response.message || '注册失败')
        return false
      }
    } catch (error: any) {
      console.error('Register error:', error)
      ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 清除本地存储和状态
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      token.value = null
      user.value = null
      ElMessage.success('已退出登录')
    }
  }

  // 初始化用户信息（从localStorage恢复）
  const initializeAuth = async () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('accessToken')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)

        // 不需要验证token，直接使用保存的用户信息
        // 因为我们使用的是模拟数据
      } catch (error) {
        console.error('Failed to restore user session:', error)
        logout()
      }
    }
  }

  // 更新用户信息
  const updateUser = (updatedUser: User) => {
    user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return {
    // 状态
    user,
    token,
    loading,
    // 计算属性
    isAuthenticated,
    isAdmin,
    // 方法
    login,
    register,
    logout,
    initializeAuth,
    updateUser,
  }
})
