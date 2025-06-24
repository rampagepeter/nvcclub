import type {
  ActivityManagementData,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivitySearchFilter,
  ActivityListResponse,
  BatchAddParticipantsRequest,
  BatchAddParticipantsResult,
  UserActivityParticipation,
  XpRewardCalculation,
  BadgeTriggerCheck,
  ContentModerationItem,
  ModerationAction,
  PostManagementData,
  PostSearchFilter,
  PostListResponse,
  ApiResponse,
  UserManagementData,
  ActivityParticipant,
} from '@/types'

// 模拟活动管理数据
const mockActivities: ActivityManagementData[] = [
  {
    activityId: 'activity_001',
    type: 'EmpathyStation',
    title: '家庭亲子沟通练习',
    description: '在家庭场景中练习表达需求和倾听感受，学会与孩子建立深度连接',
    scheduledTime: new Date('2024-12-16T19:30:00'),
    durationInMinutes: 60,
    xpReward: 50,
    frequency: 'daily',
    location: '在线会议室',
    hostBy: 'NVC认证讲师',
    capacity: 30,
    registeredCount: 18,
    status: 'upcoming',
    createdBy: 'admin_001',
    createdAt: new Date('2024-12-10T10:00:00'),
    updatedAt: new Date('2024-12-12T15:30:00'),
    participants: [
      {
        userId: 'u1',
        userName: '张小花',
        userAvatar: 'https://picsum.photos/64/64?random=1',
        registeredAt: new Date('2024-12-11T09:00:00'),
        attendedAt: new Date('2024-12-16T19:30:00'),
        status: 'attended',
        rating: 5,
        feedback: '非常有收获的练习！',
        xpEarned: 50,
        badgesEarned: ['listener'],
      },
      {
        userId: 'u2',
        userName: '李同理',
        userAvatar: 'https://picsum.photos/64/64?random=2',
        registeredAt: new Date('2024-12-11T14:20:00'),
        status: 'registered',
        xpEarned: 0,
        badgesEarned: [],
      },
    ],
    totalParticipants: 18,
    completionRate: 85,
    averageRating: 4.6,
    tags: ['亲子沟通', 'NVC练习', '家庭关系'],
  },
  {
    activityId: 'activity_002',
    type: 'ThemeSalon',
    title: '12月主题沙龙：愤怒背后的礼物',
    description: '深度探讨愤怒情绪的智慧，学会将愤怒转化为内在力量和边界设定的能力',
    scheduledTime: new Date('2024-12-21T14:00:00'),
    durationInMinutes: 150,
    xpReward: 150,
    frequency: 'monthly',
    location: '北京·朝阳区NVC成长中心',
    hostBy: 'NVC资深导师团队',
    capacity: 50,
    registeredCount: 42,
    status: 'upcoming',
    createdBy: 'admin_001',
    createdAt: new Date('2024-11-20T10:00:00'),
    participants: [],
    totalParticipants: 42,
    completionRate: 0,
    tags: ['情绪管理', '愤怒转化', '主题沙龙'],
  },
  {
    activityId: 'activity_003',
    type: 'LifeGrowth',
    title: '刘轶说：从创伤到力量的生命转化',
    description: '刘轶老师分享生命成长的深层智慧，探讨如何将人生的创伤转化为内在的力量源泉',
    scheduledTime: new Date('2024-12-28T15:00:00'),
    durationInMinutes: 180,
    xpReward: 300,
    frequency: 'quarterly',
    location: '北京·海淀区国际会议中心',
    hostBy: '刘轶老师',
    capacity: 200,
    registeredCount: 156,
    status: 'upcoming',
    createdBy: 'admin_001',
    createdAt: new Date('2024-11-01T10:00:00'),
    participants: [],
    totalParticipants: 156,
    completionRate: 0,
    tags: ['生命成长', '创伤疗愈', '刘轶老师'],
  },
]

