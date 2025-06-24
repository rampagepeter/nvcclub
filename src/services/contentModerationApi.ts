import type {
  ContentModerationItem,
  ContentModerationItemExtended,
  ContentReport,
  ModerationAction,
  ModerationStats,
  ModerationSearchFilter,
  BatchModerationRequest,
  BatchModerationResult,
  TagManagement,
  TagSearchFilter,
  CreateTagRequest,
  UpdateTagRequest,
  AutoModerationRule,
  ModerationLog,
  ContentViolationCheck,
  ApiResponse,
} from '@/types'

// 模拟内容审核数据
const mockModerationItems: ContentModerationItemExtended[] = [
  {
    itemId: 'content_001',
    itemType: 'post',
    title: '今天的NVC练习心得',
    content:
      '今天参加了同理心驿站的活动，学会了如何更好地表达自己的感受和需求。特别是在与孩子沟通时，我发现用"我感到..."的表达方式比直接指责更有效果。#NVC学习 #同理心分享',
    authorId: 'u1',
    authorName: '张小花',
    authorAvatar: 'https://picsum.photos/64/64?random=1',
    createdAt: new Date('2024-12-14T10:30:00'),
    status: 'pending',
    reportCount: 0,
    reports: [],
    tags: ['NVC学习', '同理心分享'],
    likesCount: 15,
    commentsCount: 3,
    sharesCount: 2,
    autoModerationScore: 0.95,
    riskLevel: 'low',
  },
  {
    itemId: 'content_002',
    itemType: 'post',
    title: '分享一个沟通技巧',
    content:
      '在职场沟通中，我发现使用NVC的四个步骤真的很有用：观察、感受、需求、请求。这样可以避免很多不必要的冲突。#职场沟通 #NVC技巧',
    authorId: 'u2',
    authorName: '李同理',
    authorAvatar: 'https://picsum.photos/64/64?random=2',
    createdAt: new Date('2024-12-14T09:15:00'),
    status: 'approved',
    moderatorId: 'admin1',
    moderatorName: '管理员小王',
    moderatedAt: new Date('2024-12-14T09:30:00'),
    reportCount: 1,
    reports: [
      {
        reportId: 'report_001',
        reporterId: 'u3',
        reporterName: '王举报',
        reason: 'inappropriate',
        description: '内容不够详细，可能误导新手',
        reportedAt: new Date('2024-12-14T11:00:00'),
      },
    ],
    tags: ['职场沟通', 'NVC技巧'],
    likesCount: 28,
    commentsCount: 8,
    sharesCount: 5,
    lastReportedAt: new Date('2024-12-14T11:00:00'),
    autoModerationScore: 0.85,
    riskLevel: 'low',
  },
  {
    itemId: 'content_003',
    itemType: 'comment',
    title: '评论：关于愤怒情绪的处理',
    content:
      '我觉得这个方法不对，愤怒就应该直接表达出来，压抑只会让问题更严重。你们这些所谓的专家根本不懂真正的情绪管理！',
    authorId: 'u4',
    authorName: '赵直言',
    authorAvatar: 'https://picsum.photos/64/64?random=4',
    createdAt: new Date('2024-12-14T08:45:00'),
    status: 'pending',
    reportCount: 3,
    reports: [
      {
        reportId: 'report_002',
        reporterId: 'u1',
        reporterName: '张小花',
        reason: 'inappropriate',
        description: '与NVC理念不符，可能误导他人',
        reportedAt: new Date('2024-12-14T09:00:00'),
      },
      {
        reportId: 'report_003',
        reporterId: 'u2',
        reporterName: '李同理',
        reason: 'false_info',
        description: '传播错误信息',
        reportedAt: new Date('2024-12-14T09:30:00'),
      },
      {
        reportId: 'report_004',
        reporterId: 'u5',
        reporterName: '陈和谐',
        reason: 'harassment',
        description: '语言过于激进，有攻击性',
        reportedAt: new Date('2024-12-14T10:00:00'),
      },
    ],
    tags: ['情绪管理'],
    likesCount: 2,
    commentsCount: 12,
    sharesCount: 0,
    lastReportedAt: new Date('2024-12-14T10:00:00'),
    autoModerationScore: 0.35,
    riskLevel: 'high',
  },
  {
    itemId: 'content_004',
    itemType: 'post',
    title: '垃圾广告内容',
    content:
      '快来购买我们的神奇产品！只要998，立即解决所有沟通问题！微信：xxxxx，电话：xxxxx。限时优惠，错过后悔！！！',
    authorId: 'u6',
    authorName: '广告小王',
    authorAvatar: 'https://picsum.photos/64/64?random=6',
    createdAt: new Date('2024-12-14T07:20:00'),
    status: 'pending',
    reportCount: 5,
    reports: [
      {
        reportId: 'report_005',
        reporterId: 'u1',
        reporterName: '张小花',
        reason: 'spam',
        description: '明显的广告垃圾信息',
        reportedAt: new Date('2024-12-14T07:30:00'),
      },
      {
        reportId: 'report_006',
        reporterId: 'u2',
        reporterName: '李同理',
        reason: 'spam',
        description: '垃圾广告',
        reportedAt: new Date('2024-12-14T07:45:00'),
      },
      {
        reportId: 'report_007',
        reporterId: 'u3',
        reporterName: '王举报',
        reason: 'spam',
        description: '商业广告，不符合社区规范',
        reportedAt: new Date('2024-12-14T08:00:00'),
      },
      {
        reportId: 'report_008',
        reporterId: 'u4',
        reporterName: '赵直言',
        reason: 'spam',
        description: '垃圾信息',
        reportedAt: new Date('2024-12-14T08:15:00'),
      },
      {
        reportId: 'report_009',
        reporterId: 'u5',
        reporterName: '陈和谐',
        reason: 'spam',
        description: '广告内容，应该删除',
        reportedAt: new Date('2024-12-14T08:30:00'),
      },
    ],
    tags: [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    lastReportedAt: new Date('2024-12-14T08:30:00'),
    autoModerationScore: 0.15,
    riskLevel: 'critical',
  },
  {
    itemId: 'content_005',
    itemType: 'post',
    title: '感谢社区的温暖',
    content:
      '在这个社区里，我感受到了前所未有的温暖和理解。每个人都在用心倾听，用爱回应。这就是NVC的力量吧！感恩遇见大家。❤️',
    authorId: 'u7',
    authorName: '温暖小太阳',
    authorAvatar: 'https://picsum.photos/64/64?random=7',
    createdAt: new Date('2024-12-14T06:00:00'),
    status: 'approved',
    moderatorId: 'admin1',
    moderatorName: '管理员小王',
    moderatedAt: new Date('2024-12-14T06:15:00'),
    moderationReason: '内容积极正面，符合社区价值观',
    reportCount: 0,
    reports: [],
    tags: ['感恩', '社区温暖', 'NVC力量'],
    likesCount: 45,
    commentsCount: 15,
    sharesCount: 8,
    autoModerationScore: 0.98,
    riskLevel: 'low',
  },
]

// 模拟标签数据
const mockTags: TagManagement[] = [
  {
    tagId: 'tag_001',
    name: 'NVC学习',
    description: '非暴力沟通学习相关内容',
    category: 'nvc',
    usageCount: 156,
    isOfficial: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin1',
    status: 'active',
  },
  {
    tagId: 'tag_002',
    name: '同理心分享',
    description: '分享同理心相关的体验和感悟',
    category: 'emotion',
    usageCount: 89,
    isOfficial: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin1',
    status: 'active',
  },
  {
    tagId: 'tag_003',
    name: '职场沟通',
    description: '职场环境下的沟通技巧和经验',
    category: 'skill',
    usageCount: 67,
    isOfficial: false,
    createdAt: new Date('2024-02-15'),
    createdBy: 'u2',
    status: 'active',
  },
  {
    tagId: 'tag_004',
    name: '情绪管理',
    description: '情绪识别、表达和管理相关内容',
    category: 'emotion',
    usageCount: 134,
    isOfficial: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin1',
    status: 'active',
  },
  {
    tagId: 'tag_005',
    name: '亲子沟通',
    description: '父母与孩子之间的沟通技巧',
    category: 'skill',
    usageCount: 78,
    isOfficial: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin1',
    status: 'active',
  },
  {
    tagId: 'tag_006',
    name: '冲突解决',
    description: '处理和解决冲突的方法和技巧',
    category: 'skill',
    usageCount: 45,
    isOfficial: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin1',
    status: 'active',
  },
  {
    tagId: 'tag_007',
    name: '废弃标签',
    description: '这是一个已废弃的标签',
    category: 'general',
    usageCount: 12,
    isOfficial: false,
    createdAt: new Date('2024-03-01'),
    createdBy: 'u3',
    status: 'deprecated',
  },
]

// 模拟自动审核规则
const mockAutoModerationRules: AutoModerationRule[] = [
  {
    ruleId: 'rule_001',
    name: '垃圾广告检测',
    description: '检测包含广告关键词的内容',
    type: 'keyword',
    conditions: {
      keywords: ['购买', '微信', '电话', '优惠', '限时', '998', '神奇产品'],
    },
    action: 'flag',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    ruleId: 'rule_002',
    name: '攻击性语言检测',
    description: '检测包含攻击性或不当语言的内容',
    type: 'keyword',
    conditions: {
      keywords: ['傻逼', '白痴', '垃圾', '废物', '滚'],
    },
    action: 'require_review',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    ruleId: 'rule_003',
    name: '举报阈值检测',
    description: '当举报数量达到阈值时自动标记',
    type: 'report_threshold',
    conditions: {
      reportThreshold: 3,
    },
    action: 'require_review',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    ruleId: 'rule_004',
    name: 'AI评分检测',
    description: '基于AI评分自动处理内容',
    type: 'ai_score',
    conditions: {
      scoreThreshold: 0.3,
    },
    action: 'flag',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
]

class ContentModerationApi {
  // 获取内容审核列表
  async getContentList(
    filter: ModerationSearchFilter = {},
    page: number = 1,
    pageSize: number = 10,
  ): Promise<
    ApiResponse<{
      items: ContentModerationItemExtended[]
      total: number
      page: number
      pageSize: number
    }>
  > {
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredItems = [...mockModerationItems]

    // 应用筛选条件
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      filteredItems = filteredItems.filter(
        (item) =>
          item.content.toLowerCase().includes(keyword) ||
          item.authorName.toLowerCase().includes(keyword) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(keyword)),
      )
    }

    if (filter.status && filter.status !== 'all') {
      filteredItems = filteredItems.filter((item) => item.status === filter.status)
    }

    if (filter.contentType && filter.contentType !== 'all') {
      filteredItems = filteredItems.filter((item) => item.itemType === filter.contentType)
    }

    if (filter.hasReports && filter.hasReports !== 'all') {
      const hasReports = filter.hasReports === 'true'
      filteredItems = filteredItems.filter((item) =>
        hasReports ? item.reportCount > 0 : item.reportCount === 0,
      )
    }

    // 排序
    if (filter.sortBy) {
      filteredItems.sort((a, b) => {
        switch (filter.sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case 'most_reported':
            return b.reportCount - a.reportCount
          case 'pending_first':
            if (a.status === 'pending' && b.status !== 'pending') return -1
            if (a.status !== 'pending' && b.status === 'pending') return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          default:
            return 0
        }
      })
    }

    // 分页
    const total = filteredItems.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        items: paginatedItems,
        total,
        page,
        pageSize,
      },
    }
  }

  // 获取审核统计
  async getModerationStats(): Promise<ApiResponse<ModerationStats>> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const pendingCount = mockModerationItems.filter((item) => item.status === 'pending').length
    const reportedCount = mockModerationItems.filter((item) => item.reportCount > 0).length

    // 统计举报原因
    const reportReasons: { [key: string]: number } = {}
    mockModerationItems.forEach((item) => {
      item.reports.forEach((report) => {
        reportReasons[report.reason] = (reportReasons[report.reason] || 0) + 1
      })
    })

    const topReportReasons = Object.entries(reportReasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      success: true,
      data: {
        pendingCount,
        reportedCount,
        todayProcessed: 8,
        weeklyProcessed: 45,
        monthlyProcessed: 156,
        averageProcessingTime: 15.5,
        topReportReasons,
      },
    }
  }

  // 单个内容审核
  async moderateContent(
    itemId: string,
    action: 'approve' | 'reject' | 'delete',
    reason?: string,
  ): Promise<ApiResponse<void>> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const item = mockModerationItems.find((item) => item.itemId === itemId)
    if (!item) {
      return {
        success: false,
        error: '内容不存在',
      }
    }

    // 更新内容状态
    if (action === 'delete') {
      item.status = 'rejected' // 删除也标记为rejected
    } else {
      item.status = action === 'approve' ? 'approved' : 'rejected'
    }

    item.moderatorId = 'current_admin'
    item.moderatorName = '当前管理员'
    item.moderatedAt = new Date()
    item.moderationReason = reason

    return {
      success: true,
      message: `内容${action === 'approve' ? '通过' : action === 'reject' ? '拒绝' : '删除'}成功`,
    }
  }

  // 批量审核
  async batchModerateContent(
    request: BatchModerationRequest,
  ): Promise<ApiResponse<BatchModerationResult>> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const results: BatchModerationResult['results'] = []
    let successCount = 0
    let failureCount = 0

    for (const itemId of request.itemIds) {
      const item = mockModerationItems.find((item) => item.itemId === itemId)
      if (!item) {
        results.push({
          itemId,
          success: false,
          error: '内容不存在',
        })
        failureCount++
        continue
      }

      // 更新内容状态
      if (request.action === 'delete') {
        item.status = 'rejected'
      } else {
        item.status = request.action === 'approve' ? 'approved' : 'rejected'
      }

      item.moderatorId = 'current_admin'
      item.moderatorName = '当前管理员'
      item.moderatedAt = new Date()
      item.moderationReason = request.reason

      results.push({
        itemId,
        success: true,
      })
      successCount++
    }

    return {
      success: true,
      data: {
        success: true,
        successCount,
        failureCount,
        results,
      },
    }
  }

  // 删除内容
  async deleteContent(itemId: string): Promise<ApiResponse<void>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = mockModerationItems.findIndex((item) => item.itemId === itemId)
    if (index === -1) {
      return {
        success: false,
        error: '内容不存在',
      }
    }

    // 从列表中移除
    mockModerationItems.splice(index, 1)

    return {
      success: true,
      message: '内容删除成功',
    }
  }

  // 获取标签列表
  async getTagList(
    filter: TagSearchFilter = {},
    page: number = 1,
    pageSize: number = 20,
  ): Promise<
    ApiResponse<{
      tags: TagManagement[]
      total: number
      page: number
      pageSize: number
    }>
  > {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredTags = [...mockTags]

    // 应用筛选条件
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      filteredTags = filteredTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(keyword) ||
          tag.description?.toLowerCase().includes(keyword),
      )
    }

    if (filter.category && filter.category !== 'all') {
      filteredTags = filteredTags.filter((tag) => tag.category === filter.category)
    }

    if (filter.isOfficial !== undefined) {
      filteredTags = filteredTags.filter((tag) => tag.isOfficial === filter.isOfficial)
    }

    if (filter.status && filter.status !== 'all') {
      filteredTags = filteredTags.filter((tag) => tag.status === filter.status)
    }

    // 排序
    if (filter.sortBy) {
      filteredTags.sort((a, b) => {
        const order = filter.sortOrder === 'desc' ? -1 : 1
        switch (filter.sortBy) {
          case 'usage':
            return (b.usageCount - a.usageCount) * order
          case 'newest':
            return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * order
          case 'alphabetical':
            return a.name.localeCompare(b.name) * order
          default:
            return 0
        }
      })
    }

    // 分页
    const total = filteredTags.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedTags = filteredTags.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        tags: paginatedTags,
        total,
        page,
        pageSize,
      },
    }
  }

  // 创建标签
  async createTag(request: CreateTagRequest): Promise<ApiResponse<TagManagement>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 检查标签名是否已存在
    const existingTag = mockTags.find((tag) => tag.name === request.name)
    if (existingTag) {
      return {
        success: false,
        error: '标签名已存在',
      }
    }

    const newTag: TagManagement = {
      tagId: `tag_${Date.now()}`,
      name: request.name,
      description: request.description,
      category: request.category,
      usageCount: 0,
      isOfficial: request.isOfficial || false,
      createdAt: new Date(),
      createdBy: 'current_admin',
      status: 'active',
    }

    mockTags.push(newTag)

    return {
      success: true,
      data: newTag,
      message: '标签创建成功',
    }
  }

  // 更新标签
  async updateTag(tagId: string, request: UpdateTagRequest): Promise<ApiResponse<TagManagement>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tag = mockTags.find((tag) => tag.tagId === tagId)
    if (!tag) {
      return {
        success: false,
        error: '标签不存在',
      }
    }

    // 检查新名称是否与其他标签冲突
    if (request.name && request.name !== tag.name) {
      const existingTag = mockTags.find((t) => t.name === request.name && t.tagId !== tagId)
      if (existingTag) {
        return {
          success: false,
          error: '标签名已存在',
        }
      }
    }

    // 更新标签信息
    Object.assign(tag, request)

    return {
      success: true,
      data: tag,
      message: '标签更新成功',
    }
  }

  // 删除标签
  async deleteTag(tagId: string): Promise<ApiResponse<void>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = mockTags.findIndex((tag) => tag.tagId === tagId)
    if (index === -1) {
      return {
        success: false,
        error: '标签不存在',
      }
    }

    const tag = mockTags[index]
    if (tag.usageCount > 0) {
      return {
        success: false,
        error: '标签正在使用中，无法删除',
      }
    }

    mockTags.splice(index, 1)

    return {
      success: true,
      message: '标签删除成功',
    }
  }

  // 获取自动审核规则
  async getAutoModerationRules(): Promise<ApiResponse<AutoModerationRule[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      success: true,
      data: mockAutoModerationRules,
    }
  }

  // 检测内容违规
  async checkContentViolation(content: string): Promise<ApiResponse<ContentViolationCheck>> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const violations: ContentViolationCheck['violations'] = []
    let overallRisk: ContentViolationCheck['overallRisk'] = 'low'
    let aiScore = 0.9

    // 简单的关键词检测
    const spamKeywords = ['购买', '微信', '电话', '优惠', '限时', '998']
    const inappropriateKeywords = ['傻逼', '白痴', '垃圾', '废物']
    const harassmentKeywords = ['滚', '死', '蠢']

    const contentLower = content.toLowerCase()

    // 检测垃圾信息
    const spamMatches = spamKeywords.filter((keyword) => contentLower.includes(keyword))
    if (spamMatches.length > 0) {
      violations.push({
        type: 'spam',
        severity: spamMatches.length > 2 ? 'high' : 'medium',
        confidence: Math.min(0.9, spamMatches.length * 0.3),
        description: `检测到垃圾信息关键词: ${spamMatches.join(', ')}`,
      })
      aiScore -= spamMatches.length * 0.2
    }

    // 检测不当内容
    const inappropriateMatches = inappropriateKeywords.filter((keyword) =>
      contentLower.includes(keyword),
    )
    if (inappropriateMatches.length > 0) {
      violations.push({
        type: 'inappropriate',
        severity: 'high',
        confidence: 0.95,
        description: `检测到不当语言: ${inappropriateMatches.join(', ')}`,
      })
      aiScore -= inappropriateMatches.length * 0.3
    }

    // 检测骚扰内容
    const harassmentMatches = harassmentKeywords.filter((keyword) => contentLower.includes(keyword))
    if (harassmentMatches.length > 0) {
      violations.push({
        type: 'harassment',
        severity: 'high',
        confidence: 0.9,
        description: `检测到骚扰性语言: ${harassmentMatches.join(', ')}`,
      })
      aiScore -= harassmentMatches.length * 0.25
    }

    // 确定整体风险等级
    if (violations.some((v) => v.severity === 'high')) {
      overallRisk = 'high'
    } else if (violations.some((v) => v.severity === 'medium')) {
      overallRisk = 'medium'
    }

    if (aiScore < 0.3) {
      overallRisk = 'critical'
    }

    // 推荐操作
    let recommendedAction: ContentViolationCheck['recommendedAction'] = 'approve'
    if (overallRisk === 'critical') {
      recommendedAction = 'reject'
    } else if (overallRisk === 'high' || overallRisk === 'medium') {
      recommendedAction = 'review'
    }

    return {
      success: true,
      data: {
        itemId: `check_${Date.now()}`,
        violations,
        overallRisk,
        recommendedAction,
        aiScore: Math.max(0, aiScore),
      },
    }
  }

  // 获取审核日志
  async getModerationLogs(
    page: number = 1,
    pageSize: number = 20,
  ): Promise<
    ApiResponse<{
      logs: ModerationLog[]
      total: number
      page: number
      pageSize: number
    }>
  > {
    await new Promise((resolve) => setTimeout(resolve, 400))

    // 模拟审核日志数据
    const mockLogs: ModerationLog[] = [
      {
        logId: 'log_001',
        itemId: 'content_002',
        itemType: 'post',
        moderatorId: 'admin1',
        moderatorName: '管理员小王',
        action: 'approve',
        reason: '内容积极正面，符合社区规范',
        previousStatus: 'pending',
        newStatus: 'approved',
        processingTime: 12,
        createdAt: new Date('2024-12-14T09:30:00'),
      },
      {
        logId: 'log_002',
        itemId: 'content_005',
        itemType: 'post',
        moderatorId: 'admin1',
        moderatorName: '管理员小王',
        action: 'approve',
        reason: '内容温暖正面，传递正能量',
        previousStatus: 'pending',
        newStatus: 'approved',
        processingTime: 8,
        createdAt: new Date('2024-12-14T06:15:00'),
      },
    ]

    const total = mockLogs.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedLogs = mockLogs.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        logs: paginatedLogs,
        total,
        page,
        pageSize,
      },
    }
  }
}

// 导出API实例
export const contentModerationApi = new ContentModerationApi()
export default contentModerationApi
