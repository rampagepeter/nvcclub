import type {
  User,
  Activity,
  CommunityStats,
  Badge,
  AdminUser,
  FeedPost,
  FeedComment,
} from '@/types'

// 模拟用户数据
export const mockUser: User = {
  userId: 'user_001',
  nickname: '成长中的小树苗',
  phone: '13800138000',
  passwordHash: 'mock_hash',
  role: 'user',
  avatarUrl: '/default-avatar.png',
  joinDate: new Date('2024-01-15'),
  level: 3,
  xp: 850,
  xpForNextLevel: 1200,
  streak: {
    current: 7,
    lastPracticeDate: new Date(),
  },
  badges: ['empathy_master', 'daily_warrior', 'community_helper'],
  inventory: {
    wisdom_seed: 5,
    growth_water: 3,
    insight_crystal: 2,
  },
  growthTree: {
    level: 3,
    elements: {
      leaves: 8,
      flowers: 3,
      fruits: 1,
    },
  },
}

// 模拟管理员用户
export const mockAdmin: User = {
  userId: 'admin_001',
  nickname: '刘轶老师',
  phone: '13900139000',
  passwordHash: 'mock_admin_hash',
  role: 'admin',
  avatarUrl: '/admin-avatar.png',
  joinDate: new Date('2023-01-01'),
  level: 10,
  xp: 5000,
  xpForNextLevel: 6000,
  streak: {
    current: 365,
    lastPracticeDate: new Date(),
  },
  badges: ['nvc_master', 'teacher', 'community_builder'],
  inventory: {},
  growthTree: {
    level: 10,
    elements: {
      leaves: 20,
      flowers: 12,
      fruits: 8,
    },
  },
}

// 模拟活动数据
export const mockActivities: Activity[] = [
  // 同理心驿站活动（周一到周六）
  {
    activityId: 'empathy_001',
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
  },
  {
    activityId: 'empathy_002',
    type: 'EmpathyStation',
    title: '职场沟通艺术',
    description: '学会在工作环境中运用NVC原则，化解职场冲突，提升团队协作',
    scheduledTime: new Date('2024-12-17T19:30:00'),
    durationInMinutes: 60,
    xpReward: 50,
    frequency: 'daily',
    location: '在线会议室',
    hostBy: 'NVC认证讲师',
    capacity: 30,
    registeredCount: 22,
    status: 'upcoming',
  },
  {
    activityId: 'empathy_003',
    type: 'EmpathyStation',
    title: '伴侣关系经营',
    description: '在亲密关系中练习表达脆弱和需求，学会创造安全的情感空间',
    scheduledTime: new Date('2024-12-18T19:30:00'),
    durationInMinutes: 60,
    xpReward: 50,
    frequency: 'daily',
    location: '在线会议室',
    hostBy: 'NVC认证讲师',
    capacity: 30,
    registeredCount: 25,
    status: 'upcoming',
  },

  // 主题沙龙活动（每月一次）
  {
    activityId: 'salon_001',
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
  },
  {
    activityId: 'salon_002',
    type: 'ThemeSalon',
    title: '1月主题沙龙：新年·新关系',
    description: '探索如何在新的一年里重塑人际关系，创造更多真实连接的可能性',
    scheduledTime: new Date('2025-01-18T14:00:00'),
    durationInMinutes: 150,
    xpReward: 150,
    frequency: 'monthly',
    location: '北京·朝阳区NVC成长中心',
    hostBy: 'NVC资深导师团队',
    capacity: 50,
    registeredCount: 8,
    status: 'upcoming',
  },

  // 刘轶说生命成长活动（每季度一次）
  {
    activityId: 'lifegrowth_001',
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
  },
  {
    activityId: 'lifegrowth_002',
    type: 'LifeGrowth',
    title: '刘轶说：生命的四季与内在成长',
    description: '跟随刘轶老师探索生命的不同阶段，学会在每个人生季节中找到成长的智慧和力量',
    scheduledTime: new Date('2025-03-29T15:00:00'),
    durationInMinutes: 180,
    xpReward: 300,
    frequency: 'quarterly',
    location: '北京·海淀区国际会议中心',
    hostBy: '刘轶老师',
    capacity: 200,
    registeredCount: 23,
    status: 'upcoming',
  },
]

