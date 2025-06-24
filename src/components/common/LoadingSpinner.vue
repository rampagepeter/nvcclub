<template>
  <div class="loading-spinner" :class="[`size-${size}`, `type-${type}`]">
    <div v-if="type === 'spinner'" class="spinner">
      <div class="spinner-ring"></div>
    </div>

    <div v-else-if="type === 'dots'" class="dots">
      <div class="dot" v-for="i in 3" :key="i"></div>
    </div>

    <div v-else-if="type === 'pulse'" class="pulse">
      <div class="pulse-circle"></div>
    </div>

    <div v-else-if="type === 'growth'" class="growth-loading">
      <div class="tree-icon">🌱</div>
      <div class="growth-text">{{ text || '正在成长中...' }}</div>
    </div>

    <div v-else-if="type === 'skeleton'" class="skeleton-container">
      <el-skeleton :rows="skeletonRows" animated />
    </div>

    <div v-if="text && type !== 'growth' && type !== 'skeleton'" class="loading-text">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'spinner' | 'dots' | 'pulse' | 'growth' | 'skeleton'
  size?: 'small' | 'medium' | 'large'
  text?: string
  skeletonRows?: number
}

withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'medium',
  text: '',
  skeletonRows: 3,
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

/* 尺寸样式 */
.size-small {
  padding: 12px;
  gap: 8px;
}

.size-large {
  padding: 32px;
  gap: 16px;
}

/* 旋转加载器 */
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.size-small .spinner-ring {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.size-large .spinner-ring {
  width: 60px;
  height: 60px;
  border-width: 6px;
}

/* 点状加载器 */
.dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.size-small .dot {
  width: 6px;
  height: 6px;
}

.size-large .dot {
  width: 12px;
  height: 12px;
}

/* 脉冲加载器 */
.pulse-circle {
  width: 40px;
  height: 40px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.size-small .pulse-circle {
  width: 24px;
  height: 24px;
}

.size-large .pulse-circle {
  width: 60px;
  height: 60px;
}

/* 成长主题加载器 */
.growth-loading {
  text-align: center;
}

.tree-icon {
  font-size: 48px;
  animation: growthBounce 2s ease-in-out infinite;
  margin-bottom: 8px;
}

.size-small .tree-icon {
  font-size: 32px;
}

.size-large .tree-icon {
  font-size: 64px;
}

.growth-text {
  color: #4caf50;
  font-weight: 500;
  font-size: 14px;
}

.size-small .growth-text {
  font-size: 12px;
}

.size-large .growth-text {
  font-size: 16px;
}

/* 加载文本 */
.loading-text {
  color: #666;
  font-size: 14px;
  text-align: center;
}

.size-small .loading-text {
  font-size: 12px;
}

.size-large .loading-text {
  font-size: 16px;
}

/* 骨架屏容器 */
.skeleton-container {
  width: 100%;
  max-width: 400px;
}

/* 动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

@keyframes growthBounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-spinner {
    padding: 16px;
  }

  .growth-text {
    font-size: 12px;
  }
}
</style>
