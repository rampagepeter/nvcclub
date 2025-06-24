<template>
  <div class="badge-collection">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>🏆 我的徽章收藏</h1>
      <p>记录每一次成长的足迹</p>
      <div class="collection-stats">
        <div class="stat-item">
          <span class="stat-number">{{ unlockedCount }}</span>
          <span class="stat-label">已获得</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalCount }}</span>
          <span class="stat-label">总数量</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completionRate }}%</span>
          <span class="stat-label">完成度</span>
        </div>
      </div>
    </div>

    <!-- 徽章分类筛选 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="技能类" name="Skill"></el-tab-pane>
          <el-tab-pane label="参与类" name="Participation"></el-tab-pane>
          <el-tab-pane label="贡献类" name="Contribution"></el-tab-pane>
          <el-tab-pane label="趣味类" name="Special"></el-tab-pane>
        </el-tabs>
      </div>

      <div class="filter-options">
        <el-button-group>
          <el-button :type="showUnlocked ? 'primary' : ''" @click="showUnlocked = !showUnlocked">
            <el-icon><Trophy /></el-icon>
            已获得
          </el-button>
          <el-button :type="showLocked ? 'primary' : ''" @click="showLocked = !showLocked">
            <el-icon><Lock /></el-icon>
            未获得
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 徽章网格 -->
    <div class="badges-grid">
      <BadgeComponent
        v-for="badgeData in filteredBadges"
        :key="badgeData.badge.badgeId"
        :badge="badgeData.badge"
        :is-unlocked="badgeData.isUnlocked"
        :unlocked-at="badgeData.unlockedAt"
        :current-progress="badgeData.currentProgress"
        :show-progress="true"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredBadges.length === 0" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3>暂无徽章</h3>
      <p>继续努力，获得更多成就徽章吧！</p>
    </div>

    <!-- 成就获得动画弹窗 -->
    <el-dialog
      v-model="achievementVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px"
      center
      class="achievement-dialog"
    >
      <div class="achievement-content">
        <div class="achievement-animation">
          <div class="sparkle">✨</div>
          <div class="badge-celebration">
            <span class="celebration-icon">🎉</span>
          </div>
          <div class="sparkle">✨</div>
        </div>
        <h2>恭喜获得新徽章！</h2>
        <div class="new-badge" v-if="newAchievement">
          <div class="achievement-icon">
            {{ getBadgeIcon(newAchievement.name) }}
          </div>
          <h3>{{ newAchievement.name }}</h3>
          <p>{{ newAchievement.description }}</p>
        </div>
        <el-button type="primary" size="large" @click="closeAchievement"> 太棒了！ </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { badgeApi } from '@/services/api'
import BadgeComponent from '@/components/BadgeComponent.vue'
import { Trophy, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { mockBadges } from '@/services/mockData'
import type { Badge } from '@/types'

interface BadgeData {
  badge: Badge
  isUnlocked: boolean
  unlockedAt?: Date
  currentProgress: number
}

const userStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const activeTab = ref('all')
const showUnlocked = ref(true)
const showLocked = ref(true)
const allBadgeData = ref<BadgeData[]>([])
const achievementVisible = ref(false)
const newAchievement = ref<Badge | null>(null)

// 计算属性
const filteredBadges = computed(() => {
  let filtered = allBadgeData.value

  // 按类型筛选
  if (activeTab.value !== 'all') {
    filtered = filtered.filter((item) => item.badge.type === activeTab.value)
  }

  // 按解锁状态筛选
  filtered = filtered.filter((item) => {
    if (item.isUnlocked && !showUnlocked.value) return false
    if (!item.isUnlocked && !showLocked.value) return false
    return true
  })

  // 按解锁状态和进度排序
  return filtered.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1
    if (!a.isUnlocked && b.isUnlocked) return 1
    if (!a.isUnlocked && !b.isUnlocked) {
      return b.currentProgress - a.currentProgress // 未解锁的按进度倒序
    }
    return 0
  })
})

const unlockedCount = computed(() => {
  return allBadgeData.value.filter((item) => item.isUnlocked).length
})

const totalCount = computed(() => {
  return allBadgeData.value.length
})

const completionRate = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((unlockedCount.value / totalCount.value) * 100)
})

// 方法
const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name
}

