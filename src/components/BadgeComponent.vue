<template>
  <div class="badge-component" :class="badgeClass">
    <div class="badge-container" @click="showDetails">
      <!-- 徽章图标 -->
      <div class="badge-icon" :class="{ locked: !isUnlocked }">
        <div class="icon-wrapper">
          <span class="icon-emoji">{{ badgeIcon }}</span>
          <div v-if="!isUnlocked" class="lock-overlay">
            <el-icon><Lock /></el-icon>
          </div>
        </div>
      </div>

      <!-- 徽章信息 -->
      <div class="badge-info">
        <h4 class="badge-name" :class="{ dimmed: !isUnlocked }">
          {{ badge.name }}
        </h4>
        <p class="badge-description" :class="{ dimmed: !isUnlocked }">
          {{ badge.description }}
        </p>

        <!-- 进度条（未解锁时显示） -->
        <div v-if="!isUnlocked && showProgress" class="badge-progress">
          <el-progress
            :percentage="progressPercentage"
            :show-text="false"
            :stroke-width="6"
            :color="progressColor"
          />
          <div class="progress-text">
            {{ currentProgress }}/{{ badge.unlockCriteria.threshold }}
          </div>
        </div>

        <!-- 解锁时间（已解锁时显示） -->
        <div v-if="isUnlocked && unlockedAt" class="unlock-time">
          <el-icon><Check /></el-icon>
          <span>{{ formatUnlockTime(unlockedAt) }}</span>
        </div>
      </div>

      <!-- 稀有度标识 -->
      <div class="rarity-indicator" :class="rarityClass">
        {{ rarityText }}
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="badge.name" width="400px" center>
      <div class="badge-detail">
        <div class="detail-icon">
          <span class="large-icon">{{ badgeIcon }}</span>
        </div>
        <div class="detail-content">
          <h3>{{ badge.name }}</h3>
          <p class="detail-description">{{ badge.description }}</p>

          <div class="detail-criteria">
            <h4>解锁条件</h4>
            <p>{{ getCriteriaText() }}</p>
          </div>

          <div v-if="isUnlocked" class="detail-achievement">
            <h4>获得时间</h4>
            <p>{{ formatUnlockTime(unlockedAt) }}</p>
          </div>

          <div v-else class="detail-progress">
            <h4>当前进度</h4>
            <el-progress :percentage="progressPercentage" :color="progressColor" />
            <p>{{ currentProgress }}/{{ badge.unlockCriteria.threshold }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lock, Check } from '@element-plus/icons-vue'
import type { Badge } from '@/types'

interface Props {
  badge: Badge
  isUnlocked?: boolean
  unlockedAt?: Date
  currentProgress?: number
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUnlocked: false,
  unlockedAt: undefined,
  currentProgress: 0,
  showProgress: true,
})

// 响应式数据
const detailVisible = ref(false)

// 计算属性
const badgeClass = computed(() => {
  const classes = ['badge-item']
  if (props.isUnlocked) classes.push('unlocked')
  if (props.badge.type) classes.push(`type-${props.badge.type.toLowerCase()}`)
  return classes.join(' ')
})

const badgeIcon = computed(() => {
  // 根据徽章类型和名称返回对应的emoji
  const iconMap: Record<string, string> = {
    // 技能类徽章
    聆听之耳: '👂',
    感受色彩家: '🎨',
    同理心大师: '💝',

    // 参与类徽章
    驿站常客: '🏠',
    沙龙探索家: '🗣️',
    社群活跃者: '⚡',

    // 贡献类徽章
    笔记分享家: '📝',
    同理心伙伴: '🤝',
    智慧导师: '🧙‍♂️',

    // 趣味类徽章
    "'啊哈！'时刻捕获者": '💡',
    百日筑基: '📅',
    夜猫子学习者: '🦉',

    // 默认图标
    empathy_master: '💝',
    daily_warrior: '⚡',
    community_helper: '🤝',
  }

  return iconMap[props.badge.name] || iconMap[props.badge.badgeId] || '🏆'
})

const progressPercentage = computed(() => {
  if (props.isUnlocked) return 100
  const threshold = props.badge.unlockCriteria.threshold
  return Math.min(Math.round((props.currentProgress / threshold) * 100), 100)
})

