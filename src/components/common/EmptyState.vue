<template>
  <div class="empty-state" :class="[`size-${size}`, `theme-${theme}`]">
    <div class="empty-icon">
      <slot name="icon">
        {{ icon || defaultIcon }}
      </slot>
    </div>

    <div class="empty-content">
      <h3 class="empty-title">
        <slot name="title">
          {{ title || defaultTitle }}
        </slot>
      </h3>

      <p class="empty-description">
        <slot name="description">
          {{ description || defaultDescription }}
        </slot>
      </p>
    </div>

    <div v-if="showAction" class="empty-actions">
      <slot name="actions">
        <el-button type="primary" @click="$emit('action')">
          {{ actionText }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'data' | 'search' | 'network' | 'permission' | 'badge' | 'activity' | 'post'
  size?: 'small' | 'medium' | 'large'
  theme?: 'default' | 'growth' | 'community'
  icon?: string
  title?: string
  description?: string
  actionText?: string
  showAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'data',
  size: 'medium',
  theme: 'default',
  actionText: '重试',
  showAction: false,
})

defineEmits<{
  action: []
}>()

// 默认图标和文本
const getDefaults = (type: string) => {
  const defaults = {
    data: { icon: '📋', title: '暂无数据', description: '这里还没有任何内容' },
    search: { icon: '🔍', title: '无搜索结果', description: '尝试使用其他关键词搜索' },
    network: { icon: '🌐', title: '网络连接失败', description: '请检查网络连接后重试' },
    permission: { icon: '🔒', title: '无访问权限', description: '您没有权限查看此内容' },
    badge: { icon: '🏆', title: '暂无徽章', description: '继续努力，获得更多成就徽章吧！' },
    activity: { icon: '📅', title: '暂无活动', description: '目前没有相关活动安排' },
    post: { icon: '💭', title: '还没有动态', description: '成为第一个分享成长感悟的人吧！' },
  }
  return defaults[type as keyof typeof defaults] || defaults.data
}

const defaultIcon = computed(() => getDefaults(props.type).icon)
const defaultTitle = computed(() => getDefaults(props.type).title)
const defaultDescription = computed(() => getDefaults(props.type).description)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 200px;
}

/* 尺寸样式 */
.size-small {
  padding: 24px 16px;
  min-height: 120px;
}

.size-large {
  padding: 60px 32px;
  min-height: 300px;
}

/* 主题样式 */
.theme-growth {
  background: linear-gradient(135deg, #f1f8e9, #e8f5e8);
  border-radius: 16px;
}

.theme-community {
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
  border-radius: 16px;
}

.theme-default {
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

/* 图标样式 */
.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

.size-small .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.size-large .empty-icon {
  font-size: 80px;
  margin-bottom: 32px;
}

/* 内容样式 */
.empty-content {
  margin-bottom: 24px;
}

.size-small .empty-content {
  margin-bottom: 16px;
}

.size-large .empty-content {
  margin-bottom: 32px;
}

.empty-title {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.size-small .empty-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.size-large .empty-title {
  font-size: 22px;
  margin-bottom: 16px;
}

.empty-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  max-width: 400px;
}

.size-small .empty-description {
  font-size: 12px;
  max-width: 300px;
}

.size-large .empty-description {
  font-size: 16px;
  max-width: 500px;
}

/* 操作按钮 */
.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 主题特定颜色 */
.theme-growth .empty-title {
  color: #2e7d32;
}

.theme-growth .empty-description {
  color: #4caf50;
}

.theme-community .empty-title {
  color: #1976d2;
}

.theme-community .empty-description {
  color: #2196f3;
}

/* 动画效果 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-state {
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-title {
    font-size: 16px;
  }

  .empty-description {
    font-size: 13px;
  }
}
</style>
