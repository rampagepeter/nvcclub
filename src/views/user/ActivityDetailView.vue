<template>
  <div class="activity-detail-container">
    <!-- 返回按钮 -->
    <div class="header-actions">
      <el-button @click="goBack" circle>
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>活动详情</h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner type="growth" size="large" text="正在加载活动详情..." />
    </div>

    <!-- 活动详情 -->
    <div v-else-if="activity" class="activity-detail">
      <!-- 活动头部 -->
      <div class="activity-header">
        <div class="activity-banner" :class="getActivityClass(activity.type)">
          <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
          <div class="activity-title-section">
            <h1>{{ activity.title }}</h1>
            <p class="activity-subtitle">{{ activity.description }}</p>
          </div>
        </div>
      </div>

      <!-- 活动信息 -->
      <div class="activity-info">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">活动类型</div>
            <div class="info-value">{{ getActivityTypeName(activity.type) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">活动频率</div>
            <div class="info-value">{{ getFrequencyText(activity.frequency) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">活动时间</div>
            <div class="info-value">{{ formatDateTime(activity.scheduledTime) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">预计时长</div>
            <div class="info-value">{{ activity.duration || '60分钟' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">参与人数</div>
            <div class="info-value">{{ activity.participants?.length || 0 }}人</div>
          </div>
          <div class="info-item">
            <div class="info-label">报名状态</div>
            <div class="info-value">
              <el-tag :type="isRegistered ? 'success' : 'info'">
                {{ isRegistered ? '已报名' : '未报名' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 活动详细描述 -->
      <div class="activity-content">
        <h3>活动介绍</h3>
        <div class="content-text">
          {{ activity.content || getDefaultContent(activity.type) }}
        </div>
      </div>

      <!-- 参与者列表 -->
      <div v-if="activity.participants && activity.participants.length > 0" class="participants-section">
        <h3>参与者（{{ activity.participants.length }}人）</h3>
        <div class="participants-list">
          <div
            v-for="participant in activity.participants"
            :key="participant.userId"
            class="participant-item"
          >
            <el-avatar :size="32" :src="participant.userAvatar">
              {{ participant.userName?.[0] || 'U' }}
            </el-avatar>
            <span class="participant-name">{{ participant.userName }}</span>
          </div>
        </div>
      </div>

      <!-- 报名按钮 -->
      <div class="action-section">
        <el-button
          v-if="!isRegistered"
          type="primary"
          size="large"
          :loading="registering"
          @click="handleRegister"
          class="register-btn"
        >
          点击报名
        </el-button>
        <el-button
          v-else
          type="danger"
          size="large"
          :loading="unregistering"
          @click="handleUnregister"
          class="unregister-btn"
        >
          取消报名
        </el-button>
      </div>
    </div>

    <!-- 活动不存在 -->
    <div v-else class="not-found">
      <el-empty description="活动不存在">
        <el-button type="primary" @click="goBack">返回</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { activityApi } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Activity, ActivityParticipant } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const registering = ref(false)
const unregistering = ref(false)
const activity = ref<Activity | null>(null)

// 计算属性
const isRegistered = computed(() => {
  if (!activity.value || !authStore.user) return false
  return activity.value.participants?.some((p: ActivityParticipant) => p.userId === authStore.user?.userId) || false
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

const getActivityTypeName = (type: string) => {
  const names = {
    EmpathyStation: '同理心驿站',
    ThemeSalon: '主题沙龙',
    LifeGrowth: '刘轶说生命成长',
  }
  return names[type as keyof typeof names] || '未知类型'
}

const getActivityClass = (type: string) => {
  const classes = {
    EmpathyStation: 'empathy-station',
    ThemeSalon: 'theme-salon',
    LifeGrowth: 'life-growth',
  }
  return classes[type as keyof typeof classes] || ''
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

const formatDateTime = (dateString: string | Date | undefined) => {
  if (!dateString) return '-'
  
  let date: Date
  if (typeof dateString === 'string') {
    date = new Date(dateString)
  } else {
    date = dateString
  }
  
  if (isNaN(date.getTime())) return '-'
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getDefaultContent = (type: string) => {
  const contents = {
    EmpathyStation: '同理心驿站是日常练习NVC技能的地方。在这里，您将通过各种真实场景的练习，提升观察、感受、需要和请求的能力，深化对非暴力沟通的理解和应用。',
    ThemeSalon: '主题沙龙是每月一次的深度学习活动。我们会围绕特定的NVC主题进行深入探讨，分享实践经验，共同成长。',
    LifeGrowth: '刘轶说生命成长是季度分享活动，由NVC中文网创始人刘轶老师分享生命成长的深度洞察和实践智慧。'
  }
  return contents[type as keyof typeof contents] || '暂无详细介绍'
}

const loadActivityDetail = async () => {
  const activityId = route.params.id as string
  if (!activityId) {
    ElMessage.error('活动ID无效')
    goBack()
    return
  }

  loading.value = true
  try {
    const response = await activityApi.getActivityById(activityId)
    
    if (response.success && response.data) {
      activity.value = { ...response.data }
    } else {
      ElMessage.error('活动不存在')
      goBack()
    }
  } catch (error) {
    console.error('加载活动详情失败:', error)
    ElMessage.error('加载活动详情失败')
    goBack()
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!activity.value || !authStore.user) return

  try {
    await ElMessageBox.confirm(
      `确定要报名参加"${activity.value.title}"吗？`,
      '报名确认',
      {
        confirmButtonText: '确定报名',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    registering.value = true
    console.log('🔍 Before registration - isRegistered:', isRegistered.value)
    
    const response = await activityApi.registerActivity(activity.value.activityId, authStore.user.userId)
    
    if (response.success) {
      ElMessage.success('报名成功！')
      // 重新加载活动详情
      await loadActivityDetail()
      // 确保 Vue 响应式系统更新
      await nextTick()
      
      console.log('🔍 After registration - isRegistered:', isRegistered.value)
      console.log('🔍 Current participants:', activity.value?.participants?.map((p: ActivityParticipant) => ({ userId: p.userId, userName: p.userName })))
    } else {
      ElMessage.error(response.message || '报名失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报名失败:', error)
      ElMessage.error('报名失败，请重试')
    }
  } finally {
    registering.value = false
  }
}

const handleUnregister = async () => {
  if (!activity.value || !authStore.user) return

  try {
    await ElMessageBox.confirm(
      `确定要取消报名"${activity.value.title}"吗？`,
      '取消报名确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning',
      }
    )

    unregistering.value = true
    const response = await activityApi.unregisterActivity(activity.value.activityId, authStore.user.userId)
    
    if (response.success) {
      ElMessage.success('已取消报名')
      // 重新加载活动详情
      await loadActivityDetail()
      // 确保 Vue 响应式系统更新
      await nextTick()
    } else {
      ElMessage.error(response.message || '取消报名失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消报名失败:', error)
      ElMessage.error('取消报名失败，请重试')
    }
  } finally {
    unregistering.value = false
  }
}

const goBack = () => {
  router.back()
}

// 生命周期
onMounted(() => {
  loadActivityDetail()
})
</script>

<style scoped>
.activity-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }
}

.loading-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-detail {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-header {
  .activity-banner {
    padding: 40px;
    background: linear-gradient(135deg, #e8f5e8, #f0f9f0);
    display: flex;
    align-items: center;
    gap: 24px;
    
    &.empathy-station {
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
    }
    
    &.theme-salon {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    }
    
    &.life-growth {
      background: linear-gradient(135deg, #fce4ec, #f8bbd9);
    }
    
    .activity-icon {
      font-size: 48px;
      background: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .activity-title-section {
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        color: #333;
      }
      
      .activity-subtitle {
        margin: 0;
        font-size: 16px;
        color: #666;
        line-height: 1.5;
      }
    }
  }
}

.activity-info {
  padding: 32px 40px;
  border-bottom: 1px solid #eee;
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    
    .info-item {
      .info-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }
      
      .info-value {
        font-size: 16px;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.activity-content {
  padding: 32px 40px;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 20px;
  }
  
  .content-text {
    color: #666;
    line-height: 1.6;
    font-size: 16px;
  }
}

.participants-section {
  padding: 32px 40px;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 20px;
  }
  
  .participants-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    
    .participant-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 20px;
      
      .participant-name {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.action-section {
  padding: 32px 40px;
  text-align: center;
  
  .register-btn,
  .unregister-btn {
    width: 200px;
    height: 48px;
    font-size: 16px;
    border-radius: 24px;
  }
  
  .register-btn {
    background: linear-gradient(135deg, #4caf50, #45a049);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #45a049, #388e3c);
    }
  }
}

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-detail-container {
    padding: 16px;
  }
  
  .activity-header .activity-banner {
    padding: 24px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
    
    .activity-icon {
      font-size: 40px;
      width: 64px;
      height: 64px;
    }
    
    .activity-title-section h1 {
      font-size: 24px;
    }
  }
  
  .activity-info,
  .activity-content,
  .participants-section,
  .action-section {
    padding: 24px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style> 