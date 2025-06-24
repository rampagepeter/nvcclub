<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🌱</div>
          <h2>NVC管理后台</h2>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          to="/admin/dashboard"
          class="nav-item"
          :class="{ active: $route.name === 'AdminDashboard' }"
        >
          <el-icon><DataBoard /></el-icon>
          <span>数据仪表板</span>
        </router-link>

        <router-link
          to="/admin/users"
          class="nav-item"
          :class="{ active: $route.name === 'AdminUserManagement' }"
        >
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>

        <router-link
          to="/admin/content"
          class="nav-item"
          :class="{
            active:
              $route.name?.toString().startsWith('AdminContent') ||
              $route.name?.toString().startsWith('AdminActivity'),
          }"
        >
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </router-link>

        <router-link
          to="/admin/moderation"
          class="nav-item"
          :class="{ active: $route.name === 'AdminContentModeration' }"
        >
          <el-icon><Warning /></el-icon>
          <span>内容审核</span>
        </router-link>

        <router-link
          to="/admin/tags"
          class="nav-item"
          :class="{ active: $route.name === 'AdminTagManagement' }"
        >
          <el-icon><Collection /></el-icon>
          <span>标签管理</span>
        </router-link>

        <router-link
          to="/admin/badges"
          class="nav-item"
          :class="{ active: $route.name === 'AdminBadgeManagement' }"
        >
          <el-icon><Medal /></el-icon>
          <span>徽章管理</span>
        </router-link>

        <router-link
          to="/admin/settings"
          class="nav-item"
          :class="{ active: $route.name === 'AdminSystemSettings' }"
        >
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-info">
          <el-avatar :size="32" :src="authStore.user?.avatarUrl">
            {{ authStore.user?.nickname?.[0] || 'A' }}
          </el-avatar>
          <div class="admin-details">
            <div class="admin-name">{{ authStore.user?.nickname || '管理员' }}</div>
            <div class="admin-role">系统管理员</div>
          </div>
        </div>

        <el-button type="danger" size="small" @click="handleLogout" class="logout-btn">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="admin-main">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  DataBoard,
  User,
  Document,
  Setting,
  SwitchButton,
  Warning,
  Collection,
  Medal,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
}

.logo h2 {
  margin: 0;
  color: #2e7d32;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #606266;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover:not(.disabled) {
  background: #f5f7fa;
  color: #2e7d32;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(46, 125, 50, 0.1) 0%, transparent 100%);
  color: #2e7d32;
  border-right: 3px solid #2e7d32;
}

.nav-item.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  justify-content: space-between;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.admin-details {
  flex: 1;
}

.admin-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.admin-role {
  font-size: 12px;
  color: #909399;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.admin-main {
  flex: 1;
  margin-left: 260px;
  padding: 24px 32px;
  overflow-y: auto;
  min-height: 100vh;
  width: calc(100vw - 260px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-layout {
    position: relative;
  }

  .admin-sidebar {
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.3s;
    position: fixed;
    background: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .admin-main {
    margin-left: 0;
    width: 100vw;
    padding: 16px;
    min-height: 100vh;
  }

  /* 当需要显示侧边栏时 */
  .admin-sidebar.mobile-show {
    transform: translateX(0);
  }

  /* 移动端遮罩层 */
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
  }

  .mobile-overlay.show {
    display: block;
  }
}

/* 确保大屏幕时充分利用空间 */
@media (min-width: 1200px) {
  .admin-main {
    padding: 24px 48px;
  }
}

@media (min-width: 1600px) {
  .admin-main {
    padding: 32px 64px;
  }
}
</style>