// 模拟社区统计数据
export const mockCommunityStats: CommunityStats = {
  stationEnergy: 12580,
  totalUsers: 324,
  activeUsers: 89,
  totalActivities: 1205,
}

// 模拟管理员统计数据
export const mockAdminDashboardStats = {
  totalUsers: 324,
  activeUsers: 89,
  newUsersToday: 12,
  totalActivities: 1205,
  systemHealth: 'good' as const,
  levelDistribution: [
    { level: 1, count: 89 },
    { level: 2, count: 76 },
    { level: 3, count: 54 },
    { level: 4, count: 42 },
    { level: 5, count: 31 },
    { level: 6, count: 18 },
    { level: 7, count: 9 },
    { level: 8, count: 3 },
    { level: 9, count: 1 },
    { level: 10, count: 1 },
  ],
  recentActivities: [
    {
      logId: 'log_1',
      userId: 'u1',
      userName: '张小花',
      activityId: 'act_1',
      activityTitle: '家庭亲子沟通练习',
      activityType: 'EmpathyStation',
      completedAt: new Date('2024-12-13T10:30:00'),
      timestamp: new Date('2024-12-13T10:30:00'),
      xpEarned: 25,
      notes: '完成了一次深度的同理心练习',
    },
    {
      logId: 'log_2',
      userId: 'u2',
      userName: '李同理',
      activityId: 'act_2',
      activityTitle: '12月主题沙龙：愤怒背后的礼物',
      activityType: 'ThemeSalon',
      completedAt: new Date('2024-12-13T14:15:00'),
      timestamp: new Date('2024-12-13T14:15:00'),
      xpEarned: 50,
      notes: '参与了主题沙龙讨论',
    },
    {
      logId: 'log_3',
      userId: 'u3',
      userName: '王成长',
      activityId: 'act_3',
      activityTitle: '职场沟通艺术',
      activityType: 'LifeGrowth',
      completedAt: new Date('2024-12-12T16:45:00'),
      timestamp: new Date('2024-12-12T16:45:00'),
      xpEarned: 30,
      notes: '分享了生命成长感悟',
    },
    {
      logId: 'log_4',
      userId: 'u1',
      userName: '张小花',
      activityId: 'act_4',
      activityTitle: '日常同理心练习',
      activityType: 'EmpathyStation',
      completedAt: new Date('2024-12-12T09:20:00'),
      timestamp: new Date('2024-12-12T09:20:00'),
      xpEarned: 20,
      notes: '完成日常练习打卡',
    },
    {
      logId: 'log_5',
      userId: 'u4',
      userName: '赵静心',
      activityId: 'act_5',
      activityTitle: '新手引导课程',
      activityType: 'EmpathyStation',
      completedAt: new Date('2024-12-11T20:10:00'),
      timestamp: new Date('2024-12-11T20:10:00'),
      xpEarned: 15,
      notes: '首次参与社区活动',
    },
  ],
  userGrowthTrend: [
    {
      date: '2024-12-09',
      newUsers: 8,
      activeUsers: 76,
    },
    {
      date: '2024-12-10',
      newUsers: 12,
      activeUsers: 82,
    },
    {
      date: '2024-12-11',
      newUsers: 15,
      activeUsers: 89,
    },
  ],
  activityStats: {
    empathyStation: {
      totalSessions: 856,
      averageParticipants: 18,
      completionRate: 92,
    },
    themeSalon: {
      totalSessions: 24,
      averageParticipants: 42,
      completionRate: 88,
    },
    lifeGrowth: {
      totalSessions: 6,
      averageParticipants: 35,
      completionRate: 95,
    },
  },
}

