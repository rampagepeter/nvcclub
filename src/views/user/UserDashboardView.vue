<template>
  <div class="dashboard-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner type="growth" size="large" text="正在加载您的成长数据..." />
    </div>

    <!-- 主要内容 -->
    <div v-else>
      <!-- 欢迎头部 -->
      <div class="welcome-header">
        <div class="user-greeting">
          <el-avatar :size="56" :src="userStore.user?.avatarUrl" class="user-avatar">
            {{ userStore.user?.nickname?.[0] || 'U' }}
          </el-avatar>
          <div class="greeting-text">
            <h2>你好，{{ userStore.user?.nickname || '成长者' }}！</h2>
            <p>欢迎回到NVC成长乐园，今天也要继续成长哦～</p>
          </div>
        </div>
        <div class="user-actions">
          <el-button @click="router.push('/user/profile')">
            <el-icon><User /></el-icon>
            个人资料
          </el-button>
          <el-button type="danger" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </div>

      <!-- 成长数据面板 -->
      <div class="growth-panel">
        <div class="tree-container">
          <div class="tree-section">
            <h3>🌱 我的成长之树</h3>
            <GrowthTreeComponent
              :tree-data="
                userStore.user?.growthTree || {
                  level: 1,
                  elements: { leaves: 5, flowers: 2, fruits: 0 },
                }
              "
            />
          </div>
          <div class="stats-panel">
            <div class="stats-grid">
              <div class="stat-card level-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                  <div class="stat-value">Lv.{{ level }}</div>
                  <div class="stat-label">当前等级</div>
                </div>
              </div>
              <div class="stat-card xp-card">
                <div class="stat-icon">💎</div>
                <div class="stat-content">
                  <div class="stat-value">{{ xp.toLocaleString() }}</div>
                  <div class="stat-label">经验值</div>
                  <div class="stat-progress">
                    <el-progress
                      :percentage="Math.round((xp / xpForNextLevel) * 100)"
                      :show-text="false"
                      :stroke-width="6"
                    />
                  </div>
                </div>
              </div>
              <div class="stat-card streak-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                  <div class="stat-value">{{ streak }}</div>
                  <div class="stat-label">连续天数</div>
                </div>
              </div>
              <div class="stat-card badges-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-content">
                  <div class="stat-value">{{ userStore.user?.badges?.length || 0 }}</div>
                  <div class="stat-label">已获徽章</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日推荐活动 -->
      <div class="activities-section">
        <h3>📅 今日推荐活动</h3>
        <div class="activity-cards">
          <div
            v-for="activity in recommendedActivities"
            :key="activity.activityId"
            class="activity-card"
            :class="{
              'empathy-station-card': activity.type === 'EmpathyStation',
              'theme-salon-card': activity.type === 'ThemeSalon',
              'life-growth-card': activity.type === 'LifeGrowth',
            }"
            @click="navigateToActivityDetail(activity)"
          >
            <div class="activity-icon">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <div class="activity-meta">
                <span class="activity-frequency">{{ getFrequencyText(activity.frequency) }}</span>
                <div class="activity-action">
                  <el-button type="primary" size="small" class="signup-btn">
                    点击查看
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速导航 -->
      <div class="quick-nav-section">
        <h3>🚀 快速导航</h3>
        <div class="nav-grid">
          <div class="nav-item" @click="router.push('/user/empathy-station')">
            <div class="nav-icon">🏠</div>
            <div class="nav-title">同理心驿站</div>
            <div class="nav-desc">每日练习</div>
          </div>
          <div class="nav-item" @click="router.push('/user/theme-salon')">
            <div class="nav-icon">💬</div>
            <div class="nav-title">主题沙龙</div>
            <div class="nav-desc">深度学习</div>
          </div>
          <div class="nav-item" @click="router.push('/user/life-growth')">
            <div class="nav-icon">🎤</div>
            <div class="nav-title">生命成长</div>
            <div class="nav-desc">季度分享</div>
          </div>
          <div class="nav-item" @click="router.push('/user/badges')">
            <div class="nav-icon">🏆</div>
            <div class="nav-title">徽章收藏</div>
            <div class="nav-desc">成就展示</div>
          </div>
          <div class="nav-item" @click="router.push('/user/community')">
            <div class="nav-icon">🌍</div>
            <div class="nav-title">社区广场</div>
            <div class="nav-desc">分享交流</div>
          </div>
          <div class="nav-item" @click="router.push('/user/profile')">
            <div class="nav-icon">👤</div>
            <div class="nav-title">个人中心</div>
            <div class="nav-desc">资料设置</div>
          </div>
        </div>
      </div>

      <!-- 社区能量统计 -->
      <div class="community-section">
        <div class="community-stats">
          <h3>🌟 社区能量</h3>
          <div class="energy-display">
            <div class="energy-number">{{ communityStats.stationEnergy?.toLocaleString() }}</div>
            <div class="energy-desc">今日同理心驿站累计能量</div>
          </div>
          <div class="community-numbers">
            <div class="number-item">
              <span class="number">{{ communityStats.totalUsers }}</span>
              <span class="label">总成员</span>
            </div>
            <div class="number-item">
              <span class="number">{{ communityStats.activeUsers }}</span>
              <span class="label">活跃用户</span>
            </div>
            <div class="number-item">
              <span class="number">{{ communityStats.totalActivities }}</span>
              <span class="label">总活动数</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { activityApi, communityApi } from '@/services/api'