const progressColor = computed(() => {
  const colors: Record<string, string> = {
    Skill: '#4caf50',
    Participation: '#2196f3',
    Contribution: '#ff9800',
    Special: '#9c27b0',
  }
  return colors[props.badge.type] || '#666'
})

const rarityClass = computed(() => {
  // 根据解锁条件的难度判断稀有度
  const threshold = props.badge.unlockCriteria.threshold
  if (threshold >= 100) return 'legendary'
  if (threshold >= 50) return 'epic'
  if (threshold >= 20) return 'rare'
  return 'common'
})

const rarityText = computed(() => {
  const rarityMap = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return rarityMap[rarityClass.value as keyof typeof rarityMap] || '普通'
})

// 方法
const showDetails = () => {
  detailVisible.value = true
}

const formatUnlockTime = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getCriteriaText = () => {
  const metric = props.badge.unlockCriteria.metric
  const threshold = props.badge.unlockCriteria.threshold

  const metricTexts: Record<string, string> = {
    station_count: `完成${threshold}次同理心驿站练习`,
    salon_count: `参加${threshold}次主题沙龙`,
    streak_days: `连续学习${threshold}天`,
    post_count: `发布${threshold}条动态或帮助他人`,
    growth_sessions: `参加${threshold}次生命成长活动`,
  }

  return metricTexts[metric] || `达到${threshold}个成就点`
}
</script>

<style scoped>
.badge-component {
  margin: 8px;
}

.badge-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.badge-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 徽章类型样式 */
.type-skill .badge-container {
  border-color: #4caf50;
}

.type-participation .badge-container {
  border-color: #2196f3;
}

.type-contribution .badge-container {
  border-color: #ff9800;
}

.type-special .badge-container {
  border-color: #9c27b0;
}

/* 解锁状态 */
.unlocked .badge-container {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.unlocked .badge-icon {
  transform: scale(1.05);
}

/* 徽章图标 */
.badge-icon {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  transition: all 0.3s ease;
}

.icon-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f8e9, #e8f5e8);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid #4caf50;
}

.icon-emoji {
  font-size: 28px;
  transition: all 0.3s ease;
}

.badge-icon.locked .icon-wrapper {
  background: #f5f5f5;
  border-color: #ddd;
}

.badge-icon.locked .icon-emoji {
  opacity: 0.3;
  filter: grayscale(100%);
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

/* 徽章信息 */
.badge-info {
  text-align: center;
}

.badge-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
}

.badge-description {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.dimmed {
  opacity: 0.5;
}

/* 进度条 */
.badge-progress {
  margin-top: 8px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* 解锁时间 */
.unlock-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #4caf50;
  margin-top: 8px;
}

/* 稀有度标识 */
.rarity-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.rarity-indicator.common {
  background: #e0e0e0;
  color: #666;
}

.rarity-indicator.rare {
  background: #2196f3;
  color: white;
}

.rarity-indicator.epic {
  background: #9c27b0;
  color: white;
}

.rarity-indicator.legendary {
  background: linear-gradient(135deg, #ffd700, #ffb300);
  color: #333;
}

/* 详情弹窗 */
.badge-detail {
  text-align: center;
}

.detail-icon {
  margin-bottom: 16px;
}

.large-icon {
  font-size: 60px;
  background: linear-gradient(135deg, #f1f8e9, #e8f5e8);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #4caf50;
}

.detail-content h3 {
  margin: 16px 0 8px 0;
  color: #333;
}

.detail-description {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.detail-criteria,
.detail-achievement,
.detail-progress {
  margin-bottom: 16px;
  text-align: left;
}

.detail-criteria h4,
.detail-achievement h4,
.detail-progress h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
}

.detail-criteria p,
.detail-achievement p,
.detail-progress p {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .badge-container {
    padding: 12px;
  }

  .badge-icon {
    width: 50px;
    height: 50px;
  }

  .icon-emoji {
    font-size: 24px;
  }

  .badge-name {
    font-size: 14px;
  }

  .badge-description {
    font-size: 11px;
  }
}
</style>