const getBadgeIcon = (badgeName: string) => {
  const iconMap: Record<string, string> = {
    聆听之耳: '👂',
    感受色彩家: '🎨',
    同理心大师: '💝',
    驿站常客: '🏠',
    沙龙探索家: '🗣️',
    社群活跃者: '⚡',
    笔记分享家: '📝',
    同理心伙伴: '🤝',
    智慧导师: '🧙‍♂️',
    "'啊哈！'时刻捕获者": '💡',
    百日筑基: '📅',
    夜猫子学习者: '🦉',
    每日行者: '⚡',
    社群助手: '🤝',
  }
  return iconMap[badgeName] || '🏆'
}

const closeAchievement = () => {
  achievementVisible.value = false
  newAchievement.value = null
}

const mockUserProgress = () => {
  // 模拟用户进度数据
  return {
    station_count: 12, // 完成了12次驿站练习
    salon_count: 2, // 参加了2次沙龙
    streak_days: 7, // 连续学习7天
    post_count: 8, // 发布了8条动态
    growth_sessions: 0, // 参加了0次生命成长活动
  }
}

const loadBadgeData = async () => {
  loading.value = true
  try {
    // 模拟从API获取徽章数据
    const userProgress = mockUserProgress()
    const userBadges = userStore.user?.badges || []

    // 构建徽章数据
    allBadgeData.value = mockBadges.map((badge) => {
      const isUnlocked = userBadges.includes(badge.badgeId)
      const currentProgress =
        userProgress[badge.unlockCriteria.metric as keyof typeof userProgress] || 0

      return {
        badge,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date() : undefined,
        currentProgress,
      }
    })

    // 检查是否有新徽章可以解锁
    checkNewAchievements(userProgress)
  } catch (error) {
    console.error('加载徽章数据失败:', error)
    ElMessage.error('加载徽章数据失败')
  } finally {
    loading.value = false
  }
}

const checkNewAchievements = (userProgress: any) => {
  const userBadges = userStore.user?.badges || []

  for (const badge of mockBadges) {
    const isAlreadyUnlocked = userBadges.includes(badge.badgeId)
    const currentProgress =
      userProgress[badge.unlockCriteria.metric as keyof typeof userProgress] || 0

    // 如果还没解锁但已达到条件，显示获得动画
    if (!isAlreadyUnlocked && currentProgress >= badge.unlockCriteria.threshold) {
      showNewAchievement(badge)
      break // 一次只显示一个新徽章
    }
  }
}

const showNewAchievement = (badge: Badge) => {
  newAchievement.value = badge
  achievementVisible.value = true

  // 更新用户徽章列表
  if (userStore.user) {
    userStore.user.badges.push(badge.badgeId)
  }
}

// 生命周期
onMounted(() => {
  loadBadgeData()
})
</script>

<style scoped>
.badge-collection {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 28px;
}

.page-header p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 16px;
}

.collection-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 筛选区域 */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tabs {
  flex: 1;
}

.filter-options {
  flex-shrink: 0;
}

/* 徽章网格 */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #666;
}

/* 成就获得动画 */
.achievement-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.achievement-content {
  text-align: center;
  padding: 20px;
}

.achievement-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  animation: celebration 2s ease-in-out infinite;
}

.sparkle {
  font-size: 24px;
  animation: sparkle 1.5s ease-in-out infinite alternate;
}

.badge-celebration {
  position: relative;
}

.celebration-icon {
  font-size: 48px;
  animation: bounce 1s ease-in-out infinite;
}

.achievement-content h2 {
  margin: 0 0 24px 0;
  color: #2e7d32;
  font-size: 24px;
}

.new-badge {
  background: linear-gradient(135deg, #f1f8e9, #e8f5e8);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 3px solid #4caf50;
}

.achievement-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.new-badge h3 {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 20px;
}

.new-badge p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 动画效果 */
@keyframes celebration {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes sparkle {
  0% {
    transform: rotate(0deg) scale(1);
  }
  100% {
    transform: rotate(180deg) scale(1.2);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式 */
@media (min-width: 1024px) {
  .badge-collection {
    padding: 24px 32px;
  }

  .page-header {
    padding: 32px;
  }

  .badges-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .collection-stats {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .badge-collection {
    padding: 12px;
  }

  .page-header {
    padding: 24px;
  }

  .collection-stats {
    flex-direction: column;
    gap: 16px;
  }

  .filter-section {
    flex-direction: column;
    gap: 16px;
  }

  .badges-grid {
    grid-template-columns: 1fr;
  }

  .stat-number {
    font-size: 24px;
  }

  .page-header h1 {
    font-size: 24px;
  }
}
</style>