// 模拟徽章数据
export const mockBadges: Badge[] = [
  // 技能类徽章
  {
    badgeId: 'listening_ear',
    name: '聆听之耳',
    description: '掌握深度倾听技巧，能够真正听见他人的声音和需求',
    iconUrl: '/badges/listening_ear.png',
    type: 'Skill',
    unlockCriteria: {
      metric: 'station_count',
      threshold: 20,
    },
  },
  {
    badgeId: 'feeling_artist',
    name: '感受色彩家',
    description: '能够识别和表达丰富的情感色彩，成为感受的艺术家',
    iconUrl: '/badges/feeling_artist.png',
    type: 'Skill',
    unlockCriteria: {
      metric: 'station_count',
      threshold: 35,
    },
  },
  {
    badgeId: 'empathy_master',
    name: '同理心大师',
    description: '完成50次同理心驿站练习，成为真正的同理心大师',
    iconUrl: '/badges/empathy_master.png',
    type: 'Skill',
    unlockCriteria: {
      metric: 'station_count',
      threshold: 50,
    },
  },

  // 参与类徽章
  {
    badgeId: 'station_regular',
    name: '驿站常客',
    description: '经常参加同理心驿站活动，是这里的常客',
    iconUrl: '/badges/station_regular.png',
    type: 'Participation',
    unlockCriteria: {
      metric: 'station_count',
      threshold: 10,
    },
  },
  {
    badgeId: 'salon_explorer',
    name: '沙龙探索家',
    description: '积极参与主题沙龙，勇于探索内心深处',
    iconUrl: '/badges/salon_explorer.png',
    type: 'Participation',
    unlockCriteria: {
      metric: 'salon_count',
      threshold: 5,
    },
  },
  {
    badgeId: 'community_active',
    name: '社群活跃者',
    description: '在社区中保持高度活跃，为大家带来正能量',
    iconUrl: '/badges/community_active.png',
    type: 'Participation',
    unlockCriteria: {
      metric: 'streak_days',
      threshold: 30,
    },
  },

  // 贡献类徽章
  {
    badgeId: 'note_sharer',
    name: '笔记分享家',
    description: '乐于分享学习笔记和心得，帮助他人成长',
    iconUrl: '/badges/note_sharer.png',
    type: 'Contribution',
    unlockCriteria: {
      metric: 'post_count',
      threshold: 15,
    },
  },
  {
    badgeId: 'empathy_partner',
    name: '同理心伙伴',
    description: '经常给予他人同理心支持，是值得信赖的伙伴',
    iconUrl: '/badges/empathy_partner.png',
    type: 'Contribution',
    unlockCriteria: {
      metric: 'post_count',
      threshold: 30,
    },
  },
  {
    badgeId: 'wisdom_mentor',
    name: '智慧导师',
    description: '以智慧和爱心指导他人，成为社区的精神导师',
    iconUrl: '/badges/wisdom_mentor.png',
    type: 'Contribution',
    unlockCriteria: {
      metric: 'post_count',
      threshold: 50,
    },
  },

  // 趣味类徽章（彩蛋）
  {
    badgeId: 'aha_catcher',
    name: "'啊哈！'时刻捕获者",
    description: '善于捕捉学习中的灵感时刻，经常有新的领悟',
    iconUrl: '/badges/aha_catcher.png',
    type: 'Special',
    unlockCriteria: {
      metric: 'station_count',
      threshold: 25,
    },
  },
  {
    badgeId: 'hundred_days',
    name: '百日筑基',
    description: '连续学习100天，为成长打下坚实基础',
    iconUrl: '/badges/hundred_days.png',
    type: 'Special',
    unlockCriteria: {
      metric: 'streak_days',
      threshold: 100,
    },
  },
  {
    badgeId: 'night_owl',
    name: '夜猫子学习者',
    description: '经常在深夜时分进行学习和反思',
    iconUrl: '/badges/night_owl.png',
    type: 'Special',
    unlockCriteria: {
      metric: 'station_count',
      threshold: 15,
    },
  },

  // 保留原有徽章以兼容现有数据
  {
    badgeId: 'daily_warrior',
    name: '每日行者',
    description: '连续练习7天',
    iconUrl: '/badges/daily_warrior.png',
    type: 'Participation',
    unlockCriteria: {
      metric: 'streak_days',
      threshold: 7,
    },
  },
  {
    badgeId: 'community_helper',
    name: '社群助手',
    description: '帮助其他成员10次',
    iconUrl: '/badges/community_helper.png',
    type: 'Contribution',
    unlockCriteria: {
      metric: 'post_count',
      threshold: 10,
    },
  },
]

