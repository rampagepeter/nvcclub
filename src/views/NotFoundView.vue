<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 404动画 -->
      <div class="error-animation">
        <div class="tree-lost">🌳</div>
        <div class="path-lost">🛤️</div>
        <div class="explorer">🚶‍♂️</div>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">哎呀，迷路了！</h2>
        <p class="error-description">
          看起来您访问的页面在成长之路上走失了。<br />
          让我们帮您找到正确的方向吧！
        </p>
      </div>

      <!-- 建议操作 -->
      <div class="suggested-actions">
        <div class="action-grid">
          <div class="action-card" @click="goHome">
            <div class="action-icon">🏠</div>
            <h3>回到首页</h3>
            <p>返回主页开始新的成长之旅</p>
          </div>

          <div class="action-card" @click="goBack">
            <div class="action-icon">↩️</div>
            <h3>返回上页</h3>
            <p>回到您刚才浏览的页面</p>
          </div>

          <div class="action-card" @click="goToActivities">
            <div class="action-icon">📅</div>
            <h3>查看活动</h3>
            <p>探索同理心驿站等精彩活动</p>
          </div>

          <div class="action-card" @click="goToCommunity">
            <div class="action-icon">💬</div>
            <h3>社区广场</h3>
            <p>与其他伙伴分享成长心得</p>
          </div>
        </div>
      </div>

      <!-- 联系支持 -->
      <div class="support-section">
        <p class="support-text">
          如果您认为这是一个错误，或需要帮助，请
          <a href="mailto:support@nvcgarden.com" class="support-link">联系我们</a>
        </p>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-element leaf">🍃</div>
      <div class="floating-element flower">🌸</div>
      <div class="floating-element sprout">🌱</div>
      <div class="floating-element butterfly">🦋</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  } else {
    router.push('/login')
  }
}

const goBack = () => {
  router.go(-1)
}

const goToActivities = () => {
  if (authStore.isAuthenticated) {
    router.push('/user/empathy-station')
  } else {
    router.push('/login')
  }
}

const goToCommunity = () => {
  if (authStore.isAuthenticated) {
    router.push('/user/community')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 50%, #e3f2fd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.not-found-content {
  max-width: 800px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
}

/* 错误动画 */
.error-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  font-size: 48px;
}

.tree-lost {
  animation: sway 3s ease-in-out infinite;
}

.path-lost {
  animation: float 2s ease-in-out infinite;
}

.explorer {
  animation: walk 2s ease-in-out infinite;
}

/* 错误信息 */
.error-info {
  margin-bottom: 48px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #4caf50;
  margin: 0 0 16px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #4caf50, #66bb6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  font-size: 32px;
  color: #2e7d32;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.error-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* 建议操作 */
.suggested-actions {
  margin-bottom: 48px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #4caf50;
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-card h3 {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 16px;
  font-weight: 600;
}

.action-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

/* 支持联系 */
.support-section {
  padding: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.support-text {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.support-link {
  color: #4caf50;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.support-link:hover {
  color: #2e7d32;
  text-decoration: underline;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  font-size: 24px;
  opacity: 0.3;
}

.leaf {
  top: 20%;
  left: 10%;
  animation: floatSlow 6s ease-in-out infinite;
}

.flower {
  top: 30%;
  right: 15%;
  animation: floatSlow 4s ease-in-out infinite reverse;
}

.sprout {
  bottom: 30%;
  left: 20%;
  animation: floatSlow 5s ease-in-out infinite;
}

.butterfly {
  top: 15%;
  right: 25%;
  animation: flutter 3s ease-in-out infinite;
}

/* 动画定义 */
@keyframes sway {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes walk {
  0%,
  100% {
    transform: translateX(0px);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes floatSlow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes flutter {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-8px) translateX(4px);
  }
  75% {
    transform: translateY(-4px) translateX(-4px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    padding: 16px;
  }

  .error-animation {
    font-size: 32px;
    gap: 12px;
    margin-bottom: 32px;
  }

  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 14px;
  }

  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .action-card {
    padding: 20px 12px;
  }

  .action-icon {
    font-size: 24px;
  }

  .action-card h3 {
    font-size: 14px;
  }

  .action-card p {
    font-size: 12px;
  }

  .floating-element {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }

  .error-code {
    font-size: 60px;
  }

  .error-title {
    font-size: 20px;
  }
}
</style>
