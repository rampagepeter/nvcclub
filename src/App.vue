<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 应用初始化
onMounted(async () => {
  // 初始化认证状态
  await authStore.initializeAuth()
})

// 根据路由确定过渡动画名称
const getTransitionName = (route: any) => {
  // 登录注册页面使用淡入淡出
  if (route.path === '/login' || route.path === '/register') {
    return 'fade'
  }

  // 管理员页面使用滑动效果
  if (route.path.startsWith('/admin')) {
    return 'slide-left'
  }

  // 用户页面使用成长动画
  if (route.path.startsWith('/user')) {
    return 'grow'
  }

  // 错误页面使用弹跳效果
  if (route.name === 'NotFound') {
    return 'bounce'
  }

  // 默认使用淡入淡出
  return 'fade'
}
</script>

<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition :name="getTransitionName(route)" mode="out-in" appear>
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fafafa;
}

#app {
  min-height: 100vh;
}

/* 页面切换动画 */
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 成长动画 */
.grow-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.grow-leave-active {
  transition: all 0.3s ease;
}

.grow-enter-from {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.grow-leave-to {
  transform: scale(1.05);
  opacity: 0;
}

/* 弹跳动画 */
.bounce-enter-active {
  animation: bounceIn 0.6s ease;
}

.bounce-leave-active {
  transition: all 0.3s ease;
}

.bounce-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes bounceIn {
  0% {
    transform: scale(0.8) translateY(-30px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) translateY(-10px);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Element Plus 样式覆盖 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-button--primary {
  background: linear-gradient(135deg, #4caf50, #2d7d32);
  border: none;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #45a049, #1b5e20);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.el-input__wrapper {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.el-input__wrapper:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  transform: translateY(-1px);
}

.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 工具类 */
.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden {
  display: none;
}

/* 微交互增强 */
.button-with-hover {
  transition: all 0.3s ease;
}

.button-with-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-with-hover {
  transition: all 0.3s ease;
  cursor: pointer;
}

.card-with-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 响应式断点 */
@media (max-width: 640px) {
  .hidden-mobile {
    display: none;
  }

  /* 移动端动画优化 */
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.3s ease;
  }

  .grow-enter-active {
    transition: all 0.4s ease;
  }
}

@media (min-width: 641px) {
  .hidden-desktop {
    display: none;
  }
}

/* 减少动画的用户偏好设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
