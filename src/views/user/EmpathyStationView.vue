<template>
  <div class="empathy-station">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>🏠 同理心驿站</h1>
          <p>每日练习，在真实场景中培养同理心技能，深化非暴力沟通的理解和应用</p>
        </div>
        <div class="frequency-badge">
          <el-icon><Calendar /></el-icon>
          <span>每日开放</span>
        </div>
      </div>
    </div>

    <!-- 今日推荐练习 -->
    <div class="today-section">
      <h2>🌟 今日推荐</h2>
      <div class="station-card featured-card" v-if="todayPractice">
        <div class="practice-banner">
          <div class="practice-icon">
            <div class="icon">🏠</div>
            <div class="label">今日练习</div>
          </div>
          <div class="practice-info">
            <h3>{{ todayPractice.title }}</h3>
            <p>{{ todayPractice.description }}</p>
            <div class="practice-meta">
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDateTime(todayPractice.scheduledTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>{{ todayPractice.durationInMinutes }}分钟</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ todayPractice.registeredCount || 0 }}/{{ todayPractice.capacity }}人</span>
              </div>
            </div>
          </div>
        </div>
        <div class="practice-actions">
          <el-button
            type="primary"
            size="large"
            @click="registerActivity(todayPractice)"
            :loading="registering"
            :disabled="isRegistered(todayPractice)"
          >
            {{ isRegistered(todayPractice) ? '已报名' : '立即报名' }}
          </el-button>
          <el-button size="large" @click="viewDetails(todayPractice)"> 
            查看详情 
          </el-button>
        </div>
      </div>
    </div>

    <!-- 练习场景介绍 -->
    <div class="scenarios-section">
      <h2>📝 练习场景</h2>
      <div class="scenarios-grid">
        <div class="scenario-card" v-for="scenario in practiceScenarios" :key="scenario.id">
          <div class="scenario-icon">{{ scenario.icon }}</div>
          <h4>{{ scenario.title }}</h4>
          <p>{{ scenario.description }}</p>
          <div class="scenario-level">
            <el-tag :type="getLevelType(scenario.difficulty)">
              {{ scenario.difficulty }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 所有练习活动 -->
    <div class="all-practices-section">
      <h2>📅 所有练习</h2>
      <div class="practice-list">
        <div
          v-for="practice in allPractices"
          :key="practice.activityId"
          class="station-card"
          :class="getPracticeStatusClass(practice.status)"
        >
          <div class="practice-header">
            <div class="practice-date-small">
              {{ formatDate(practice.scheduledTime) }}
            </div>
            <div class="practice-status">
              <el-tag :type="getStatusType(practice.status)">
                {{ getStatusText(practice.status) }}
              </el-tag>
            </div>
          </div>
          <div class="practice-content">
            <h4>{{ practice.title }}</h4>
            <p>{{ practice.description }}</p>
            <div class="practice-details">
              <span class="detail-item">
                <el-icon><Timer /></el-icon>
                {{ practice.durationInMinutes }}分钟
              </span>
              <span class="detail-item">
                <el-icon><Star /></el-icon>
                +{{ practice.xpReward }}XP
              </span>
              <span class="detail-item">
                <el-icon><UserFilled /></el-icon>
                {{ practice.hostBy }}
              </span>
            </div>
          </div>
          <div class="practice-action">
            <el-button
              v-if="practice.status === 'upcoming'"
              type="primary"
              @click="registerActivity(practice)"
              :loading="registering"
              :disabled="isRegistered(practice)"
            >
              {{ isRegistered(practice) ? '已报名' : '报名参加' }}
            </el-button>
            <el-button v-else-if="practice.status === 'completed'" @click="viewReview(practice)">
              查看回顾
            </el-button>
            <el-button v-else disabled>
              {{ getActionText(practice.status) }}
            </el-button>
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
import { activityApi } from '@/services/api'
import { Calendar, Clock, Location, User, Timer, Star, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Activity } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const registering = ref(false)
const allPractices = ref<Activity[]>([])

// 练习场景数据
const practiceScenarios = [
  {
    id: 'family',
    title: '家庭亲子沟通',
    description: '当孩子不听话时，如何用NVC方式沟通',
    difficulty: '初级',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'work',
    title: '职场同事冲突',
    description: '处理工作中的意见分歧和合作问题',
    difficulty: '中级',
    icon: '💼',
  },
  {
    id: 'partner',
    title: '伴侣关系经营',
    description: '在亲密关系中表达需求和处理冲突',
    difficulty: '中级',
    icon: '💑',
  },
  {
    id: 'friend',
    title: '朋友间的误解',
    description: '修复友谊中的裂痕，重建信任',
    difficulty: '初级',
    icon: '👥',
  },
]

// 计算属性
const todayPractice = computed(() => {
  return allPractices.value.find((practice) => practice.status === 'upcoming')
})

// 方法
const formatDate = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPracticeStatusClass = (status: string) => {
  return `practice-${status}`
}

const getStatusType = (status: string) => {
  const types = {
    upcoming: 'success',
    ongoing: 'warning',
    completed: 'info',
    cancelled: 'danger',
  }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消',
  }
  return texts[status as keyof typeof texts] || '未知'
}

