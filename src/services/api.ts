import axios from 'axios'
import type {
  User,
  Activity,
  UserActivityLog,
  Badge,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  CommunityStats,
  AdminDashboardStats,
  FeedFilter,
  FeedPost,
  FeedComment,
  CreatePostRequest,
  CreateCommentRequest,
} from '@/types'
import {
  mockApiResponses,
  mockBadges,
  mockFeedPosts,
  mockFeedComments,
  mockPopularTags,
  mockAdminDashboardStats,
} from './mockData'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

// 模拟API延迟
const simulateApiCall = <T>(response: ApiResponse<T>, delay = 500): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(response), delay)
  })
}

// 认证相关API
export const authApi = {
  // 用户登录
  async login(
    credentials: LoginRequest,
  ): Promise<ApiResponse<{ accessToken: string; user: User }>> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 800)) // 模拟网络延迟

    // 简单验证逻辑
    if (credentials.phone === '13900139000') {
      return mockApiResponses.adminLogin
    } else {
      return mockApiResponses.login
    }
  },

  // 用户注册
  async register(userData: RegisterRequest): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return mockApiResponses.register
  },

  // 退出登录
  async logout(): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      success: true,
      message: '退出登录成功',
    }
  },
}

// 活动相关API
export const activityApi = {
  // 获取活动列表
  async getActivities(): Promise<ApiResponse<Activity[]>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockApiResponses.activities
  },

  // 获取推荐活动列表（最近3场活动）
  async getRecommendedActivities(): Promise<ApiResponse<Activity[]>> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const allActivities = mockApiResponses.activities.data || []
    
    // 首先获取所有即将开始的活动
    const now = new Date()
    const upcomingActivities = allActivities
      .filter(activity => activity.scheduledTime && new Date(activity.scheduledTime) > now)
    
    // 优先获取管理员设置的推荐活动
    const recommendedByAdmin = upcomingActivities
      .filter(activity => activity.isRecommended === true)
      .sort((a, b) => {
        const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0
        const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0
        return timeA - timeB
      })
    
    // 如果推荐活动不足3个，用时间排序的其他活动补充
    let finalActivities = [...recommendedByAdmin]
    
    if (finalActivities.length < 3) {
      const nonRecommended = upcomingActivities
        .filter(activity => activity.isRecommended !== true)
        .sort((a, b) => {
          const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0
          const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0
          return timeA - timeB
        })
      
      // 补充到3个
      const needed = 3 - finalActivities.length
      finalActivities = [...finalActivities, ...nonRecommended.slice(0, needed)]
    } else {
      // 如果推荐活动超过3个，只取前3个
      finalActivities = finalActivities.slice(0, 3)
    }
    
    return {
      success: true,
      data: finalActivities,
      message: '获取推荐活动成功'
    }
  },

  // 获取活动详情
  async getActivityById(activityId: string): Promise<ApiResponse<Activity>> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    // 注意：这里应该从 mockApiResponses.activities.data 中查找
    // 因为这个数组会被 registerActivity 和 unregisterActivity 修改
    const allActivities = mockApiResponses.activities.data || []
    const activity = allActivities.find(a => a.activityId === activityId)
    
    if (!activity) {
      return {
        success: false,
        message: '活动不存在'
      }
    }
    
    // 返回找到的活动（包含最新的参与者信息）
    return {
      success: true,
      data: activity,
      message: '获取活动详情成功'
    }
  },

  // 报名参加活动
  async registerActivity(activityId: string, userId: string): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    // 更新mock数据中的参与者列表
    const activities = mockApiResponses.activities.data || []
    const activityIndex = activities.findIndex(a => a.activityId === activityId)
    
    if (activityIndex !== -1) {
      const activity = activities[activityIndex]
      
      // 检查是否已经报名
      const isAlreadyRegistered = activity.participants?.some(p => p.userId === userId)
      if (isAlreadyRegistered) {
        return {
          success: false,
          message: '您已经报名了这个活动'
        }
      }
      
      // 添加用户到参与者列表
      if (!activity.participants) {
        activity.participants = []
      }
      
      // 获取当前登录用户信息
      const token = localStorage.getItem('accessToken')
      const isAdmin = token?.includes('admin')
      const currentUser = isAdmin ? mockApiResponses.adminLogin.data.user : mockApiResponses.login.data.user
      
      activity.participants.push({
        userId: userId,
        userName: currentUser.nickname,
        userAvatar: currentUser.avatarUrl,
        registeredAt: new Date(),
        status: 'registered',
        xpEarned: 0,
        badgesEarned: [],
      })
      
      // 更新报名人数
      activity.registeredCount = activity.participants.length
      
      return {
        success: true,
        message: '报名成功！',
        data: { activityId, userId }
      }
    } else {
      return {
        success: false,
        message: '活动不存在'
      }
    }
  },

  // 取消报名
  async unregisterActivity(activityId: string, userId: string): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // 更新mock数据中的参与者列表
    const activities = mockApiResponses.activities.data || []
    const activityIndex = activities.findIndex(a => a.activityId === activityId)
    
    if (activityIndex !== -1) {
      const activity = activities[activityIndex]
      
      if (activity.participants) {
        // 从参与者列表中移除用户
        const participantIndex = activity.participants.findIndex(p => p.userId === userId)
        if (participantIndex !== -1) {
          activity.participants.splice(participantIndex, 1)
          // 更新报名人数
          activity.registeredCount = activity.participants.length
          
          return {
            success: true,
            message: '取消报名成功',
            data: { activityId, userId }
          }
        } else {
          return {
            success: false,
            message: '您还没有报名这个活动'
          }
        }
      } else {
        return {
          success: false,
          message: '您还没有报名这个活动'
        }
      }
    } else {
      return {
        success: false,
        message: '活动不存在'
      }
    }
  },

  // 更新活动推荐状态
  async updateActivityRecommendation(activityId: string, isRecommended: boolean): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    // 更新mock数据中的推荐状态
    const activities = mockApiResponses.activities.data || []
    const activityIndex = activities.findIndex(a => a.activityId === activityId)
    
    if (activityIndex !== -1) {
      activities[activityIndex].isRecommended = isRecommended
      
      return {
        success: true,
        message: `${isRecommended ? '设为推荐' : '取消推荐'}成功`,
        data: activities[activityIndex]
      }
    } else {
      return {
        success: false,
        message: '活动不存在'
      }
    }
  },

  // 参与活动
  async joinActivity(activityId: string): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return {
      success: true,
      message: '活动参与成功！获得经验值 +50',
      data: { xpGained: 50 },
    }
  },

  // 完成活动
  async completeActivity(activityId: string, data: any): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      success: true,
      message: '活动完成！获得经验值 +100',
      data: { xpGained: 100 },
    }
  },
}