// 模拟用户数据
const mockUsers: UserManagementData[] = [
  {
    userId: 'u1',
    nickname: '张小花',
    phone: '13800138001',
    passwordHash: 'hashed_password',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=1',
    joinDate: new Date('2024-01-15'),
    level: 3,
    xp: 850,
    xpForNextLevel: 1200,
    streak: { current: 7, lastPracticeDate: new Date() },
    badges: ['listener', 'empathy_beginner'],
    inventory: {},
    growthTree: { level: 3, elements: { leaves: 25, flowers: 8, fruits: 3 } },
    status: 'active',
    totalActivities: 12,
    totalPosts: 5,
  },
  {
    userId: 'u2',
    nickname: '李同理',
    phone: '13800138002',
    passwordHash: 'hashed_password',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=2',
    joinDate: new Date('2024-02-20'),
    level: 2,
    xp: 450,
    xpForNextLevel: 600,
    streak: { current: 3, lastPracticeDate: new Date() },
    badges: ['newcomer'],
    inventory: {},
    growthTree: { level: 2, elements: { leaves: 15, flowers: 4, fruits: 1 } },
    status: 'active',
    totalActivities: 8,
    totalPosts: 3,
  },
  {
    userId: 'u3',
    nickname: '赵静心',
    phone: '13800138003',
    passwordHash: 'hashed_password',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=3',
    joinDate: new Date('2024-03-10'),
    level: 4,
    xp: 1150,
    xpForNextLevel: 1500,
    streak: { current: 12, lastPracticeDate: new Date() },
    badges: ['listener', 'empathy_master', 'station_regular'],
    inventory: {},
    growthTree: { level: 4, elements: { leaves: 35, flowers: 12, fruits: 5 } },
    status: 'active',
    totalActivities: 18,
    totalPosts: 8,
  },
]

class ContentManagementApi {
  private activities = mockActivities
  private mockUsers = mockUsers

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // 计算经验值奖励
  private calculateXpReward(activityType: string, userLevel: number): { totalXp: number } {
    let baseXp = 50
    let bonusXp = 0

    // 根据活动类型给予不同奖励
    switch (activityType) {
      case 'EmpathyStation':
        baseXp = 50
        bonusXp = userLevel >= 5 ? 10 : 5 // 高等级用户额外奖励
        break
      case 'ThemeSalon':
        baseXp = 150
        bonusXp = 20 // 沙龙固定奖励
        break
      case 'LifeGrowth':
        baseXp = 300
        bonusXp = 50 // 生命成长活动高奖励
        break
    }

    return { totalXp: baseXp + bonusXp }
  }

  // 检查徽章触发
  private checkBadgeTriggers(userId: string, activityType: string): { newBadges: string[] } {
    // 模拟徽章检查逻辑
    const newBadges: string[] = []

    // 根据活动类型和用户历史数据判断是否获得新徽章
    switch (activityType) {
      case 'EmpathyStation':
        // 检查是否达到驿站相关徽章条件
        newBadges.push('station_regular') // 示例
        break
      case 'ThemeSalon':
        newBadges.push('salon_explorer')
        break
      case 'LifeGrowth':
        newBadges.push('wisdom_seeker')
        break
    }

    return { newBadges }
  }

  // 获取活动详情
  async getActivityById(activityId: string): Promise<ActivityManagementData> {
    await this.delay(300)

    const activity = this.activities.find((a) => a.activityId === activityId)
    if (!activity) {
      throw new Error('活动不存在')
    }

    return { ...activity }
  }