const getActionText = (status: string) => {
  const texts = {
    ongoing: '正在进行',
    cancelled: '已取消',
  }
  return texts[status as keyof typeof texts] || '不可用'
}

const getLevelType = (difficulty: string) => {
  const types = {
    '初级': 'success',
    '中级': 'warning',
    '高级': 'danger',
  }
  return types[difficulty as keyof typeof types] || 'info'
}

const isRegistered = (activity: Activity) => {
  if (!authStore.user) return false
  return activity.participants?.some(p => p.userId === authStore.user?.userId) || false
}

const registerActivity = async (activity: Activity) => {
  if (!authStore.user) {
    ElMessage.warning('请先登录')
    return
  }
  
  registering.value = true
  try {
    const response = await activityApi.registerActivity(activity.activityId, authStore.user.userId)
    if (response.success) {
      ElMessage.success('报名成功！')
      // 重新加载数据
      await loadPractices()
    } else {
      ElMessage.error(response.message || '报名失败')
    }
  } catch (error) {
    ElMessage.error('报名失败，请重试')
  } finally {
    registering.value = false
  }
}

const viewDetails = (activity: Activity) => {
  router.push(`/activity/${activity.activityId}`)
}

const viewReview = (activity: Activity) => {
  ElMessage.info('活动回顾功能开发中')
}

const loadPractices = async () => {
  loading.value = true
  try {
    const response = await activityApi.getActivities()
    if (response.success) {
      allPractices.value = response.data?.filter((activity) => activity.type === 'EmpathyStation') || []
    }
  } catch (error) {
    console.error('加载练习活动失败:', error)
    ElMessage.error('加载活动失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadPractices()
})
</script>

<style scoped>
.empathy-station {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  margin: 0 0 8px 0;
  color: #2d7d32;
  font-size: 28px;
}

.title-section p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.frequency-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4caf50, #2d7d32);
  color: white;
  padding: 12px 16px;
  border-radius: 20px;
  font-weight: bold;
}

/* 今日推荐 */
.today-section {
  margin-bottom: 32px;
}

.today-section h2 {
  color: #2d7d32;
  margin-bottom: 16px;
}

.station-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.featured-card {
  border: 2px solid #4caf50;
}

.practice-banner {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.practice-icon {
  text-align: center;
  background: #4caf50;
  color: white;
  padding: 16px;
  border-radius: 12px;
  min-width: 80px;
}

.practice-icon .icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.practice-icon .label {
  font-size: 14px;
}

.practice-info {
  flex: 1;
}

.practice-info h3 {
  margin: 0 0 8px 0;
  color: #2d7d32;
  font-size: 20px;
}

.practice-info p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.5;
}

.practice-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.practice-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 练习场景 */
.scenarios-section {
  margin-bottom: 32px;
}

.scenarios-section h2 {
  color: #2d7d32;
  margin-bottom: 16px;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.scenario-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.scenario-card:hover {
  transform: translateY(-2px);
}

.scenario-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.scenario-card h4 {
  margin: 0 0 8px 0;
  color: #2d7d32;
  font-size: 16px;
}

.scenario-card p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.scenario-level {
  margin-top: 12px;
}

/* 所有练习列表 */
.all-practices-section {
  max-width: 1400px;
  margin: 0 auto;
}

.all-practices-section h2 {
  color: #2d7d32;
  margin-bottom: 16px;
}

.practice-list {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.practice-date-small {
  color: #666;
  font-size: 14px;
}

.practice-content h4 {
  margin: 0 0 8px 0;
  color: #2d7d32;
  font-size: 16px;
}

.practice-content p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.practice-details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.practice-action {
  margin-top: 16px;
  text-align: right;
}

/* 状态样式 */
.practice-upcoming {
  border-left: 4px solid #4caf50;
}

.practice-ongoing {
  border-left: 4px solid #ff9800;
}

.practice-completed {
  border-left: 4px solid #9e9e9e;
  opacity: 0.8;
}

.practice-cancelled {
  border-left: 4px solid #f44336;
  opacity: 0.6;
}

/* 响应式 */
@media (min-width: 1024px) {
  .empathy-station {
    padding: 24px 48px;
  }

  .page-header {
    padding: 32px;
  }

  .station-card {
    padding: 32px;
  }

  .practice-banner {
    gap: 32px;
  }

  .practice-list {
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }

  .scenarios-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-width: 1200px) {
  .empathy-station {
    padding: 32px 64px;
  }

  .practice-list {
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  }
}

@media (max-width: 768px) {
  .empathy-station {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .practice-banner {
    flex-direction: column;
    align-items: center;
  }

  .practice-meta {
    flex-direction: column;
    gap: 8px;
  }

  .practice-actions {
    flex-direction: column;
  }

  .practice-list {
    grid-template-columns: 1fr;
  }

  .scenarios-grid {
    grid-template-columns: 1fr;
  }
}
</style>
