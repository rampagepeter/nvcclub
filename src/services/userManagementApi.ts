import type {
  UserManagementData,
  CreateUserRequest,
  UpdateUserRequest,
  BatchCreateUserRequest,
  UserSearchFilter,
  UserListResponse,
  ExcelImportResult,
  ApiResponse,
} from '@/types'

// 模拟用户管理数据
const mockUsers: UserManagementData[] = [
  {
    userId: 'u1',
    nickname: '张小花',
    phone: '13800138001',
    passwordHash: 'hashed_password_1',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=1',
    joinDate: new Date('2024-01-15'),
    level: 8,
    xp: 2400,
    xpForNextLevel: 2700,
    streak: {
      current: 15,
      lastPracticeDate: new Date('2024-12-13'),
    },
    badges: ['listener', 'empath', 'helper'],
    inventory: {},
    growthTree: {
      level: 3,
      elements: {
        leaves: 120,
        flowers: 15,
        fruits: 8,
      },
    },
    status: 'active',
    lastLoginAt: new Date('2024-12-13'),
    totalActivities: 45,
    totalPosts: 23,
    createdBy: 'admin',
    updatedAt: new Date('2024-12-10'),
  },
  {
    userId: 'u2',
    nickname: '李同理',
    phone: '13800138002',
    passwordHash: 'hashed_password_2',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=2',
    joinDate: new Date('2024-02-20'),
    level: 6,
    xp: 1800,
    xpForNextLevel: 2100,
    streak: {
      current: 8,
      lastPracticeDate: new Date('2024-12-12'),
    },
    badges: ['listener', 'participant'],
    inventory: {},
    growthTree: {
      level: 2,
      elements: {
        leaves: 85,
        flowers: 8,
        fruits: 3,
      },
    },
    status: 'active',
    lastLoginAt: new Date('2024-12-12'),
    totalActivities: 32,
    totalPosts: 18,
    createdBy: 'admin',
    updatedAt: new Date('2024-12-05'),
  },
  {
    userId: 'u3',
    nickname: '王成长',
    phone: '13800138003',
    passwordHash: 'hashed_password_3',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=3',
    joinDate: new Date('2024-03-10'),
    level: 12,
    xp: 3600,
    xpForNextLevel: 4200,
    streak: {
      current: 25,
      lastPracticeDate: new Date('2024-12-13'),
    },
    badges: ['listener', 'empath', 'helper', 'master'],
    inventory: {},
    growthTree: {
      level: 4,
      elements: {
        leaves: 180,
        flowers: 25,
        fruits: 15,
      },
    },
    status: 'active',
    lastLoginAt: new Date('2024-12-13'),
    totalActivities: 78,
    totalPosts: 45,
    createdBy: 'admin',
    updatedAt: new Date('2024-12-08'),
  },
  {
    userId: 'u4',
    nickname: '赵静心',
    phone: '13800138004',
    passwordHash: 'hashed_password_4',
    role: 'user',
    avatarUrl: 'https://picsum.photos/64/64?random=4',
    joinDate: new Date('2024-11-01'),
    level: 3,
    xp: 800,
    xpForNextLevel: 1200,
    streak: {
      current: 0,
      lastPracticeDate: new Date('2024-11-25'),
    },
    badges: ['newcomer'],
    inventory: {},
    growthTree: {
      level: 1,
      elements: {
        leaves: 25,
        flowers: 2,
        fruits: 0,
      },
    },
    status: 'inactive',
    lastLoginAt: new Date('2024-11-25'),
    totalActivities: 8,
    totalPosts: 3,
    createdBy: 'admin',
    updatedAt: new Date('2024-11-20'),
  },
  {
    userId: 'u5',
    nickname: '管理员小助手',
    phone: '13900139000',
    passwordHash: 'hashed_password_admin',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/64/64?random=5',
    joinDate: new Date('2024-01-01'),
    level: 1,
    xp: 0,
    xpForNextLevel: 300,
    streak: {
      current: 0,
      lastPracticeDate: new Date('2024-01-01'),
    },
    badges: ['admin'],
    inventory: {},
    growthTree: {
      level: 1,
      elements: {
        leaves: 0,
        flowers: 0,
        fruits: 0,
      },
    },
    status: 'active',
    lastLoginAt: new Date('2024-12-13'),
    totalActivities: 0,
    totalPosts: 0,
    createdBy: 'system',
    updatedAt: new Date('2024-12-01'),
  },
]

// 获取用户列表（带分页和筛选）
export const getUserList = async (
  page: number = 1,
  pageSize: number = 10,
  filter?: UserSearchFilter,
): Promise<ApiResponse<UserListResponse>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // 模拟网络延迟

  try {
    let filteredUsers = [...mockUsers]

    // 应用筛选条件
    if (filter) {
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        filteredUsers = filteredUsers.filter(
          (user) => user.nickname.toLowerCase().includes(keyword) || user.phone.includes(keyword),
        )
      }

      if (filter.role && filter.role !== 'all') {
        filteredUsers = filteredUsers.filter((user) => user.role === filter.role)
      }

      if (filter.status && filter.status !== 'all') {
        filteredUsers = filteredUsers.filter((user) => user.status === filter.status)
      }

      if (filter.level && filter.level > 0) {
        filteredUsers = filteredUsers.filter((user) => user.level >= filter.level!)
      }

      // 排序
      if (filter.sortBy) {
        filteredUsers.sort((a, b) => {
          let comparison = 0
          switch (filter.sortBy) {
            case 'newest':
              comparison = new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
              break
            case 'oldest':
              comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
              break
            case 'level':
              comparison = b.level - a.level
              break
            case 'activity':
              comparison = b.totalActivities - a.totalActivities
              break
          }
          return filter.sortOrder === 'asc' ? -comparison : comparison
        })
      }
    }

    const total = filteredUsers.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const users = filteredUsers.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        users,
        total,
        page,
        pageSize,
        totalPages,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: '获取用户列表失败',
    }
  }
}