// 用户相关API
export const userApi = {
  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<User>> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const token = localStorage.getItem('accessToken')
    const isAdmin = token?.includes('admin')

    return {
      success: true,
      data: isAdmin ? mockApiResponses.adminLogin.data.user : mockApiResponses.login.data.user,
      message: '获取用户信息成功',
    }
  },

  // 更新用户信息
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return {
      success: true,
      data: { ...mockApiResponses.login.data.user, ...data },
      message: '个人信息更新成功',
    }
  },

  // 获取用户活动历史
  getActivityLogs: (userId?: string): Promise<ApiResponse<UserActivityLog[]>> =>
    apiClient.get(`/logs${userId ? `?userId=${userId}` : '?userId=me'}`),
}

// 社区相关API
export const communityApi = {
  // 获取社区统计数据
  getCommunityStats: (): Promise<ApiResponse<CommunityStats>> => {
    return simulateApiCall(mockApiResponses.communityStats)
  },

  // 获取社区统计数据
  getStats: (): Promise<ApiResponse<CommunityStats>> => apiClient.get('/community/stats'),
}

// 管理员API
export const adminApi = {
  // 获取管理员主页统计数据
  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    await new Promise((resolve) => setTimeout(resolve, 600)) // 模拟网络延迟
    return {
      success: true,
      data: mockAdminDashboardStats,
      message: '获取管理员统计数据成功',
    }
  },

  // 获取所有用户列表
  getUsers: (params?: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{ users: User[]; total: number }>> =>
    apiClient.get('/admin/users', { params }),

  // 获取指定用户详细信息
  getUserDetail: (userId: string): Promise<ApiResponse<User & { logs: UserActivityLog[] }>> =>
    apiClient.get(`/admin/users/${userId}`),

  // 为用户手动添加活动记录
  addUserActivity: (
    userId: string,
    data: {
      activityId: string
      completedAt: Date
      notes?: string
    },
  ): Promise<ApiResponse<UserActivityLog>> =>
    apiClient.post(`/admin/users/${userId}/activities`, data),
}

// 练习相关API
export const practiceApi = {
  // 开始练习
  async startPractice(scenarioId: string, roleId: string): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      success: true,
      message: '练习开始，祝你学习愉快！',
      data: {
        sessionId: 'session_' + Date.now(),
        scenario: scenarioId,
        role: roleId,
      },
    }
  },

  // 提交练习结果
  async submitPractice(sessionId: string, result: any): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      success: true,
      message: '练习完成！获得经验值 +75',
      data: {
        xpGained: 75,
        feedback: '很棒的练习！你在表达需求方面有了明显进步。',
      },
    }
  },
}

