<template>
  <div class="life-growth">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>🎤 刘轶说生命成长</h1>
          <p>跟随刘轶老师探索生命的深层智慧，每季度一次的心灵盛宴</p>
        </div>
        <div class="frequency-badge">
          <el-icon><Calendar /></el-icon>
          <span>每季度一次</span>
        </div>
      </div>
    </div>

    <!-- 导师介绍 -->
    <div class="teacher-intro">
      <div class="intro-card">
        <div class="teacher-avatar">
          <el-avatar :size="80" class="avatar-img">刘</el-avatar>
        </div>
        <div class="intro-content">
          <h3>关于刘轶老师</h3>
          <p>
            国际非暴力沟通中心认证培训师，生命教练，拥有20余年心理咨询和成长引导经验。致力于帮助人们发现内在智慧，实现生命的深度转化。
          </p>
          <div class="teacher-achievements">
            <span class="achievement">📚 著作《生命的四季》</span>
            <span class="achievement">🎯 20年+ 咨询经验</span>
            <span class="achievement">🌟 认证NVC培训师</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 即将到来的活动 -->
    <div class="upcoming-section" v-if="upcomingEvent">
      <h2>🔥 即将到来</h2>
      <div class="event-card featured-card">
        <div class="event-banner">
          <div class="event-date">
            <div class="season">{{ getSeason(upcomingEvent.scheduledTime) }}</div>
            <div class="month-day">{{ formatMonthDay(upcomingEvent.scheduledTime) }}</div>
          </div>
          <div class="event-info">
            <h3>{{ upcomingEvent.title }}</h3>
            <p>{{ upcomingEvent.description }}</p>
            <div class="event-meta">
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDateTime(upcomingEvent.scheduledTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ upcomingEvent.location }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>{{ upcomingEvent.durationInMinutes }}分钟</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ upcomingEvent.registeredCount }}/{{ upcomingEvent.capacity }}人</span>
              </div>
            </div>
          </div>
        </div>
        <div class="event-highlights">
          <h4>本次分享亮点</h4>
          <ul>
            <li>深度探索生命转化的内在机制</li>
            <li>分享真实的生命故事和感悟</li>
            <li>现场答疑和个性化指导</li>
            <li>与同路人建立深度连接</li>
          </ul>
        </div>
        <div class="event-actions">
          <el-button
            type="primary"
            size="large"
            @click="registerEvent(upcomingEvent)"
            :loading="registering"
            class="register-btn"
          >
            立即报名参加
          </el-button>
          <el-button size="large" @click="shareEvent(upcomingEvent)"> 分享给朋友 </el-button>
        </div>
      </div>
    </div>

    <!-- 所有活动历史 -->
    <div class="all-events-section">
      <h2>📅 往期与未来</h2>
      <div class="events-timeline">
        <div
          v-for="event in allEvents"
          :key="event.activityId"
          class="timeline-item"
          :class="getEventClass(event.status)"
        >
          <div class="timeline-marker">
            <div class="marker-dot" :class="getMarkerClass(event.status)"></div>
          </div>
          <div class="timeline-content">
            <div class="event-card mini-card">
              <div class="event-header">
                <div class="event-date-small">
                  {{ formatQuarterDate(event.scheduledTime) }}
                </div>
                <div class="event-status">
                  <el-tag :type="getStatusType(event.status)" size="small">
                    {{ getStatusText(event.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="event-content">
                <h4>{{ event.title }}</h4>
                <p>{{ event.description }}</p>
                <div class="event-stats">
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    +{{ event.xpReward }}XP
                  </span>
                  <span class="stat-item">
                    <el-icon><UserFilled /></el-icon>
                    {{ event.hostBy }}
                  </span>
                </div>
              </div>
              <div class="event-action">
                <el-button
                  v-if="event.status === 'upcoming'"
                  type="primary"
                  @click="registerEvent(event)"
                  :loading="registering"
                >
                  我要参加
                </el-button>
                <el-button v-else-if="event.status === 'completed'" @click="viewRecording(event)">
                  观看回放
                </el-button>
                <el-button v-else disabled>
                  {{ getActionText(event.status) }}
                </el-button>
              </div>
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
import { activityApi } from '@/services/api'
import { Calendar, Clock, Location, Timer, User, Star, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Activity } from '@/types'

const router = useRouter()
const userStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const registering = ref(false)
const allEvents = ref<Activity[]>([])

// 计算属性
const upcomingEvent = computed(() => {
  return allEvents.value.find((event) => event.status === 'upcoming')
})

// 方法
const getSeason = (date?: Date) => {
  if (!date) return ''
  const month = new Date(date).getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

const formatMonthDay = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatQuarterDate = (date?: Date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const quarter = Math.ceil(month / 3)
  return `${year}年 Q${quarter}`
}

const getEventClass = (status: string) => {
  return `event-${status}`
}

const getMarkerClass = (status: string) => {
  return `marker-${status}`
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

const registerEvent = async (event: Activity) => {
  registering.value = true
  try {
    // 这里应该调用报名API
    ElMessage.success('报名成功！我们会在活动前通过短信和邮件通知您具体安排')
  } catch (error) {
    ElMessage.error('报名失败，请重试')
  } finally {
    registering.value = false
  }
}

const shareEvent = (event: Activity) => {
  ElMessage.info('分享功能开发中')
}

const viewRecording = (event: Activity) => {
  ElMessage.info('回放功能开发中')
}

const loadEvents = async () => {
  loading.value = true
  try {
    const response = await activityApi.getActivities()
    if (response.success) {
      allEvents.value = response.data?.filter((activity) => activity.type === 'LifeGrowth') || []
      // 按时间排序
      allEvents.value.sort((a, b) => {
        const dateA = new Date(a.scheduledTime || 0).getTime()
        const dateB = new Date(b.scheduledTime || 0).getTime()
        return dateB - dateA // 最新的在前
      })
    }
  } catch (error) {
    console.error('加载生命成长活动失败:', error)
    ElMessage.error('加载活动失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.life-growth {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
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
  color: #f57c00;
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
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 12px 16px;
  border-radius: 20px;
  font-weight: bold;
}

/* 导师介绍 */
.teacher-intro {
  margin-bottom: 32px;
}

.intro-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 24px;
  align-items: center;
}

.teacher-avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 20px;
}

.teacher-avatar .avatar-img {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  font-weight: bold;
  font-size: 32px;
}

.intro-content h3 {
  margin: 0 0 12px 0;
  color: #f57c00;
  font-size: 20px;
}

.intro-content p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.6;
}

.teacher-achievements {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.achievement {
  background: #fff3e0;
  color: #f57c00;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
}

/* 即将到来的活动 */
.upcoming-section {
  margin-bottom: 32px;
}

.upcoming-section h2 {
  color: #f57c00;
  margin-bottom: 16px;
}

.event-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.featured-card {
  border: 2px solid #ff9800;
}

.event-banner {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.event-date {
  text-align: center;
  background: #ff9800;
  color: white;
  padding: 16px;
  border-radius: 12px;
  min-width: 100px;
}

.season {
  font-size: 14px;
  margin-bottom: 4px;
}

.month-day {
  font-size: 18px;
  font-weight: bold;
}

.event-info {
  flex: 1;
}

.event-info h3 {
  margin: 0 0 8px 0;
  color: #f57c00;
  font-size: 20px;
}

.event-info p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.5;
}

.event-meta {
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

.event-highlights {
  background: #fff8e1;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.event-highlights h4 {
  margin: 0 0 12px 0;
  color: #f57c00;
}

.event-highlights ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.event-highlights li {
  margin-bottom: 4px;
}

.event-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.register-btn {
  background: linear-gradient(135deg, #ff9800, #f57c00) !important;
  border: none !important;
}

/* 时间线 */
.all-events-section h2 {
  color: #f57c00;
  margin-bottom: 24px;
}

.events-timeline {
  position: relative;
  padding-left: 30px;
}

.events-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ffcc02;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-marker {
  position: absolute;
  left: -30px;
  top: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #ffcc02;
}

.marker-upcoming {
  background: #4caf50;
}

.marker-completed {
  background: #9e9e9e;
}

.marker-cancelled {
  background: #f44336;
}

.timeline-content {
  margin-left: 20px;
}

.mini-card {
  margin-bottom: 0;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-date-small {
  color: #f57c00;
  font-weight: bold;
  font-size: 14px;
}

.event-content h4 {
  margin: 0 0 8px 0;
  color: #f57c00;
  font-size: 16px;
}

.event-content p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.event-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.event-action {
  margin-top: 16px;
  text-align: right;
}

/* 响应式 */
@media (min-width: 1024px) {
  .life-growth {
    padding: 24px 32px;
  }

  .page-header {
    padding: 32px;
  }

  .intro-card {
    padding: 32px;
  }

  .event-card {
    padding: 32px;
  }
}

@media (max-width: 768px) {
  .life-growth {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .intro-card {
    flex-direction: column;
    text-align: center;
  }

  .event-banner {
    flex-direction: column;
    align-items: center;
  }

  .event-meta {
    flex-direction: column;
    gap: 8px;
  }

  .event-actions {
    flex-direction: column;
  }

  .teacher-achievements {
    justify-content: center;
  }

  .events-timeline {
    padding-left: 20px;
  }

  .timeline-content {
    margin-left: 10px;
  }
}
</style>