// 获取单个用户详情
export const getUserDetail = async (userId: string): Promise<ApiResponse<UserManagementData>> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const user = mockUsers.find((u) => u.userId === userId)
    if (!user) {
      return {
        success: false,
        error: '用户不存在',
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    return {
      success: false,
      error: '获取用户详情失败',
    }
  }
}

// 创建单个用户
export const createUser = async (
  userData: CreateUserRequest,
): Promise<ApiResponse<UserManagementData>> => {
  await new Promise((resolve) => setTimeout(resolve, 800))

  try {
    // 检查手机号是否已存在
    const existingUser = mockUsers.find((u) => u.phone === userData.phone)
    if (existingUser) {
      return {
        success: false,
        error: '手机号已存在',
      }
    }

    const newUser: UserManagementData = {
      userId: `u${Date.now()}`,
      nickname: userData.nickname,
      phone: userData.phone,
      passwordHash: `hashed_${userData.password}`,
      role: userData.role || 'user',
      avatarUrl: `https://picsum.photos/64/64?random=${Date.now()}`,
      joinDate: new Date(),
      level: 1,
      xp: 0,
      xpForNextLevel: 300,
      streak: {
        current: 0,
        lastPracticeDate: new Date(),
      },
      badges: userData.role === 'admin' ? ['admin'] : ['newcomer'],
      inventory: {},
      growthTree: {
        level: 1,
        elements: {
          leaves: 0,
          flowers: 0,
          fruits: 0,
        },
      },
      status: userData.status || 'active',
      lastLoginAt: undefined,
      totalActivities: 0,
      totalPosts: 0,
      createdBy: 'admin',
      updatedAt: new Date(),
    }

    mockUsers.push(newUser)

    return {
      success: true,
      data: newUser,
      message: '用户创建成功',
    }
  } catch (error) {
    return {
      success: false,
      error: '创建用户失败',
    }
  }
}

// 批量创建用户
export const batchCreateUsers = async (
  batchData: BatchCreateUserRequest,
): Promise<ApiResponse<ExcelImportResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    const result: ExcelImportResult = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [],
      duplicates: [],
    }

    for (let i = 0; i < batchData.users.length; i++) {
      const userData = batchData.users[i]
      const rowNumber = i + 2 // Excel行号（从第2行开始，第1行是标题）

      // 验证必填字段
      if (!userData.phone || !userData.password || !userData.nickname) {
        result.errors.push({
          row: rowNumber,
          phone: userData.phone || '未提供',
          error: '缺少必填字段（手机号、密码或昵称）',
        })
        result.failureCount++
        continue
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(userData.phone)) {
        result.errors.push({
          row: rowNumber,
          phone: userData.phone,
          error: '手机号格式不正确',
        })
        result.failureCount++
        continue
      }

      // 检查是否重复
      const existingUser = mockUsers.find((u) => u.phone === userData.phone)
      if (existingUser) {
        result.duplicates.push(userData.phone)
        result.failureCount++
        continue
      }

      // 创建用户
      const createResult = await createUser(userData)
      if (createResult.success) {
        result.successCount++
      } else {
        result.errors.push({
          row: rowNumber,
          phone: userData.phone,
          error: createResult.error || '创建失败',
        })
        result.failureCount++
      }
    }

    result.success = result.successCount > 0

    return {
      success: true,
      data: result,
      message: `批量导入完成：成功 ${result.successCount} 个，失败 ${result.failureCount} 个`,
    }
  } catch (error) {
    return {
      success: false,
      error: '批量创建用户失败',
    }
  }
}

// 更新用户信息
export const updateUser = async (
  userId: string,
  userData: UpdateUserRequest,
): Promise<ApiResponse<UserManagementData>> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const userIndex = mockUsers.findIndex((u) => u.userId === userId)
    if (userIndex === -1) {
      return {
        success: false,
        error: '用户不存在',
      }
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date(),
    }

    mockUsers[userIndex] = updatedUser

    return {
      success: true,
      data: updatedUser,
      message: '用户信息更新成功',
    }
  } catch (error) {
    return {
      success: false,
      error: '更新用户信息失败',
    }
  }
}

// 删除用户
export const deleteUser = async (userId: string): Promise<ApiResponse<void>> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const userIndex = mockUsers.findIndex((u) => u.userId === userId)
    if (userIndex === -1) {
      return {
        success: false,
        error: '用户不存在',
      }
    }

    mockUsers.splice(userIndex, 1)

    return {
      success: true,
      message: '用户删除成功',
    }
  } catch (error) {
    return {
      success: false,
      error: '删除用户失败',
    }
  }
}

// 重置用户密码
export const resetUserPassword = async (
  userId: string,
  newPassword: string,
): Promise<ApiResponse<void>> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const userIndex = mockUsers.findIndex((u) => u.userId === userId)
    if (userIndex === -1) {
      return {
        success: false,
        error: '用户不存在',
      }
    }

    mockUsers[userIndex].passwordHash = `hashed_${newPassword}`
    mockUsers[userIndex].updatedAt = new Date()

    return {
      success: true,
      message: '密码重置成功',
    }
  } catch (error) {
    return {
      success: false,
      error: '重置密码失败',
    }
  }
}
