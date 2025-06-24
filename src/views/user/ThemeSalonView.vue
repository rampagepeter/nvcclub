<template>
  <div class="theme-salon">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>💬 主题沙龙</h1>
          <p>每月一次的深度主题探讨，在安全的空间中分享和成长</p>
        </div>
        <div class="frequency-badge">
          <el-icon><Calendar /></el-icon>
          <span>每月一次</span>
        </div>
      </div>
    </div>

    <!-- 即将到来的沙龙 -->
    <div class="upcoming-section">
      <h2>🔥 即将到来</h2>
      <div class="salon-card upcoming-card" v-if="upcomingSalon">
        <div class="salon-banner">
          <div class="salon-date">
            <div class="month">{{ formatMonth(upcomingSalon.scheduledTime) }}</div>
            <div class="day">{{ formatDay(upcomingSalon.scheduledTime) }}</div>
          </div>
          <div class="salon-info">
            <h3>{{ upcomingSalon.title }}</h3>
            <p>{{ upcomingSalon.description }}</p>
            <div class="salon-meta">
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDateTime(upcomingSalon.scheduledTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ upcomingSalon.location }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ upcomingSalon.registeredCount }}/{{ upcomingSalon.capacity }}人</span>
              </div>
            </div>
          </div>
        </div>
        <div class="salon-actions">
          <el-button
            type="primary"
            size="large"
            @click="registerActivity(upcomingSalon)"
            :loading="registering"
          >
            立即报名
          </el-button>
          <el-button size="large" @click="viewDetails(upcomingSalon)"> 查看详情 </el-button>
        </div>
      </div>
    </div>

    <!-- 所有沙龙活动 -->
    <div class="all-salons-section">
      <h2>📅 所有活动</h2>
      <div class="salon-list">
        <div
          v-for="salon in allSalons"
          :key="salon.activityId"
          class="salon-card"
          :class="getSalonStatusClass(salon.status)"
        >
          <div class="salon-header">
            <div class="salon-date-small">
              {{ formatDate(salon.scheduledTime) }}
            </div>
            <div class="salon-status">
              <el-tag :type="getStatusType(salon.status)">
                {{ getStatusText(salon.status) }}
              </el-tag>
            </div>
          </div>
          <div class="salon-content">
            <h4>{{ salon.title }}</h4>
            <p>{{ salon.description }}</p>
            <div class="salon-details">
              <span class="detail-item">
                <el-icon><Timer /></el-icon>
                {{ salon.durationInMinutes }}分钟
              </span>
              <span class="detail-item">
                <el-icon><Star /></el-icon>
                +{{ salon.xpReward }}XP
              </span>
              <span class="detail-item">
                <el-icon><UserFilled /></el-icon>
                {{ salon.hostBy }}
              </span>
            </div>
          </div>
          <div class="salon-action">
            <el-button
              v-if="salon.status === 'upcoming'"
              type="primary"
              @click="registerActivity(salon)"
              :loading="registering"
            >
              报名参加
            </el-button>
            <el-button v-else-if="salon.status === 'completed'" @click="viewReview(salon)">
              查看回顾
            </el-button>
            <el-button v-else disabled>
              {{ getActionText(salon.status) }}
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
const userStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const registering = ref(false)
const allSalons = ref<Activity[]>([])

// 计算属性
const upcomingSalon = computed(() => {
  return allSalons.value.find((salon) => salon.status === 'upcoming')
})

// 方法
const formatMonth = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', { month: 'short' })
}

const formatDay = (date?: Date) => {
  if (!date) return ''
  return new Date(date).getDate().toString()
}

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

const getSalonStatusClass = (status: string) => {
  return `salon-${status}`
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

const registerActivity = async (activity: Activity) => {
  registering.value = true
  try {
    // 这里应该调用报名API
    ElMessage.success('报名成功！我们会及时通知您活动详情')
  } catch (error) {
    ElMessage.error('报名失败，请重试')
  } finally {
    registering.value = false
  }
}

const viewDetails = (activity: Activity) => {
  ElMessage.info('活动详情功能开发中')
}

const viewReview = (activity: Activity) => {
  ElMessage.info('活动回顾功能开发中')
}

const loadSalons = async () => {
  loading.value = true
  try {
    const response = await activityApi.getActivities()
    if (response.success) {
      allSalons.value = response.data?.filter((activity) => activity.type === 'ThemeSalon') || []
    }
  } catch (error) {
    console.error('加载沙龙活动失败:', error)
    ElMessage.error('加载活动失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadSalons()
})
</script>

<style scoped>
.theme-salon {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  color: #1976d2;
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
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  padding: 12px 16px;
  border-radius: 20px;
  font-weight: bold;
}

/* 即将到来的沙龙 */
.upcoming-section {
  margin-bottom: 32px;
}

.upcoming-section h2 {
  color: #1976d2;
  margin-bottom: 16px;
}

.salon-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.upcoming-card {
  border: 2px solid #2196f3;
}

.salon-banner {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.salon-date {
  text-align: center;
  background: #2196f3;
  color: white;
  padding: 16px;
  border-radius: 12px;
  min-width: 80px;
}

.month {
  font-size: 14px;
  margin-bottom: 4px;
}

.day {
  font-size: 24px;
  font-weight: bold;
}

.salon-info {
  flex: 1;
}

.salon-info h3 {
  margin: 0 0 8px 0;
  color: #1976d2;
  font-size: 20px;
}

.salon-info p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.5;
}

.salon-meta {
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

.salon-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 所有沙龙列表 */
.all-salons-section {
  max-width: 1400px;
  margin: 0 auto;
}

.all-salons-section h2 {
  color: #1976d2;
  margin-bottom: 16px;
}

.salon-list {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.salon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.salon-date-small {
  color: #666;
  font-size: 14px;
}

.salon-content h4 {
  margin: 0 0 8px 0;
  color: #1976d2;
  font-size: 16px;
}

.salon-content p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.salon-details {
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

.salon-action {
  margin-top: 16px;
  text-align: right;
}

/* 状态样式 */
.salon-upcoming {
  border-left: 4px solid #4caf50;
}

.salon-ongoing {
  border-left: 4px solid #ff9800;
}

.salon-completed {
  border-left: 4px solid #9e9e9e;
  opacity: 0.8;
}

.salon-cancelled {
  border-left: 4px solid #f44336;
  opacity: 0.6;
}

/* 响应式 */
@media (min-width: 1024px) {
  .theme-salon {
    padding: 24px 48px;
  }

  .page-header {
    padding: 32px;
  }

  .salon-card {
    padding: 32px;
  }

  .salon-banner {
    gap: 32px;
  }

  .salon-list {
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }
}

@media (min-width: 1200px) {
  .theme-salon {
    padding: 32px 64px;
  }

  .salon-list {
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  }
}

@media (max-width: 768px) {
  .theme-salon {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .salon-banner {
    flex-direction: column;
    align-items: center;
  }

  .salon-meta {
    flex-direction: column;
    gap: 8px;
  }

  .salon-actions {
    flex-direction: column;
  }

  .salon-list {
    grid-template-columns: 1fr;
  }
}
</style>
