// 用户数据模型
export interface User {
  userId: string
  nickname: string
  phone: string
  passwordHash: string
  role: 'user' | 'admin'
  avatarUrl: string
  joinDate: Date
  level: number
  xp: number
  xpForNextLevel: number
  streak: {
    current: number
    lastPracticeDate: Date
  }
  badges: string[]
  inventory: {
    [itemId: string]: number
  }
  growthTree: {
    level: number
    elements: {
      leaves: number
      flowers: number
      fruits: number
    }
  }
}

// 活动数据模型
export interface Activity {
  activityId: string
  type: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  title: string
  description: string
  content?: string // 活动详细内容
  scheduledTime?: Date
  durationInMinutes?: number
  duration?: string // 显示用的时长文本
  xpReward: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  location?: string
  hostBy?: string
  capacity?: number
  registeredCount?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  participants?: ActivityParticipant[] // 参与者列表
  startTime?: string // 兼容字段，格式化的时间字符串
  isRecommended?: boolean // 是否为管理员推荐活动
}

// 用户活动日志
export interface UserActivityLog {
  logId: string
  userId: string
  activityId: string
  completedAt: Date
  notes?: string
}

// 管理员仪表板的活动日志（包含更多显示信息）
export interface AdminActivityLog extends UserActivityLog {
  userName: string
  activityTitle: string
  activityType: string
  timestamp: Date
  xpEarned: number
}

// 徽章数据模型
export interface Badge {
  badgeId: string
  name: string
  description: string
  iconUrl: string
  type: 'Skill' | 'Participation' | 'Contribution' | 'Special'
  unlockCriteria: {
    metric: 'station_count' | 'salon_count' | 'streak_days' | 'post_count'
    threshold: number
  }
}

// 认证相关类型
export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  phone: string
  password: string
  nickname: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 社区统计数据
export interface CommunityStats {
  stationEnergy: number
  totalUsers: number
  activeUsers: number
  totalActivities: number
}

// 信息流相关类型定义
export interface FeedPost {
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  images?: string[]
  tags: string[]
  mentionedActivities?: {
    activityId: string
    activityTitle: string
    activityType: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  }[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  createdAt: Date
  updatedAt?: Date
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface FeedComment {
  commentId: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likesCount: number
  createdAt: Date
  isLiked?: boolean
  replyToCommentId?: string
  replies?: FeedComment[]
}

export interface FeedInteraction {
  interactionId: string
  userId: string
  targetId: string // postId or commentId
  targetType: 'post' | 'comment'
  type: 'like' | 'bookmark' | 'share'
  createdAt: Date
}

export interface CreatePostRequest {
  content: string
  images?: File[]
  tags: string[]
  mentionedActivities?: string[]
}

export interface CreateCommentRequest {
  postId: string
  content: string
  replyToCommentId?: string
}

export interface FeedFilter {
  userId?: string
  tags?: string[]
  activityType?: string
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  sortBy: 'newest' | 'popular' | 'trending'
}

// 管理员统计数据
export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalActivities: number
  systemHealth: 'good' | 'warning' | 'error'
  levelDistribution: {
    level: number
    count: number
  }[]
  recentActivities: AdminActivityLog[]
  userGrowthTrend: {
    date: string
    newUsers: number
    activeUsers: number
  }[]
  activityStats: {
    empathyStation: {
      totalSessions: number
      averageParticipants: number
      completionRate: number
    }
    themeSalon: {
      totalSessions: number
      averageParticipants: number
      completionRate: number
    }
    lifeGrowth: {
      totalSessions: number
      averageParticipants: number
      completionRate: number
    }
  }
}

// 活动报名记录
export interface ActivityRegistration {
  registrationId: string
  userId: string
  activityId: string
  registeredAt: Date
  status: 'registered' | 'attended' | 'cancelled'
  notes?: string
}

// 管理员统计数据
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalActivities: number
  systemHealth: 'good' | 'warning' | 'error'
}

// 管理员用户类型
export interface AdminUser {
  userId: string
  phone: string
  nickname: string
  email?: string
  role: 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  lastLoginAt?: Date
  permissions: string[]
}

// 用户管理相关类型
export interface UserManagementData extends User {
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt?: Date
  totalActivities: number
  totalPosts: number
  createdBy?: string
  updatedAt?: Date
}

export interface CreateUserRequest {
  phone: string
  password: string
  nickname: string
  role?: 'user' | 'admin'
  status?: 'active' | 'inactive'
}

export interface UpdateUserRequest {
  nickname?: string
  status?: 'active' | 'inactive' | 'suspended'
  role?: 'user' | 'admin'
  level?: number
  xp?: number
}

export interface BatchCreateUserRequest {
  users: CreateUserRequest[]
}

