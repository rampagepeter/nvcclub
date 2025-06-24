<template>
  <AdminLayout>
    <div class="admin-dashboard">
      <!-- 页面头部 -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>📊 数据仪表板</h1>
          <p>实时监控系统运行状态和用户活动数据</p>
        </div>
        <div class="header-actions">
          <el-tag
            :type="getHealthType(dashboardStats.systemHealth)"
            size="large"
            class="health-tag"
          >
            {{ getHealthText(dashboardStats.systemHealth) }}
          </el-tag>
          <el-button type="primary" :icon="Refresh" @click="loadDashboardData" :loading="loading">
            刷新数据
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card users-card">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
            <div class="stat-change">
              <span class="change-text">今日新增 {{ dashboardStats.newUsersToday }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card active-card">
          <div class="stat-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
            <div class="stat-change">
              <span class="change-text">活跃率 {{ activeUserRate }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card activities-card">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.totalActivities }}</div>
            <div class="stat-label">总活动数</div>
            <div class="stat-change">
              <span class="change-text">本周完成 {{ weeklyActivities }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card health-card">
          <div class="stat-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getHealthIcon(dashboardStats.systemHealth) }}</div>
            <div class="stat-label">系统状态</div>
            <div class="stat-change">
              <span class="change-text">{{ getHealthText(dashboardStats.systemHealth) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部区域：图表和活动记录 -->
      <div class="bottom-section">
        <!-- 用户等级分布图表 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>👥 用户等级分布</h3>
            <el-tag size="small" type="info">实时数据</el-tag>
          </div>
          <div class="level-distribution">
            <div v-for="item in levelDistribution" :key="item.level" class="level-item">
              <div class="level-info">
                <span class="level-number">Lv.{{ item.level }}</span>
                <span class="level-count">{{ item.count }}人</span>
              </div>
              <div class="level-bar">
                <div
                  class="level-progress"
                  :style="{ width: `${(item.count / maxLevelCount) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 三大活动类型统计 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>📊 活动类型统计</h3>
            <el-tag size="small" type="success">本月数据</el-tag>
          </div>
          <div class="activity-stats">
            <div class="activity-item">
              <div class="activity-header">
                <div class="activity-icon">🏠</div>
                <div class="activity-info">
                  <div class="activity-name">同理心驿站</div>
                  <div class="activity-desc">周一-周六，每日练习</div>
                </div>
              </div>
              <div class="activity-numbers">
                <div class="number-item">
                  <span class="number">{{
                    dashboardStats.activityStats.empathyStation.totalSessions
                  }}</span>
                  <span class="label">总场次</span>
                </div>
                <div class="number-item">
                  <span class="number">{{
                    dashboardStats.activityStats.empathyStation.averageParticipants
                  }}</span>
                  <span class="label">平均参与</span>
                </div>
                <div class="number-item">
                  <span class="number"
                    >{{ dashboardStats.activityStats.empathyStation.completionRate }}%</span
                  >
                  <span class="label">完成率</span>
                </div>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-header">
                <div class="activity-icon">💬</div>
                <div class="activity-info">
                  <div class="activity-name">主题沙龙</div>
                  <div class="activity-desc">每月一次，深度探讨</div>
                </div>
              </div>
              <div class="activity-numbers">
                <div class="number-item">
                  <span class="number">{{
                    dashboardStats.activityStats.themeSalon.totalSessions
                  }}</span>
                  <span class="label">总场次</span>
                </div>
                <div class="number-item">
                  <span class="number">{{
                    dashboardStats.activityStats.themeSalon.averageParticipants
                  }}</span>
                  <span class="label">平均参与</span>
                </div>
                <div class="number-item">
                  <span class="number"
                    >{{ dashboardStats.activityStats.themeSalon.completionRate }}%</span
                  >
                  <span class="label">完成率</span>
                </div>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-header">
                <div class="activity-icon">🎤</div>
                <div class="activity-info">
                  <div class="activity-name">刘轶说生命成长</div>
                  <div class="activity-desc">每季度一次，智慧分享</div>
                </div>
              </div>
              <div class="activity-numbers">
                <div class="number-item">
                  <span class="number">{{
                    dashboardStats.activityStats.lifeGrowth.totalSessions
                  }}</span>
                  <span class="label">总场次</span>
                </div>
                <div class="number-item">
                  <span class="number">{{
                    dashboardStats.activityStats.lifeGrowth.averageParticipants
                  }}</span>
                  <span class="label">平均参与</span>
                </div>
                <div class="number-item">
                  <span class="number"
                    >{{ dashboardStats.activityStats.lifeGrowth.completionRate }}%</span
                  >
                  <span class="label">完成率</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近活动记录 -->
        <div class="recent-activities-section">
          <div class="section-header">
            <h3>📝 最近活动记录</h3>
            <el-button type="primary" text size="small"> 查看更多 </el-button>
          </div>

          <div class="activities-list">
            <div v-for="log in recentActivityLogs" :key="log.logId" class="activity-log-item">
              <div class="activity-content">
                <div class="activity-main">
                  <span class="user-name">{{ log.userName }}</span>
                  <span class="activity-action">{{ getActivityAction(log.activityType) }}</span>
                  <span class="activity-title">{{ log.activityTitle }}</span>
                  <el-tag
                    :type="getActivityTagType(log.activityType)"
                    size="small"
                    class="activity-type-tag"
                  >
                    {{ getActivityTypeName(log.activityType) }}
                  </el-tag>
                </div>
                <div class="activity-meta">
                  <span class="activity-time">{{ formatTime(log.timestamp) }}</span>
                  <span class="activity-xp">+{{ log.xpEarned }}XP</span>
                  <span v-if="log.notes" class="activity-notes">{{ log.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/AdminLayout.vue'
import { adminApi } from '@/services/api'
import { User, UserFilled, Calendar, Monitor, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { AdminDashboardStats, AdminActivityLog } from '@/types'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const dashboardStats = ref<AdminDashboardStats>({
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  totalActivities: 0,
  systemHealth: 'good',
  levelDistribution: [],
  recentActivities: [],
  userGrowthTrend: [],
  activityStats: {
    empathyStation: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
    themeSalon: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
    lifeGrowth: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
  },
})

// 计算属性
const activeUserRate = computed(() => {
  if (dashboardStats.value.totalUsers === 0) return 0
  return Math.round((dashboardStats.value.activeUsers / dashboardStats.value.totalUsers) * 100)
})

const weeklyActivities = computed(() => {
  // 模拟本周活动数据
  return Math.floor(dashboardStats.value.totalActivities * 0.1)
})

const healthType = computed(() => {
  return getHealthType(dashboardStats.value.systemHealth)
})

const healthText = computed(() => {
  return getHealthText(dashboardStats.value.systemHealth)
})

const levelDistribution = computed(() => {
  return dashboardStats.value.levelDistribution || []
})

const maxLevelCount = computed(() => {
  const counts = levelDistribution.value.map((item) => item.count)
  return Math.max(...counts, 1)
})

const recentActivityLogs = computed(() => {
  return dashboardStats.value.recentActivities || []
})

// 方法
const getHealthType = (health: string) => {
  const types = {
    good: 'success',
    warning: 'warning',
    error: 'danger',
  }
  return types[health as keyof typeof types] || 'info'
}

const getHealthText = (health: string) => {
  const texts = {
    good: '系统正常',
    warning: '需要关注',
    error: '系统异常',
  }
  return texts[health as keyof typeof texts] || '未知状态'
}

const getHealthIcon = (health: string) => {
  const icons = {
    good: '✅',
    warning: '⚠️',
    error: '❌',
  }
  return icons[health as keyof typeof icons] || '❓'
}

const getLevelPercentage = (count: number) => {
  const maxCount = Math.max(...dashboardStats.value.levelDistribution.map((item) => item.count))
  return maxCount > 0 ? (count / maxCount) * 100 : 0
}

const getActivityTagType = (type: string) => {
  const types = {
    EmpathyStation: 'success',
    ThemeSalon: 'warning',
    LifeGrowth: 'danger',
  }
  return types[type as keyof typeof types] || 'info'
}

const getActivityTypeName = (type: string) => {
  const names = {
    EmpathyStation: '驿站',
    ThemeSalon: '沙龙',
    LifeGrowth: '成长',
  }
  return names[type as keyof typeof names] || '未知'
}

const getActivityAction = (activityType: string) => {
  const actions = {
    EmpathyStation: '完成了',
    ThemeSalon: '参加了',
    LifeGrowth: '观看了',
  }
  return actions[activityType as keyof typeof actions] || '参与了'
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    const response = await adminApi.getDashboardStats()
    if (response.success && response.data) {
      dashboardStats.value = response.data
    } else {
      ElMessage.error(response.error || '获取数据失败')
      // 提供默认值避免undefined错误
      dashboardStats.value = {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        totalActivities: 0,
        systemHealth: 'error' as const,
        levelDistribution: [],
        recentActivities: [],
        userGrowthTrend: [],
        activityStats: {
          empathyStation: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
          themeSalon: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
          lifeGrowth: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
        },
      }
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    // 提供默认值避免undefined错误
    dashboardStats.value = {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      totalActivities: 0,
      systemHealth: 'error' as const,
      levelDistribution: [],
      recentActivities: [],
      userGrowthTrend: [],
      activityStats: {
        empathyStation: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
        themeSalon: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
        lifeGrowth: { totalSessions: 0, averageParticipants: 0, completionRate: 0 },
      },
    }
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* Updated: 2024-12-14 15:00 - Fixed mobile layout */
.admin-dashboard {
  width: 100%;
  /* 移除max-width限制，让它充分利用可用空间 */
}

/* 页面头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 28px;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.health-tag {
  font-weight: 600;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 在宽屏上固定显示4列 */
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕显示2列 */
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 20px; /* 减少移动端内边距 */
  }

  .header-content h1 {
    font-size: 24px; /* 移动端减小标题字体 */
  }

  .header-actions {
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px; /* 减少移动端卡片间距 */
  }

  .stat-card {
    padding: 20px; /* 减少移动端卡片内边距 */
  }

  /* 强制移动端单列布局 */
  .bottom-section {
    display: grid !important;
    grid-template-columns: 1fr !important; /* 强制小屏幕显示1列 */
    gap: 16px !important; /* 减少间距 */
  }

  .chart-card {
    padding: 20px; /* 减少移动端内边距 */
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .recent-activities-section {
    padding: 20px; /* 减少移动端内边距 */
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .activity-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .activity-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.users-card .stat-icon {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
}

.active-card .stat-icon {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.activities-card .stat-icon {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.health-card .stat-icon {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
}

.change-text {
  color: #4caf50;
  font-weight: 500;
}

/* 底部区域：图表和活动记录 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr; /* 调整比例：等级分布更宽，活动记录最宽 */
  gap: 24px;
}

/* 针对超宽屏的优化 */
@media (min-width: 1800px) {
  .bottom-section {
    grid-template-columns: 1fr 1fr 2fr; /* 超宽屏时给活动记录更多空间 */
  }
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.chart-header h3 {
  margin: 0;
  color: #2e7d32;
  font-size: 18px;
  font-weight: 600;
}

/* 等级分布 */
.level-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  width: 80px;
  font-size: 14px;
}

.level-number {
  font-weight: 600;
  color: #2e7d32;
}

.level-count {
  color: #666;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #2e7d32);
  border-radius: 4px;
  transition: width 0.3s;
}

/* 活动统计 */
.activity-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  padding: 18px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.activity-item:hover {
  border-color: #2e7d32;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.activity-icon {
  font-size: 22px;
}

.activity-info {
  flex: 1;
}

.activity-name {
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 4px;
  font-size: 15px;
}

.activity-desc {
  font-size: 13px;
  color: #666;
}

.activity-numbers {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.number-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.number-item .number {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
}

.number-item .label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* 最近活动 */
.recent-activities-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h3 {
  margin: 0;
  color: #2e7d32;
  font-size: 18px;
  font-weight: 600;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-log-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.activity-log-item:hover {
  border-color: #2e7d32;
  background: #f9f9f9;
}

.activity-content {
  flex: 1;
}

.activity-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 600;
  color: #2e7d32;
}

.activity-action {
  color: #666;
  font-size: 14px;
}

.activity-title {
  color: #333;
  font-weight: 500;
}

.activity-type-tag {
  margin-left: 8px;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.activity-time {
  color: #999;
}

.activity-xp {
  color: #4caf50;
  font-weight: 600;
}

.activity-notes {
  color: #666;
  font-style: italic;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .bottom-section {
    grid-template-columns: 1fr 1fr 1fr; /* 在中等宽度下使用等比例 */
  }
}

@media (max-width: 1200px) {
  .bottom-section {
    grid-template-columns: 1fr 1fr; /* 中等屏幕显示2列 */
  }
}

/* 移动端和小屏幕设备强制单列 */
@media (max-width: 900px) {
  .bottom-section {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  .chart-card,
  .recent-activities-section {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
</style>