  // 获取活动列表
  async getActivityList(
    page: number = 1,
    pageSize: number = 10,
    filter?: ActivitySearchFilter,
  ): Promise<ApiResponse<ActivityListResponse>> {
    await this.delay(500)

    try {
      let filteredActivities = [...this.activities]

      // 应用筛选条件
      if (filter) {
        if (filter.keyword) {
          const keyword = filter.keyword.toLowerCase()
          filteredActivities = filteredActivities.filter(
            (activity) =>
              activity.title.toLowerCase().includes(keyword) ||
              activity.description.toLowerCase().includes(keyword) ||
              activity.hostBy?.toLowerCase().includes(keyword),
          )
        }

        if (filter.type && filter.type !== 'all') {
          filteredActivities = filteredActivities.filter(
            (activity) => activity.type === filter.type,
          )
        }

        if (filter.status && filter.status !== 'all') {
          filteredActivities = filteredActivities.filter(
            (activity) => activity.status === filter.status,
          )
        }

        if (filter.hostBy) {
          filteredActivities = filteredActivities.filter((activity) =>
            activity.hostBy?.toLowerCase().includes(filter.hostBy!.toLowerCase()),
          )
        }

        // 排序
        if (filter.sortBy) {
          filteredActivities.sort((a, b) => {
            let comparison = 0
            switch (filter.sortBy) {
              case 'newest':
                comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                break
              case 'oldest':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                break
              case 'scheduled_time':
                comparison =
                  new Date(a.scheduledTime || 0).getTime() -
                  new Date(b.scheduledTime || 0).getTime()
                break
              case 'participants':
                comparison = b.totalParticipants - a.totalParticipants
                break
            }
            return filter.sortOrder === 'asc' ? -comparison : comparison
          })
        }
      }

      const total = filteredActivities.length
      const totalPages = Math.ceil(total / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const activities = filteredActivities.slice(startIndex, endIndex)

      return {
        success: true,
        data: {
          activities,
          total,
          page,
          pageSize,
          totalPages,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: '获取活动列表失败',
      }
    }
  }

  // 创建活动
  async createActivity(
    activityData: CreateActivityRequest,
  ): Promise<ApiResponse<ActivityManagementData>> {
    await this.delay(800)

    try {
      const newActivity: ActivityManagementData = {
        activityId: `activity_${Date.now()}`,
        ...activityData,
        registeredCount: 0,
        status: 'upcoming',
        createdBy: 'admin_001', // 实际应该从当前用户获取
        createdAt: new Date(),
        participants: [],
        totalParticipants: 0,
        completionRate: 0,
      }

      this.activities.push(newActivity)

      return {
        success: true,
        data: newActivity,
        message: '活动创建成功',
      }
    } catch (error) {
      return {
        success: false,
        error: '创建活动失败',
      }
    }
  }

  // 更新活动
  async updateActivity(
    activityId: string,
    activityData: UpdateActivityRequest,
  ): Promise<ApiResponse<ActivityManagementData>> {
    await this.delay(500)

    try {
      const activityIndex = this.activities.findIndex((a) => a.activityId === activityId)
      if (activityIndex === -1) {
        return {
          success: false,
          error: '活动不存在',
        }
      }

      const updatedActivity = {
        ...this.activities[activityIndex],
        ...activityData,
        updatedAt: new Date(),
      }

      this.activities[activityIndex] = updatedActivity

      return {
        success: true,
        data: updatedActivity,
        message: '活动更新成功',
      }
    } catch (error) {
      return {
        success: false,
        error: '更新活动失败',
      }
    }
  }

  // 删除活动
  async deleteActivity(activityId: string): Promise<ApiResponse<void>> {
    await this.delay(500)

    try {
      const activityIndex = this.activities.findIndex((a) => a.activityId === activityId)
      if (activityIndex === -1) {
        return {
          success: false,
          error: '活动不存在',
        }
      }

      this.activities.splice(activityIndex, 1)

      return {
        success: true,
        message: '活动删除成功',
      }
    } catch (error) {
      return {
        success: false,
        error: '删除活动失败',
      }
    }
  }

  // 批量添加参与者
  async batchAddParticipants(
    request: BatchAddParticipantsRequest,
  ): Promise<BatchAddParticipantsResult> {
    await this.delay(1000) // 模拟网络延迟

    try {
      const activity = this.activities.find((a) => a.activityId === request.activityId)
      if (!activity) {
        throw new Error('活动不存在')
      }

      const results: Array<{
        userId: string
        userName: string
        success: boolean
        error?: string
        xpEarned: number
        badgesEarned: string[]
      }> = []

      let successCount = 0
      let failureCount = 0

      for (const userId of request.userIds) {
        const user = this.mockUsers.find((u) => u.userId === userId)

        if (!user) {
          results.push({
            userId,
            userName: '未知用户',
            success: false,
            error: '用户不存在',
            xpEarned: 0,
            badgesEarned: [],
          })
          failureCount++
          continue
        }

        // 检查是否已经参与
        const existingParticipant = activity.participants.find((p) => p.userId === userId)
        if (existingParticipant) {
          results.push({
            userId,
            userName: user.nickname,
            success: false,
            error: '用户已参与此活动',
            xpEarned: 0,
            badgesEarned: [],
          })
          failureCount++
          continue
        }

        // 检查活动容量
        if (activity.capacity && activity.totalParticipants >= activity.capacity) {
          results.push({
            userId,
            userName: user.nickname,
            success: false,
            error: '活动已满员',
            xpEarned: 0,
            badgesEarned: [],
          })
          failureCount++
          continue
        }

        // 计算经验值奖励
        const xpCalculation = this.calculateXpReward(activity.type, user.level)
        const badgeCheck = this.checkBadgeTriggers(userId, activity.type)

        // 创建参与者记录
        const participant: ActivityParticipant = {
          userId,
          userName: user.nickname,
          userAvatar: user.avatarUrl,
          registeredAt: new Date(),
          status: request.autoAttend ? 'attended' : 'registered',
          attendedAt: request.autoAttend ? new Date() : undefined,
          xpEarned: request.autoAttend ? xpCalculation.totalXp : 0,
          badgesEarned: request.autoAttend ? badgeCheck.newBadges : [],
        }

        // 添加到活动参与者列表
        activity.participants.push(participant)
        activity.totalParticipants++

        // 如果自动参加，更新完成率
        if (request.autoAttend) {
          const attendedCount = activity.participants.filter((p) => p.status === 'attended').length
          activity.completionRate = Math.round((attendedCount / activity.totalParticipants) * 100)
        }

        results.push({
          userId,
          userName: user.nickname,
          success: true,
          xpEarned: participant.xpEarned,
          badgesEarned: participant.badgesEarned,
        })
        successCount++
      }

      return {
        success: successCount > 0,
        successCount,
        failureCount,
        results,
        message: `批量添加完成：成功 ${successCount} 个，失败 ${failureCount} 个`,
      }
    } catch (error) {
      return {
        success: false,
        successCount: 0,
        failureCount: request.userIds.length,
        error: '系统错误',
        results: request.userIds.map((userId) => ({
          userId,
          userName: '未知用户',
          success: false,
          error: '系统错误',
          xpEarned: 0,
          badgesEarned: [],
        })),
      }
    }
  }

  // 标记参与者参与状态
  async markParticipantAttendance(
    activityId: string,
    userId: string,
    markAsAttended: boolean,
  ): Promise<{
    success: boolean
    message?: string
    xpEarned: number
    badgesEarned: string[]
  }> {
    await this.delay(500)

    try {
      const activity = this.activities.find((a) => a.activityId === activityId)
      if (!activity) {
        return { success: false, message: '活动不存在', xpEarned: 0, badgesEarned: [] }
      }

      const participant = activity.participants.find((p) => p.userId === userId)
      if (!participant) {
        return { success: false, message: '参与者不存在', xpEarned: 0, badgesEarned: [] }
      }

      const user = this.mockUsers.find((u) => u.userId === userId)
      if (!user) {
        return { success: false, message: '用户不存在', xpEarned: 0, badgesEarned: [] }
      }

      let xpEarned = 0
      let badgesEarned: string[] = []

      if (markAsAttended) {
        // 标记为已参加
        participant.status = 'attended'
        participant.attendedAt = new Date()

        // 计算经验值奖励
        const xpCalculation = this.calculateXpReward(activity.type, user.level)
        xpEarned = xpCalculation.totalXp
        participant.xpEarned = xpEarned

        // 检查徽章触发
        const badgeCheck = this.checkBadgeTriggers(userId, activity.type)
        badgesEarned = badgeCheck.newBadges
        participant.badgesEarned = badgesEarned
      } else {
        // 取消参加状态
        participant.status = 'registered'
        participant.attendedAt = undefined
        participant.xpEarned = 0
        participant.badgesEarned = []
      }

      // 更新活动完成率
      const attendedCount = activity.participants.filter((p) => p.status === 'attended').length
      activity.completionRate = Math.round((attendedCount / activity.totalParticipants) * 100)

      return {
        success: true,
        xpEarned,
        badgesEarned,
        message: markAsAttended ? '已标记为参加状态' : '已取消参加状态',
      }
    } catch (error) {
      return {
        success: false,
        message: '标记参加状态失败',
        xpEarned: 0,
        badgesEarned: [],
      }
    }
  }

  // 批量标记参与状态
  async batchMarkAttendance(
    activityId: string,
    userIds: string[],
    markAsAttended: boolean,
  ): Promise<{
    success: boolean
    successCount: number
    failureCount: number
    results: Array<{
      userId: string
      userName: string
      success: boolean
      error?: string
      xpEarned: number
      badgesEarned: string[]
    }>
  }> {
    await this.delay(800)

    const results = []
    let successCount = 0
    let failureCount = 0

    for (const userId of userIds) {
      try {
        const result = await this.markParticipantAttendance(activityId, userId, markAsAttended)
        const user = this.mockUsers.find((u) => u.userId === userId)

        if (result.success) {
          results.push({
            userId,
            userName: user?.nickname || '未知用户',
            success: true,
            xpEarned: result.xpEarned,
            badgesEarned: result.badgesEarned,
          })
          successCount++
        } else {
          results.push({
            userId,
            userName: user?.nickname || '未知用户',
            success: false,
            error: result.message,
            xpEarned: 0,
            badgesEarned: [],
          })
          failureCount++
        }
      } catch (error) {
        const user = this.mockUsers.find((u) => u.userId === userId)
        results.push({
          userId,
          userName: user?.nickname || '未知用户',
          success: false,
          error: '操作失败',
          xpEarned: 0,
          badgesEarned: [],
        })
        failureCount++
      }
    }

    return {
      success: successCount > 0,
      successCount,
      failureCount,
      results,
    }
  }

  // 获取用户参与活动记录
  async getUserActivityParticipations(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<ApiResponse<{ participations: UserActivityParticipation[]; total: number }>> {
    await this.delay(300)

    try {
      // 模拟用户参与记录
      const mockParticipations: UserActivityParticipation[] = [
        {
          participationId: 'part_001',
          userId,
          activityId: 'activity_001',
          activityTitle: '家庭亲子沟通练习',
          activityType: 'EmpathyStation',
          registeredAt: new Date('2024-12-11T09:00:00'),
          attendedAt: new Date('2024-12-16T19:30:00'),
          status: 'attended',
          xpEarned: 50,
          badgesEarned: ['listener'],
          rating: 5,
          feedback: '非常有收获的练习！',
        },
      ]

      const total = mockParticipations.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const participations = mockParticipations.slice(startIndex, endIndex)

      return {
        success: true,
        data: { participations, total },
      }
    } catch (error) {
      return {
        success: false,
        error: '获取参与记录失败',
      }
    }
  }
}

// 创建并导出API实例
export const contentManagementApi = new ContentManagementApi()

// 为了向后兼容，也导出单独的函数
export const getActivityList = contentManagementApi.getActivityList.bind(contentManagementApi)
export const createActivity = contentManagementApi.createActivity.bind(contentManagementApi)
export const updateActivity = contentManagementApi.updateActivity.bind(contentManagementApi)
export const deleteActivity = contentManagementApi.deleteActivity.bind(contentManagementApi)
export const batchAddParticipants =
  contentManagementApi.batchAddParticipants.bind(contentManagementApi)
export const markParticipantAttendance =
  contentManagementApi.markParticipantAttendance.bind(contentManagementApi)
export const batchMarkAttendance =
  contentManagementApi.batchMarkAttendance.bind(contentManagementApi)
export const getUserActivityParticipations =
  contentManagementApi.getUserActivityParticipations.bind(contentManagementApi)