// 模拟API响应
export const mockApiResponses = {
  login: {
    success: true,
    data: {
      accessToken: 'mock_token_' + Date.now(),
      user: mockUser,
    },
    message: '登录成功',
  },

  adminLogin: {
    success: true,
    data: {
      accessToken: 'mock_admin_token_' + Date.now(),
      user: mockAdmin,
    },
    message: '管理员登录成功',
  },

  activities: {
    success: true,
    data: mockActivities,
    message: '获取活动列表成功',
  },

  communityStats: {
    success: true,
    data: mockCommunityStats,
    message: '获取社区统计成功',
  },

  register: {
    success: true,
    message: '注册成功，请登录',
  },
}

// 练习场景数据
export const practiceScenarios = [
  {
    id: 'family_001',
    title: '家庭亲子沟通',
    description: '当孩子不听话时，如何用NVC方式沟通',
    difficulty: '初级',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'work_001',
    title: '职场同事冲突',
    description: '处理工作中的意见分歧和合作问题',
    difficulty: '中级',
    icon: '💼',
  },
  {
    id: 'partner_001',
    title: '伴侣关系经营',
    description: '在亲密关系中表达需求和处理冲突',
    difficulty: '中级',
    icon: '💑',
  },
  {
    id: 'friend_001',
    title: '朋友间的误解',
    description: '修复友谊中的裂痕，重建信任',
    difficulty: '初级',
    icon: '👥',
  },
  {
    id: 'self_001',
    title: '自我对话练习',
    description: '学会与内在批判声音和解',
    difficulty: '高级',
    icon: '🧘‍♀️',
  },
]

// 角色选择数据
export const practiceRoles = [
  {
    id: 'expresser',
    name: '表达者',
    description: '练习清晰表达自己的观察、感受、需求和请求',
    icon: '🗣️',
  },
  {
    id: 'listener',
    name: '倾听者',
    description: '练习同理心倾听，理解对方的感受和需求',
    icon: '👂',
  },
  {
    id: 'observer',
    name: '观察者',
    description: '从第三方角度观察和学习沟通模式',
    icon: '👁️',
  },
]

// 管理员用户数据
export const mockAdminUsers: AdminUser[] = [
  {
    userId: 'admin_001',
    phone: '13800000001',
    nickname: '管理员',
    email: 'admin@nvcgarden.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    permissions: ['user_management', 'content_management', 'system_settings'],
  },
]