// 徽章API
export const badgeApi = {
  getBadges: (): Promise<ApiResponse<Badge[]>> => {
    return simulateApiCall({
      success: true,
      data: mockBadges,
      message: '获取徽章列表成功',
    })
  },

  getUserBadgeProgress: (userId: string): Promise<ApiResponse<any>> => {
    // 模拟用户徽章进度数据
    const mockProgress = {
      station_count: 12,
      salon_count: 2,
      streak_days: 7,
      post_count: 8,
      growth_sessions: 0,
    }

    return simulateApiCall({
      success: true,
      data: mockProgress,
      message: '获取用户徽章进度成功',
    })
  },

  unlockBadge: (userId: string, badgeId: string): Promise<ApiResponse<any>> => {
    return simulateApiCall({
      success: true,
      message: '徽章解锁成功',
    })
  },
}

// 信息流API
export const feedApi = {
  // 获取动态列表
  getFeedPosts: (filter?: FeedFilter): Promise<ApiResponse<FeedPost[]>> => {
    let posts = [...mockFeedPosts]

    // 应用筛选条件
    if (filter) {
      if (filter.userId) {
        posts = posts.filter((post) => post.userId === filter.userId)
      }
      if (filter.tags && filter.tags.length > 0) {
        posts = posts.filter((post) => post.tags.some((tag) => filter.tags!.includes(tag)))
      }

      // 排序
      switch (filter.sortBy) {
        case 'popular':
          posts.sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount))
          break
        case 'trending':
          posts.sort((a, b) => b.sharesCount - a.sharesCount)
          break
        case 'newest':
        default:
          posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          break
      }
    }

    return simulateApiCall({
      success: true,
      data: posts,
      message: '获取动态列表成功',
    })
  },

  // 发布动态
  createPost: (request: CreatePostRequest): Promise<ApiResponse<FeedPost>> => {
    const newPost: FeedPost = {
      postId: `post_${Date.now()}`,
      userId: 'current_user',
      userName: '当前用户',
      userAvatar: '/avatars/current-user.png',
      content: request.content,
      images: request.images ? request.images.map((file) => URL.createObjectURL(file)) : [],
      tags: request.tags,
      mentionedActivities:
        request.mentionedActivities?.map((activityId) => ({
          activityId,
          activityTitle: '相关活动',
          activityType: 'EmpathyStation' as const,
        })) || [],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date(),
      isLiked: false,
      isBookmarked: false,
    }

    return simulateApiCall(
      {
        success: true,
        data: newPost,
        message: '发布动态成功',
      },
      1000,
    )
  },

  // 获取动态评论
  getComments: (postId: string): Promise<ApiResponse<FeedComment[]>> => {
    const comments = mockFeedComments.filter((comment) => comment.postId === postId)

    return simulateApiCall({
      success: true,
      data: comments,
      message: '获取评论成功',
    })
  },

  // 发布评论
  createComment: (request: CreateCommentRequest): Promise<ApiResponse<FeedComment>> => {
    const newComment: FeedComment = {
      commentId: `comment_${Date.now()}`,
      postId: request.postId,
      userId: 'current_user',
      userName: '当前用户',
      userAvatar: '/avatars/current-user.png',
      content: request.content,
      likesCount: 0,
      createdAt: new Date(),
      isLiked: false,
      replyToCommentId: request.replyToCommentId,
    }

    return simulateApiCall({
      success: true,
      data: newComment,
      message: '发布评论成功',
    })
  },

  // 点赞/取消点赞
  toggleLike: (targetId: string, targetType: 'post' | 'comment'): Promise<ApiResponse<any>> => {
    return simulateApiCall({
      success: true,
      message: '操作成功',
    })
  },

  // 收藏/取消收藏
  toggleBookmark: (postId: string): Promise<ApiResponse<any>> => {
    return simulateApiCall({
      success: true,
      message: '操作成功',
    })
  },

  // 分享动态
  sharePost: (postId: string): Promise<ApiResponse<any>> => {
    return simulateApiCall({
      success: true,
      message: '分享成功',
    })
  },

  // 获取热门标签
  getPopularTags: (): Promise<ApiResponse<string[]>> => {
    return simulateApiCall({
      success: true,
      data: mockPopularTags,
      message: '获取热门标签成功',
    })
  },

  // 上传图片
  uploadImages: (files: File[]): Promise<ApiResponse<string[]>> => {
    const urls = files.map((file) => URL.createObjectURL(file))

    return simulateApiCall(
      {
        success: true,
        data: urls,
        message: '图片上传成功',
      },
      2000,
    )
  },
}

export default apiClient
