import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 重定向根路径到用户主页
    {
      path: '/',
      redirect: '/dashboard',
    },

    // 认证相关路由
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },

    // 用户端路由
    {
      path: '/dashboard',
      redirect: '/user/dashboard',
    },
    {
      path: '/user/dashboard',
      name: 'UserDashboard',
      component: () => import('@/views/user/UserDashboardView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/profile',
      name: 'Profile',
      component: () => import('@/views/user/ProfileView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/empathy-station',
      name: 'EmpathyStation',
      component: () => import('@/views/user/EmpathyStationView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/theme-salon',
      name: 'ThemeSalon',
      component: () => import('@/views/user/ThemeSalonView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/life-growth',
      name: 'LifeGrowth',
      component: () => import('@/views/user/LifeGrowthView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/badges',
      name: 'BadgeCollection',
      component: () => import('@/views/user/BadgeCollectionView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/community',
      name: 'CommunityHub',
      component: () => import('@/views/user/CommunityHubView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },

    // 兼容旧路径的重定向
    {
      path: '/profile',
      redirect: '/user/profile',
    },
    {
      path: '/station',
      redirect: '/user/empathy-station',
    },
    {
      path: '/salon',
      redirect: '/user/theme-salon',
    },
    {
      path: '/community',
      redirect: '/user/community',
    },

    // 管理员路由
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboardView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/users',
      name: 'AdminUserManagement',
      component: () => import('@/views/admin/AdminUserManagementView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/users/:userId',
      name: 'AdminUserDetail',
      component: () => import('@/views/admin/AdminUserDetailView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/content',
      name: 'AdminContentManagement',
      component: () => import('@/views/admin/AdminContentManagementView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/moderation',
      name: 'AdminContentModeration',
      component: () => import('@/views/admin/AdminContentModerationView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/tags',
      name: 'AdminTagManagement',
      component: () => import('@/views/admin/AdminTagManagementView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/badges',
      name: 'AdminBadgeManagement',
      component: () => import('@/views/admin/AdminBadgeManagementView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/settings',
      name: 'AdminSystemSettings',
      component: () => import('@/views/admin/AdminSystemSettingsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },

    // 404页面
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面未找到' },
    },

    // 捕获所有未匹配的路由
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化认证状态（仅第一次）
  if (!authStore.isAuthenticated && localStorage.getItem('accessToken')) {
    await authStore.initializeAuth()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // 检查角色权限
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      // 如果是admin试图访问user页面，重定向到admin dashboard
      if (authStore.isAdmin && to.meta.role === 'user') {
        next('/admin/dashboard')
        return
      }
      // 如果是user试图访问admin页面，返回dashboard
      if (!authStore.isAdmin && to.meta.role === 'admin') {
        next('/dashboard')
        return
      }
    }
  }

  // 检查是否需要游客身份（未登录）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // 根据用户角色重定向
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else {
      next('/dashboard')
    }
    return
  }

  next()
})

export default router