// 信息流模拟数据
export const mockFeedPosts: FeedPost[] = [
  {
    postId: 'post_001',
    userId: 'user_002',
    userName: '小明',
    userAvatar: '/avatars/user-002.png',
    content:
      '今天在同理心驿站练习中有了新的感悟！🌟 当我真正开始倾听内心的声音时，发现了自己一直以来忽略的需求。NVC不仅仅是一种沟通方式，更是一种生活态度。感谢这个平台让我遇见更好的自己！ #NVC学习 #同理心分享',
    images: ['/posts/post-001-1.jpg'],
    tags: ['NVC学习', '同理心分享', '成长感悟'],
    mentionedActivities: [
      {
        activityId: 'activity_001',
        activityTitle: '情绪识别与表达练习',
        activityType: 'EmpathyStation',
      },
    ],
    likesCount: 24,
    commentsCount: 8,
    sharesCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    isLiked: false,
    isBookmarked: false,
  },
  {
    postId: 'post_002',
    userId: 'user_003',
    userName: '李梅',
    userAvatar: '/avatars/user-003.png',
    content:
      '刚参加完本月的主题沙龙"冲突中的智慧"，收获满满！💡 学会了在冲突中保持觉察，用好奇心代替批判。分享一个今天的练习：当感到愤怒时，先停下来问自己"我此刻的需求是什么？"这个简单的问题让我找到了内心的平静。',
    tags: ['主题沙龙', '冲突处理', '内心平静'],
    mentionedActivities: [
      {
        activityId: 'salon_001',
        activityTitle: '冲突中的智慧',
        activityType: 'ThemeSalon',
      },
    ],
    likesCount: 31,
    commentsCount: 12,
    sharesCount: 5,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
    isLiked: true,
    isBookmarked: true,
  },
  {
    postId: 'post_003',
    userId: 'user_001',
    userName: '张华',
    userAvatar: '/avatars/user-001.png',
    content:
      '今天是我连续练习的第30天！🎉 从最初的懵懂到现在的渐入佳境，每一天都能感受到内心的变化。特别感谢@刘轶说生命成长 活动中老师的那句话："成长不是改变自己，而是成为自己。"这句话一直激励着我。',
    images: ['/posts/post-003-1.jpg', '/posts/post-003-2.jpg'],
    tags: ['连续学习', '生命成长', '自我觉察'],
    mentionedActivities: [
      {
        activityId: 'growth_001',
        activityTitle: '成为真实的自己',
        activityType: 'LifeGrowth',
      },
    ],
    likesCount: 45,
    commentsCount: 15,
    sharesCount: 8,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8小时前
    isLiked: true,
    isBookmarked: false,
  },
  {
    postId: 'post_004',
    userId: 'user_004',
    userName: '王丽',
    userAvatar: '/avatars/user-004.png',
    content:
      '分享一个小技巧：每天睡前写下三个感恩的事情，不仅是感恩外在的人和事，更要感恩自己今天的努力和成长。这个习惯让我的心态越来越平和，生活也变得更加美好。#感恩练习 #内心平和',
    tags: ['感恩练习', '内心平和', '生活美学'],
    likesCount: 18,
    commentsCount: 6,
    sharesCount: 2,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小时前
    isLiked: false,
    isBookmarked: true,
  },
  {
    postId: 'post_005',
    userId: 'user_005',
    userName: '陈强',
    userAvatar: '/avatars/user-005.png',
    content:
      '今天在驿站练习中遇到了一个挑战性的场景，一开始觉得很困难，但是当我放慢节奏，真正去感受对方的情绪时，竟然找到了连接点。NVC教会我的不仅是技巧，更是一种看待世界的方式。每个人背后都有自己的故事和需求。',
    tags: ['NVC学习', '同理心练习', '人际连接'],
    mentionedActivities: [
      {
        activityId: 'activity_002',
        activityTitle: '挑战性对话练习',
        activityType: 'EmpathyStation',
      },
    ],
    likesCount: 29,
    commentsCount: 10,
    sharesCount: 4,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
    isLiked: false,
    isBookmarked: false,
  },
]

export const mockFeedComments: FeedComment[] = [
  {
    commentId: 'comment_001',
    postId: 'post_001',
    userId: 'user_003',
    userName: '李梅',
    userAvatar: '/avatars/user-003.png',
    content: '太有共鸣了！我也在练习中发现了很多自己忽略的需求，感谢分享！',
    likesCount: 5,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isLiked: true,
  },
  {
    commentId: 'comment_002',
    postId: 'post_001',
    userId: 'user_001',
    userName: '张华',
    userAvatar: '/avatars/user-001.png',
    content: '这个平台真的很棒，让我们可以在成长路上相互支持！',
    likesCount: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    isLiked: false,
  },
  {
    commentId: 'comment_003',
    postId: 'post_002',
    userId: 'user_004',
    userName: '王丽',
    userAvatar: '/avatars/user-004.png',
    content: '这个问题很有启发性！我也要试试在愤怒时问自己需求是什么。',
    likesCount: 8,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isLiked: true,
  },
  {
    commentId: 'comment_004',
    postId: 'post_003',
    userId: 'user_002',
    userName: '小明',
    userAvatar: '/avatars/user-002.png',
    content: '恭喜连续练习30天！这个成就真的很棒，我现在才第5天，要向你学习！',
    likesCount: 4,
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
    isLiked: false,
  },
]

// 常用标签
export const mockPopularTags = [
  '#NVC学习',
  '#同理心分享',
  '#成长感悟',
  '#内心平和',
  '#主题沙龙',
  '#感恩练习',
  '#自我觉察',
  '#人际连接',
  '#冲突处理',
  '#生命成长',
  '#生活美学',
  '#同理心练习',
]
