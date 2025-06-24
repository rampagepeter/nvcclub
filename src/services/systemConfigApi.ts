import type {
  ActivityTypeConfig,
  SystemConfig,
  BadgeSystemConfig,
  UpdateActivityConfigRequest,
  UpdateSystemConfigRequest,
  ConfigManagementStats,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  BadgeSearchFilter,
  BadgeActivityLink,
  BadgeIconPreset,
  BadgeDesignOptions,
  BadgeListResponse,
  BadgeManagementStats,
  ApiResponse,
} from '@/types'

// 模拟活动类型配置数据
const mockActivityTypeConfigs: ActivityTypeConfig[] = [
  {
    type: 'EmpathyStation',
    name: '同理心驿站',
    description: '日常NVC练习活动，帮助成员掌握基础沟通技巧',
    baseXpReward: 50,
    bonusXpRules: {
      userLevelMultiplier: 0.1, // 每级增加10%奖励
      streakBonus: 5, // 连续参与奖励
      qualityBonus: 10, // 高质量参与奖励
    },
    frequency: 'daily',
    defaultDuration: 60,
    defaultCapacity: 30,
    participationRequirements: {
      minLevel: 1,
      requiredBadges: [],
      cooldownHours: 0,
    },
    badgeTriggerRules: [
      {
        badgeId: 'station_regular',
        triggerCount: 10,
        description: '参加10次驿站活动获得"驿站常客"徽章',
      },
      {
        badgeId: 'listening_ear',
        triggerCount: 20,
        description: '参加20次驿站活动获得"聆听之耳"徽章',
      },
      {
        badgeId: 'empathy_master',
        triggerCount: 50,
        description: '参加50次驿站活动获得"同理心大师"徽章',
      },
    ],
    levelProgressRules: {
      xpPerLevel: 1000,
      maxLevel: 50,
    },
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
    updatedAt: new Date('2024-12-15T10:30:00'),
  },
  {
    type: 'ThemeSalon',
    name: '主题沙龙',
    description: '深度主题探讨活动，每月一次的深入学习',
    baseXpReward: 150,
    bonusXpRules: {
      userLevelMultiplier: 0.15,
      streakBonus: 20,
      qualityBonus: 30,
    },
    frequency: 'monthly',
    defaultDuration: 150,
    defaultCapacity: 50,
    participationRequirements: {
      minLevel: 3,
      requiredBadges: ['station_regular'],
      cooldownHours: 0,
    },
    badgeTriggerRules: [
      {
        badgeId: 'salon_explorer',
        triggerCount: 5,
        description: '参加5次沙龙活动获得"沙龙探索家"徽章',
      },
    ],
    levelProgressRules: {
      xpPerLevel: 1000,
      maxLevel: 50,
    },
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
    updatedAt: new Date('2024-12-10T14:20:00'),
  },
  {
    type: 'LifeGrowth',
    name: '刘轶说生命成长',
    description: '季度生命成长分享，深度探索生命智慧',
    baseXpReward: 300,
    bonusXpRules: {
      userLevelMultiplier: 0.2,
      streakBonus: 50,
      qualityBonus: 100,
    },
    frequency: 'quarterly',
    defaultDuration: 180,
    defaultCapacity: 200,
    participationRequirements: {
      minLevel: 5,
      requiredBadges: ['salon_explorer'],
      cooldownHours: 0,
    },
    badgeTriggerRules: [
      {
        badgeId: 'wisdom_seeker',
        triggerCount: 3,
        description: '参加3次生命成长活动获得"智慧寻求者"徽章',
      },
    ],
    levelProgressRules: {
      xpPerLevel: 1000,
      maxLevel: 50,
    },
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
]

// 模拟系统配置数据
const mockSystemConfigs: SystemConfig[] = [
  {
    configId: 'config_001',
    category: 'general',
    key: 'site_name',
    value: 'NVC成长乐园',
    description: '网站名称',
    dataType: 'string',
    isEditable: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    configId: 'config_002',
    category: 'general',
    key: 'max_upload_size',
    value: 10,
    description: '最大上传文件大小（MB）',
    dataType: 'number',
    isEditable: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    configId: 'config_003',
    category: 'notification',
    key: 'activity_reminder_hours',
    value: [24, 2],
    description: '活动提醒时间（小时）',
    dataType: 'array',
    isEditable: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    configId: 'config_004',
    category: 'badge',
    key: 'badge_notification_enabled',
    value: true,
    description: '徽章获得通知开关',
    dataType: 'boolean',
    isEditable: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    configId: 'config_005',
    category: 'activity',
    key: 'daily_xp_limit',
    value: 500,
    description: '每日经验值获取上限',
    dataType: 'number',
    isEditable: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
]

// 模拟徽章系统配置数据
const mockBadgeConfigs: BadgeSystemConfig[] = [
  {
    badgeId: 'station_regular',
    name: '驿站常客',
    description: '经常参加同理心驿站活动的用户',
    category: 'Participation',
    iconUrl: '/badges/station_regular.png',
    unlockCriteria: {
      type: 'activity_count',
      activityTypes: ['EmpathyStation'],
      threshold: 10,
      timeframe: 'all_time',
    },
    rewards: {
      xpBonus: 0,
      specialPrivileges: ['优先报名权'],
    },
    rarity: 'common',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    badgeId: 'empathy_master',
    name: '同理心大师',
    description: '完成50次同理心驿站练习的高手',
    category: 'Skill',
    iconUrl: '/badges/empathy_master.png',
    unlockCriteria: {
      type: 'activity_count',
      activityTypes: ['EmpathyStation'],
      threshold: 50,
      timeframe: 'all_time',
    },
    rewards: {
      xpBonus: 10,
      specialPrivileges: ['导师资格', '专属头像框'],
    },
    rarity: 'epic',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    badgeId: 'salon_explorer',
    name: '沙龙探索家',
    description: '积极参与主题沙龙的探索者',
    category: 'Participation',
    iconUrl: '/badges/salon_explorer.png',
    unlockCriteria: {
      type: 'activity_count',
      activityTypes: ['ThemeSalon'],
      threshold: 5,
      timeframe: 'all_time',
    },
    rewards: {
      xpBonus: 5,
      specialPrivileges: ['主题建议权'],
    },
    rarity: 'rare',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
]

// 模拟徽章图标预设
const mockBadgeIconPresets: BadgeIconPreset[] = [
  {
    iconId: 'skill_listening',
    name: '聆听图标',
    iconUrl: '/badges/icons/listening.svg',
    category: 'Skill',
    tags: ['聆听', '耳朵', '技能'],
  },
  {
    iconId: 'skill_empathy',
    name: '同理心图标',
    iconUrl: '/badges/icons/empathy.svg',
    category: 'Skill',
    tags: ['同理心', '心形', '连接'],
  },
  {
    iconId: 'participation_star',
    name: '参与之星',
    iconUrl: '/badges/icons/star.svg',
    category: 'Participation',
    tags: ['星星', '参与', '活跃'],
  },
  {
    iconId: 'contribution_hand',
    name: '援助之手',
    iconUrl: '/badges/icons/helping_hand.svg',
    category: 'Contribution',
    tags: ['手', '帮助', '贡献'],
  },
  {
    iconId: 'special_crown',
    name: '王冠图标',
    iconUrl: '/badges/icons/crown.svg',
    category: 'Special',
    tags: ['王冠', '特殊', '荣耀'],
  },
]

// 模拟徽章设计选项
const mockBadgeDesignOptions: BadgeDesignOptions = {
  backgroundColors: [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
  ],
  iconPresets: mockBadgeIconPresets,
  borderStyles: [
    { id: 'none', name: '无边框', cssClass: 'border-none' },
    { id: 'solid', name: '实线边框', cssClass: 'border-solid' },
    { id: 'dashed', name: '虚线边框', cssClass: 'border-dashed' },
    { id: 'dotted', name: '点线边框', cssClass: 'border-dotted' },
  ],
  glowEffects: [
    { id: 'none', name: '无光效', cssClass: 'glow-none' },
    { id: 'soft', name: '柔和光晕', cssClass: 'glow-soft' },
    { id: 'bright', name: '明亮光晕', cssClass: 'glow-bright' },
    { id: 'rainbow', name: '彩虹光晕', cssClass: 'glow-rainbow' },
  ],
}

// 模拟徽章活动联动配置
const mockBadgeActivityLinks: BadgeActivityLink[] = [
  {
    linkId: 'link_001',
    badgeId: 'station_regular',
    activityType: 'EmpathyStation',
    triggerCondition: {
      type: 'participation_count',
      threshold: 10,
      timeframe: 'all_time',
    },
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
  {
    linkId: 'link_002',
    badgeId: 'salon_explorer',
    activityType: 'ThemeSalon',
    triggerCondition: {
      type: 'participation_count',
      threshold: 5,
      timeframe: 'all_time',
    },
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
  },
]

class SystemConfigApi {
  // 获取活动类型配置列表
  async getActivityTypeConfigs(): Promise<ApiResponse<ActivityTypeConfig[]>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      data: mockActivityTypeConfigs,
    }
  }

  // 更新活动类型配置
  async updateActivityTypeConfig(
    type: string,
    request: UpdateActivityConfigRequest,
  ): Promise<ApiResponse<ActivityTypeConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const config = mockActivityTypeConfigs.find((c) => c.type === type)
    if (!config) {
      return {
        success: false,
        error: '活动类型配置不存在',
      }
    }

    // 更新配置
    Object.assign(config, request, {
      updatedAt: new Date(),
    })

    return {
      success: true,
      data: config,
      message: '活动类型配置更新成功',
    }
  }

  // 获取系统配置列表
  async getSystemConfigs(category?: string): Promise<ApiResponse<SystemConfig[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let configs = [...mockSystemConfigs]
    if (category && category !== 'all') {
      configs = configs.filter((c) => c.category === category)
    }

    return {
      success: true,
      data: configs,
    }
  }

  // 更新系统配置
  async updateSystemConfig(
    configId: string,
    request: UpdateSystemConfigRequest,
  ): Promise<ApiResponse<SystemConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const config = mockSystemConfigs.find((c) => c.configId === configId)
    if (!config) {
      return {
        success: false,
        error: '系统配置不存在',
      }
    }

    // 更新配置
    config.value = request.value
    if (request.description) {
      config.description = request.description
    }
    config.updatedAt = new Date()

    return {
      success: true,
      data: config,
      message: '系统配置更新成功',
    }
  }

  // 获取徽章系统配置
  async getBadgeConfigs(): Promise<ApiResponse<BadgeSystemConfig[]>> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return {
      success: true,
      data: mockBadgeConfigs.sort((a, b) => a.displayOrder - b.displayOrder),
    }
  }

  // 更新徽章配置
  async updateBadgeConfig(
    badgeId: string,
    request: Partial<BadgeSystemConfig>,
  ): Promise<ApiResponse<BadgeSystemConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const badge = mockBadgeConfigs.find((b) => b.badgeId === badgeId)
    if (!badge) {
      return {
        success: false,
        error: '徽章配置不存在',
      }
    }

    // 更新配置
    Object.assign(badge, request, {
      updatedAt: new Date(),
    })

    return {
      success: true,
      data: badge,
      message: '徽章配置更新成功',
    }
  }

  // 获取配置管理统计
  async getConfigStats(): Promise<ApiResponse<ConfigManagementStats>> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const stats: ConfigManagementStats = {
      totalConfigs: mockSystemConfigs.length,
      activeActivityTypes: mockActivityTypeConfigs.filter((c) => c.isActive).length,
      activeBadges: mockBadgeConfigs.filter((b) => b.isActive).length,
      totalXpDistributed: 45600,
      avgXpPerActivity: 156,
      mostTriggeredBadge: {
        badgeId: 'station_regular',
        name: '驿站常客',
        triggerCount: 89,
      },
      activityTypeStats: [
        {
          type: '同理心驿站',
          totalActivities: 156,
          totalParticipants: 2340,
          avgXpReward: 50,
          popularityRank: 1,
        },
        {
          type: '主题沙龙',
          totalActivities: 12,
          totalParticipants: 480,
          avgXpReward: 150,
          popularityRank: 2,
        },
        {
          type: '生命成长',
          totalActivities: 4,
          totalParticipants: 680,
          avgXpReward: 300,
          popularityRank: 3,
        },
      ],
    }

    return {
      success: true,
      data: stats,
    }
  }

  // 重置活动类型配置为默认值
  async resetActivityTypeConfig(type: string): Promise<ApiResponse<ActivityTypeConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 700))

    const config = mockActivityTypeConfigs.find((c) => c.type === type)
    if (!config) {
      return {
        success: false,
        error: '活动类型配置不存在',
      }
    }

    // 重置为默认值（根据类型）
    const defaultConfigs = {
      EmpathyStation: {
        baseXpReward: 50,
        bonusXpRules: {
          userLevelMultiplier: 0.1,
          streakBonus: 5,
          qualityBonus: 10,
        },
        defaultDuration: 60,
        defaultCapacity: 30,
        participationRequirements: {
          minLevel: 1,
          requiredBadges: [],
          cooldownHours: 0,
        },
      },
      ThemeSalon: {
        baseXpReward: 150,
        bonusXpRules: {
          userLevelMultiplier: 0.15,
          streakBonus: 20,
          qualityBonus: 30,
        },
        defaultDuration: 150,
        defaultCapacity: 50,
        participationRequirements: {
          minLevel: 3,
          requiredBadges: ['station_regular'],
          cooldownHours: 0,
        },
      },
      LifeGrowth: {
        baseXpReward: 300,
        bonusXpRules: {
          userLevelMultiplier: 0.2,
          streakBonus: 50,
          qualityBonus: 100,
        },
        defaultDuration: 180,
        defaultCapacity: 200,
        participationRequirements: {
          minLevel: 5,
          requiredBadges: ['salon_explorer'],
          cooldownHours: 0,
        },
      },
    }

    const defaultConfig = defaultConfigs[type as keyof typeof defaultConfigs]
    if (defaultConfig) {
      Object.assign(config, defaultConfig, {
        updatedAt: new Date(),
      })
    }

    return {
      success: true,
      data: config,
      message: '活动类型配置已重置为默认值',
    }
  }

  // 批量更新徽章显示顺序
  async updateBadgeDisplayOrder(
    badgeOrders: { badgeId: string; displayOrder: number }[],
  ): Promise<ApiResponse<BadgeSystemConfig[]>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    badgeOrders.forEach((order) => {
      const badge = mockBadgeConfigs.find((b) => b.badgeId === order.badgeId)
      if (badge) {
        badge.displayOrder = order.displayOrder
        badge.updatedAt = new Date()
      }
    })

    return {
      success: true,
      data: mockBadgeConfigs.sort((a, b) => a.displayOrder - b.displayOrder),
      message: '徽章显示顺序更新成功',
    }
  }

  // 创建新徽章
  async createBadge(request: CreateBadgeRequest): Promise<ApiResponse<BadgeSystemConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 生成新的徽章ID
    const newBadgeId = `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newBadge: BadgeSystemConfig = {
      badgeId: newBadgeId,
      name: request.name,
      description: request.description,
      category: request.category,
      iconUrl: request.iconUrl || `/badges/default_${request.category.toLowerCase()}.png`,
      unlockCriteria: request.unlockCriteria,
      rewards: request.rewards,
      rarity: request.rarity,
      isActive: request.isActive !== false,
      displayOrder: request.displayOrder || mockBadgeConfigs.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 添加到模拟数据中
    mockBadgeConfigs.push(newBadge)

    return {
      success: true,
      data: newBadge,
      message: '徽章创建成功',
    }
  }

  // 更新徽章
  async updateBadge(
    badgeId: string,
    request: UpdateBadgeRequest,
  ): Promise<ApiResponse<BadgeSystemConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const badge = mockBadgeConfigs.find((b) => b.badgeId === badgeId)
    if (!badge) {
      return {
        success: false,
        error: '徽章不存在',
      }
    }

    // 更新徽章信息
    Object.assign(badge, request, {
      updatedAt: new Date(),
    })

    return {
      success: true,
      data: badge,
      message: '徽章更新成功',
    }
  }

  // 删除徽章
  async deleteBadge(badgeId: string): Promise<ApiResponse<void>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = mockBadgeConfigs.findIndex((b) => b.badgeId === badgeId)
    if (index === -1) {
      return {
        success: false,
        error: '徽章不存在',
      }
    }

    // 检查是否有用户已获得此徽章
    // 这里可以添加检查逻辑，如果有用户已获得则不允许删除

    mockBadgeConfigs.splice(index, 1)

    return {
      success: true,
      message: '徽章删除成功',
    }
  }

  // 获取徽章列表（支持搜索和筛选）
  async getBadgeList(
    filter: BadgeSearchFilter = {},
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ApiResponse<BadgeListResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    let filteredBadges = [...mockBadgeConfigs]

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      filteredBadges = filteredBadges.filter(
        (badge) =>
          badge.name.toLowerCase().includes(keyword) ||
          badge.description.toLowerCase().includes(keyword),
      )
    }

    // 分类筛选
    if (filter.category && filter.category !== 'all') {
      filteredBadges = filteredBadges.filter((badge) => badge.category === filter.category)
    }

    // 稀有度筛选
    if (filter.rarity && filter.rarity !== 'all') {
      filteredBadges = filteredBadges.filter((badge) => badge.rarity === filter.rarity)
    }

    // 状态筛选
    if (filter.isActive !== undefined) {
      filteredBadges = filteredBadges.filter((badge) => badge.isActive === filter.isActive)
    }

    // 活动类型筛选
    if (filter.activityType && filter.activityType !== 'all') {
      filteredBadges = filteredBadges.filter((badge) =>
        badge.unlockCriteria.activityTypes?.includes(filter.activityType as any),
      )
    }

    // 排序
    const sortBy = filter.sortBy || 'display_order'
    const sortOrder = filter.sortOrder || 'asc'

    filteredBadges.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'newest':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'oldest':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'display_order':
          aValue = a.displayOrder
          bValue = b.displayOrder
          break
        default:
          aValue = a.displayOrder
          bValue = b.displayOrder
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })

    // 分页
    const total = filteredBadges.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const badges = filteredBadges.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        badges,
        total,
        page,
        pageSize,
        totalPages,
      },
    }
  }

  // 获取徽章设计选项
  async getBadgeDesignOptions(): Promise<ApiResponse<BadgeDesignOptions>> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      success: true,
      data: mockBadgeDesignOptions,
    }
  }

  // 获取徽章活动联动配置
  async getBadgeActivityLinks(badgeId?: string): Promise<ApiResponse<BadgeActivityLink[]>> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    let links = [...mockBadgeActivityLinks]
    if (badgeId) {
      links = links.filter((link) => link.badgeId === badgeId)
    }

    return {
      success: true,
      data: links,
    }
  }

  // 创建徽章活动联动
  async createBadgeActivityLink(
    link: Omit<BadgeActivityLink, 'linkId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ApiResponse<BadgeActivityLink>> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newLink: BadgeActivityLink = {
      ...link,
      linkId: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockBadgeActivityLinks.push(newLink)

    return {
      success: true,
      data: newLink,
      message: '活动联动配置创建成功',
    }
  }

  // 获取徽章管理统计
  async getBadgeManagementStats(): Promise<ApiResponse<BadgeManagementStats>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const stats: BadgeManagementStats = {
      totalBadges: mockBadgeConfigs.length,
      activeBadges: mockBadgeConfigs.filter((b) => b.isActive).length,
      badgesByCategory: [
        {
          category: '技能类',
          count: mockBadgeConfigs.filter((b) => b.category === 'Skill').length,
        },
        {
          category: '参与类',
          count: mockBadgeConfigs.filter((b) => b.category === 'Participation').length,
        },
        {
          category: '贡献类',
          count: mockBadgeConfigs.filter((b) => b.category === 'Contribution').length,
        },
        {
          category: '特殊类',
          count: mockBadgeConfigs.filter((b) => b.category === 'Special').length,
        },
      ],
      badgesByRarity: [
        { rarity: '普通', count: mockBadgeConfigs.filter((b) => b.rarity === 'common').length },
        { rarity: '稀有', count: mockBadgeConfigs.filter((b) => b.rarity === 'rare').length },
        { rarity: '史诗', count: mockBadgeConfigs.filter((b) => b.rarity === 'epic').length },
        { rarity: '传说', count: mockBadgeConfigs.filter((b) => b.rarity === 'legendary').length },
      ],
      mostTriggeredBadges: [
        { badgeId: 'station_regular', name: '驿站常客', triggerCount: 156 },
        { badgeId: 'empathy_master', name: '同理心大师', triggerCount: 89 },
        { badgeId: 'salon_explorer', name: '沙龙探索家', triggerCount: 45 },
      ],
      recentlyCreated: mockBadgeConfigs.slice(-5).reverse(),
    }

    return {
      success: true,
      data: stats,
    }
  }
}

// 导出API实例
export const systemConfigApi = new SystemConfigApi()
export default systemConfigApi