import GrowthTreeComponent from '@/components/GrowthTreeComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { Trophy, Star, User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Activity, CommunityStats } from '@/types'

const router = useRouter()
const userStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const recommendedActivities = ref<Activity[]>([])
const communityStats = ref<CommunityStats>({
  stationEnergy: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalActivities: 0,
})

// 计算属性
const level = computed(() => userStore.user?.level || 1)
const xp = computed(() => userStore.user?.xp || 0)
const xpForNextLevel = computed(() => userStore.user?.xpForNextLevel || 1000)
const streak = computed(() => userStore.user?.streak?.current || 0)
const badgeCount = computed(() => userStore.user?.badges?.length || 0)
const treeData = computed(
  () =>
    userStore.user?.growthTree || {
      level: 1,
      elements: { leaves: 0, flowers: 0, fruits: 0 },
    },
)

const xpPercentage = computed(() => {
  const currentLevelXp = xp.value % 1000 // 假设每级1000XP
  return Math.round((currentLevelXp / 1000) * 100)
})

// 方法
const getActivityIcon = (type: string) => {
  const icons = {
    EmpathyStation: '🏠',
    ThemeSalon: '💬',
    LifeGrowth: '🎤',
  }
  return icons[type as keyof typeof icons] || '📚'
}

const getActivityFrequency = (type: string) => {
  const frequencies = {
    EmpathyStation: '周一至周六',
    ThemeSalon: '每月一次',
    LifeGrowth: '每季度一次',
  }
  return frequencies[type as keyof typeof frequencies] || '不定期'
}

const getActivityClass = (type: string) => {
  const classes = {
    EmpathyStation: 'empathy-station-card',
    ThemeSalon: 'theme-salon-card',
    LifeGrowth: 'life-growth-card',
  }
  return classes[type as keyof typeof classes] || ''
}

const getActionText = (type: string) => {
  const actions = {
    EmpathyStation: '开始练习',
    ThemeSalon: '查看详情',
    LifeGrowth: '了解更多',
  }
  return actions[type as keyof typeof actions] || '立即参与'
}

const getFrequencyText = (frequency: string) => {
  const frequencyMap: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    quarterly: '每季度',
    yearly: '每年',
  }
  return frequencyMap[frequency] || frequency
}

const navigateToActivity = (activity: Activity) => {
  const routes = {
    EmpathyStation: '/user/empathy-station',
    ThemeSalon: '/user/theme-salon',
    LifeGrowth: '/user/life-growth',
  }

  const route = routes[activity.type as keyof typeof routes]
  if (route) {
    router.push(route)
  } else {
    ElMessage.info('功能开发中，敬请期待！')
  }
}

const navigateToActivityDetail = (activity: Activity) => {
  router.push(`/user/activity/${activity.activityId}`)
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    // 并行加载数据
    const [activitiesRes, communityRes] = await Promise.all([
      activityApi.getRecommendedActivities(),
      communityApi.getCommunityStats(),
    ])

    if (activitiesRes.success) {
      recommendedActivities.value = activitiesRes.data || []
    }

    if (communityRes.success) {
      communityStats.value = communityRes.data || communityStats.value
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    // 用户取消操作
  }
}