export interface UserSearchFilter {
  keyword?: string
  role?: 'user' | 'admin' | 'all'
  status?: 'active' | 'inactive' | 'suspended' | 'all'
  level?: number
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  sortBy?: 'newest' | 'oldest' | 'level' | 'activity'
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse {
  users: UserManagementData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ExcelImportResult {
  success: boolean
  successCount: number
  failureCount: number
  errors: {
    row: number
    phone: string
    error: string
  }[]
  duplicates: string[]
}

// 内容管理相关类型
export interface ActivityManagementData extends Activity {
  createdBy: string
  createdAt: Date
  updatedAt?: Date
  participants: ActivityParticipant[]
  totalParticipants: number
  completionRate: number
  averageRating?: number
  tags: string[]
}

export interface ActivityParticipant {
  userId: string
  userName: string
  userAvatar?: string
  registeredAt: Date
  attendedAt?: Date
  status: 'registered' | 'attended' | 'cancelled' | 'no_show'
  rating?: number
  feedback?: string
  xpEarned: number
  badgesEarned: string[]
}

export interface CreateActivityRequest {
  type: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  title: string
  description: string
  scheduledTime: Date
  durationInMinutes: number
  xpReward: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  location?: string
  hostBy?: string
  capacity?: number
  tags: string[]
}

export interface UpdateActivityRequest {
  title?: string
  description?: string
  scheduledTime?: Date
  durationInMinutes?: number
  xpReward?: number
  location?: string
  hostBy?: string
  capacity?: number
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  tags?: string[]
}

export interface ActivitySearchFilter {
  keyword?: string
  type?: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth' | 'all'
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'all'
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  hostBy?: string
  sortBy?: 'newest' | 'oldest' | 'scheduled_time' | 'participants'
  sortOrder?: 'asc' | 'desc'
}

export interface ActivityListResponse {
  activities: ActivityManagementData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 批量添加参与者相关类型
export interface BatchAddParticipantsRequest {
  activityId: string
  userIds: string[]
  autoAttend?: boolean // 是否自动标记为已参加
  sendNotification?: boolean // 是否发送通知
}

export interface BatchAddParticipantsResult {
  success: boolean
  successCount: number
  failureCount: number
  message?: string
  error?: string
  results: {
    userId: string
    userName: string
    success: boolean
    error?: string
    xpEarned?: number
    badgesEarned?: string[]
  }[]
}

// 用户参与活动记录扩展
export interface UserActivityParticipation {
  participationId: string
  userId: string
  activityId: string
  activityTitle: string
  activityType: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  registeredAt: Date
  attendedAt?: Date
  status: 'registered' | 'attended' | 'cancelled' | 'no_show'
  xpEarned: number
  badgesEarned: string[]
  rating?: number
  feedback?: string
  notes?: string
}

// 经验值和奖励计算
export interface XpRewardCalculation {
  baseXp: number
  bonusXp: number
  totalXp: number
  levelBefore: number
  levelAfter: number
  badgesEarned: string[]
  growthTreeUpdates: {
    leaves: number
    flowers: number
    fruits: number
  }
}

// 徽章触发检查
export interface BadgeTriggerCheck {
  userId: string
  activityType: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  newBadges: string[]
  updatedProgress: {
    badgeId: string
    currentProgress: number
    requiredProgress: number
    percentage: number
  }[]
}

// 内容审核相关类型
export interface ContentModerationItem {
  itemId: string
  itemType: 'activity' | 'post' | 'comment'
  title: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  moderatorId?: string
  moderatorName?: string
  moderatedAt?: Date
  moderationReason?: string
  reportCount: number
  reports: ContentReport[]
}

export interface ContentReport {
  reportId: string
  reporterId: string
  reporterName: string
  reason: 'spam' | 'inappropriate' | 'harassment' | 'false_info' | 'other'
  description: string
  reportedAt: Date
}

export interface ModerationAction {
  itemId: string
  action: 'approve' | 'reject' | 'delete'
  reason?: string
}

// 动态内容管理
export interface PostManagementData extends FeedPost {
  authorId: string
  authorName: string
  status: 'published' | 'hidden' | 'deleted'
  moderationStatus: 'pending' | 'approved' | 'rejected'
  reportCount: number
  isPromoted: boolean
  promotedUntil?: Date
}

export interface PostSearchFilter {
  keyword?: string
  authorId?: string
  status?: 'published' | 'hidden' | 'deleted' | 'all'
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'all'
  hasReports?: boolean
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  sortBy?: 'newest' | 'oldest' | 'likes' | 'comments' | 'reports'
  sortOrder?: 'asc' | 'desc'
}

export interface PostListResponse {
  posts: PostManagementData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 内容审核统计
export interface ModerationStats {
  pendingCount: number
  reportedCount: number
  todayProcessed: number
  weeklyProcessed: number
  monthlyProcessed: number
  averageProcessingTime: number // 平均处理时间（分钟）
  topReportReasons: {
    reason: string
    count: number
  }[]
}

// 内容审核搜索过滤器
export interface ModerationSearchFilter {
  keyword?: string
  status?: 'pending' | 'approved' | 'rejected' | 'deleted' | 'all'
  contentType?: 'post' | 'comment' | 'activity' | 'all'
  hasReports?: 'true' | 'false' | 'all'
  reportReason?: 'spam' | 'inappropriate' | 'harassment' | 'false_info' | 'other' | 'all'
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  sortBy?: 'newest' | 'oldest' | 'most_reported' | 'pending_first'
  sortOrder?: 'asc' | 'desc'
}

// 批量审核操作
export interface BatchModerationRequest {
  itemIds: string[]
  action: 'approve' | 'reject' | 'delete'
  reason?: string
}

export interface BatchModerationResult {
  success: boolean
  successCount: number
  failureCount: number
  results: {
    itemId: string
    success: boolean
    error?: string
  }[]
}

// 标签管理
export interface TagManagement {
  tagId: string
  name: string
  description?: string
  category: 'nvc' | 'emotion' | 'skill' | 'activity' | 'general'
  usageCount: number
  isOfficial: boolean // 是否为官方标签
  createdAt: Date
  createdBy: string
  status: 'active' | 'deprecated' | 'banned'
}

export interface TagSearchFilter {
  keyword?: string
  category?: 'nvc' | 'emotion' | 'skill' | 'activity' | 'general' | 'all'
  isOfficial?: boolean
  status?: 'active' | 'deprecated' | 'banned' | 'all'
  sortBy?: 'usage' | 'newest' | 'alphabetical'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateTagRequest {
  name: string
  description?: string
  category: 'nvc' | 'emotion' | 'skill' | 'activity' | 'general'
  isOfficial?: boolean
}

export interface UpdateTagRequest {
  name?: string
  description?: string
  category?: 'nvc' | 'emotion' | 'skill' | 'activity' | 'general'
  isOfficial?: boolean
  status?: 'active' | 'deprecated' | 'banned'
}

// 内容审核扩展类型
export interface ContentModerationItemExtended extends ContentModerationItem {
  authorAvatar?: string
  tags?: string[]
  likesCount?: number
  commentsCount?: number
  sharesCount?: number
  lastReportedAt?: Date
  autoModerationScore?: number // AI自动审核评分
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// 自动审核规则
export interface AutoModerationRule {
  ruleId: string
  name: string
  description: string
  type: 'keyword' | 'pattern' | 'ai_score' | 'report_threshold'
  conditions: {
    keywords?: string[]
    patterns?: string[]
    scoreThreshold?: number
    reportThreshold?: number
  }
  action: 'flag' | 'auto_reject' | 'require_review'
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

// 审核日志
export interface ModerationLog {
  logId: string
  itemId: string
  itemType: 'post' | 'comment' | 'activity'
  moderatorId: string
  moderatorName: string
  action: 'approve' | 'reject' | 'delete' | 'flag'
  reason?: string
  previousStatus: string
  newStatus: string
  processingTime: number // 处理时间（分钟）
  createdAt: Date
}

// 违规内容检测结果
export interface ContentViolationCheck {
  itemId: string
  violations: {
    type: 'spam' | 'inappropriate' | 'harassment' | 'false_info' | 'other'
    severity: 'low' | 'medium' | 'high'
    confidence: number // 0-1之间的置信度
    description: string
  }[]
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  recommendedAction: 'approve' | 'review' | 'reject'
  aiScore: number // AI评分
}

// 活动类型配置管理
export interface ActivityTypeConfig {
  type: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  name: string
  description: string
  baseXpReward: number
  bonusXpRules: {
    userLevelMultiplier: number
    streakBonus: number
    qualityBonus: number
  }
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  defaultDuration: number // 分钟
  defaultCapacity: number
  participationRequirements: {
    minLevel: number
    requiredBadges: string[]
    cooldownHours: number
  }
  badgeTriggerRules: {
    badgeId: string
    triggerCount: number
    description: string
  }[]
  levelProgressRules: {
    xpPerLevel: number
    maxLevel: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

// 系统配置管理
export interface SystemConfig {
  configId: string
  category: 'activity' | 'badge' | 'notification' | 'general'
  key: string
  value: any
  description: string
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  isEditable: boolean
  createdAt: Date
  updatedAt?: Date
}

// 徽章系统配置
export interface BadgeSystemConfig {
  badgeId: string
  name: string
  description: string
  category: 'Skill' | 'Participation' | 'Contribution' | 'Special'
  iconUrl: string
  unlockCriteria: {
    type: 'activity_count' | 'streak_days' | 'post_count' | 'level_reached' | 'xp_earned'
    activityTypes?: ('EmpathyStation' | 'ThemeSalon' | 'LifeGrowth')[]
    threshold: number
    timeframe?: 'all_time' | 'monthly' | 'yearly'
  }
  rewards: {
    xpBonus: number
    specialPrivileges: string[]
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isActive: boolean
  displayOrder: number
  createdAt: Date
  updatedAt?: Date
}

// 活动配置更新请求
export interface UpdateActivityConfigRequest {
  baseXpReward?: number
  bonusXpRules?: {
    userLevelMultiplier?: number
    streakBonus?: number
    qualityBonus?: number
  }
  defaultDuration?: number
  defaultCapacity?: number
  participationRequirements?: {
    minLevel?: number
    requiredBadges?: string[]
    cooldownHours?: number
  }
  badgeTriggerRules?: {
    badgeId: string
    triggerCount: number
    description: string
  }[]
  isActive?: boolean
}

// 系统配置更新请求
export interface UpdateSystemConfigRequest {
  value: any
  description?: string
}

// 配置管理统计
export interface ConfigManagementStats {
  totalConfigs: number
  activeActivityTypes: number
  activeBadges: number
  totalXpDistributed: number
  avgXpPerActivity: number
  mostTriggeredBadge: {
    badgeId: string
    name: string
    triggerCount: number
  }
  activityTypeStats: {
    type: string
    totalActivities: number
    totalParticipants: number
    avgXpReward: number
    popularityRank: number
  }[]
}

// 徽章创建请求
export interface CreateBadgeRequest {
  name: string
  description: string
  category: 'Skill' | 'Participation' | 'Contribution' | 'Special'
  iconUrl?: string
  unlockCriteria: {
    type: 'activity_count' | 'streak_days' | 'post_count' | 'level_reached' | 'xp_earned'
    activityTypes?: ('EmpathyStation' | 'ThemeSalon' | 'LifeGrowth')[]
    threshold: number
    timeframe?: 'all_time' | 'monthly' | 'yearly'
  }
  rewards: {
    xpBonus: number
    specialPrivileges: string[]
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isActive?: boolean
  displayOrder?: number
}

// 徽章更新请求
export interface UpdateBadgeRequest {
  name?: string
  description?: string
  category?: 'Skill' | 'Participation' | 'Contribution' | 'Special'
  iconUrl?: string
  unlockCriteria?: {
    type: 'activity_count' | 'streak_days' | 'post_count' | 'level_reached' | 'xp_earned'
    activityTypes?: ('EmpathyStation' | 'ThemeSalon' | 'LifeGrowth')[]
    threshold: number
    timeframe?: 'all_time' | 'monthly' | 'yearly'
  }
  rewards?: {
    xpBonus: number
    specialPrivileges: string[]
  }
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  isActive?: boolean
  displayOrder?: number
}

// 徽章搜索和筛选
export interface BadgeSearchFilter {
  keyword?: string
  category?: 'Skill' | 'Participation' | 'Contribution' | 'Special' | 'all'
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'all'
  isActive?: boolean
  activityType?: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth' | 'all'
  sortBy?: 'newest' | 'oldest' | 'name' | 'usage' | 'display_order'
  sortOrder?: 'asc' | 'desc'
}

// 徽章与活动联动配置
export interface BadgeActivityLink {
  linkId: string
  badgeId: string
  activityType: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  triggerCondition: {
    type: 'participation_count' | 'consecutive_days' | 'quality_rating' | 'hosting_count'
    threshold: number
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time'
  }
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

// 徽章图标预设
export interface BadgeIconPreset {
  iconId: string
  name: string
  iconUrl: string
  category: 'Skill' | 'Participation' | 'Contribution' | 'Special'
  tags: string[]
}

// 徽章设计工具相关
export interface BadgeDesignOptions {
  backgroundColors: string[]
  iconPresets: BadgeIconPreset[]
  borderStyles: {
    id: string
    name: string
    cssClass: string
  }[]
  glowEffects: {
    id: string
    name: string
    cssClass: string
  }[]
}

// 批量创建徽章请求
export interface BatchCreateBadgeRequest {
  badges: CreateBadgeRequest[]
  activityLinks?: BadgeActivityLink[]
}

// 徽章列表响应
export interface BadgeListResponse {
  badges: BadgeSystemConfig[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 徽章统计信息
export interface BadgeManagementStats {
  totalBadges: number
  activeBadges: number
  badgesByCategory: {
    category: string
    count: number
  }[]
  badgesByRarity: {
    rarity: string
    count: number
  }[]
  mostTriggeredBadges: {
    badgeId: string
    name: string
    triggerCount: number
  }[]
  recentlyCreated: BadgeSystemConfig[]
}