// 生命周期
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* 加载状态 */
.loading-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin: 20px 0;
}

.dashboard-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px 12px; /* 减少左右padding */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 分区域最大宽度控制 - 兼容性优化版本 */
.welcome-header,
.growth-panel,
.community-section {
  width: 96vw; /* 使用96%视口宽度 */
  max-width: 1600px; /* 最大1600px */
  margin: 0 auto;
}

.activities-section,
.quick-nav-section {
  width: 98vw; /* 使用98%视口宽度 */
  max-width: 1800px; /* 最大1800px */
  margin: 0 auto;
}

/* 欢迎头部 */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  font-weight: bold;
}

.greeting-text h2 {
  margin: 0 0 4px 0;
  color: #2e7d32;
  font-size: 24px;
}

.greeting-text p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.user-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd54f, #ffb300);
  color: white;
  padding: 12px 16px;
  border-radius: 20px;
  font-weight: bold;
}

.logout-btn {
  border-radius: 20px;
}

/* 数据面板 */
.growth-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tree-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.tree-section h3 {
  margin: 0 0 16px 0;
  color: #2e7d32;
  font-size: 18px;
  font-weight: 600;
}

.stats-panel {
  display: flex;
  flex-direction: column;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-progress {
  margin-top: 4px;
}

/* 推荐活动 */
.activities-section {
  margin-bottom: 24px;
}

.activities-section h3 {
  color: #2e7d32;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.activity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.activity-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.activity-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  background: #f1f8e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 8px 0;
  color: #2e7d32;
}

.activity-content p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-frequency {
  font-size: 14px;
  color: #666;
}

.activity-action {
  text-align: right;
}

.signup-btn {
  border-radius: 20px;
}

/* 快速导航 */
.quick-nav-section {
  margin-bottom: 24px;
}

.quick-nav-section h3 {
  color: #2e7d32;
  margin-bottom: 16px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.nav-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.nav-title {
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 4px;
}

.nav-desc {
  font-size: 12px;
  color: #666;
}

/* 社区统计 */
.community-section {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.community-stats h3 {
  margin: 0 0 20px 0;
  text-align: center;
}

.energy-display {
  text-align: center;
  margin-bottom: 24px;
}

.energy-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.energy-desc {
  opacity: 0.9;
}

.community-numbers {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.number-item .number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.number-item .label {
  font-size: 14px;
  opacity: 0.9;
}

/* 活动卡片特色样式 */
.empathy-station-card {
  border-left: 4px solid #4caf50;
}

.empathy-station-card:hover {
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
}

.theme-salon-card {
  border-left: 4px solid #2196f3;
}

.theme-salon-card:hover {
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.2);
}

.life-growth-card {
  border-left: 4px solid #ff9800;
}

.life-growth-card:hover {
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.2);
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-frequency {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 12px;
}

.activity-action {
  text-align: right;
}

.signup-btn {
  border-radius: 20px;
}

/* 响应式设计 - 统一优化版本 */
@media (min-width: 1024px) {
  .dashboard-container {
    padding: 24px 16px; /* 减少大屏幕上的左右边距 */
  }

  .welcome-header {
    padding: 28px;
  }

  .activities-section,
  .quick-nav-section {
    max-width: 1400px; /* 中屏幕适当扩展 */
  }

  .activity-cards {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .nav-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}

@media (min-width: 1200px) {
  .dashboard-container {
    padding: 24px 20px; /* 进一步减少左右边距 */
  }

  .welcome-header {
    padding: 32px;
    max-width: 1400px;
  }

  .activities-section,
  .quick-nav-section {
    max-width: 1600px;
  }

  .activity-cards {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  .nav-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (min-width: 1600px) {
  .dashboard-container {
    padding: 32px 24px; /* 超大屏幕也保持较小边距 */
  }

  .activities-section,
  .quick-nav-section {
    max-width: 1800px;
  }

  .activity-cards {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }

  .nav-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .welcome-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .tree-container {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .activity-cards {
    grid-template-columns: 1fr;
  }

  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .community-numbers {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
