<template>
  <div class="salon-container">
    <div class="salon-header">
      <h1>💬 主题沙龙</h1>
      <p>月度深度学习，探索NVC的智慧</p>
    </div>

    <div class="coming-soon">
      <div class="icon">🚧</div>
      <h2>功能开发中</h2>
      <p>主题沙龙功能正在精心开发中，敬请期待！</p>
      <el-button type="primary" @click="router.push('/dashboard')"> 返回主页 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.salon-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
  padding: 24px;
}

.salon-header {
  text-align: center;
  margin-bottom: 48px;
}

.salon-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #2d7d32;
}

.salon-header p {
  color: #666;
  font-size: 16px;
}

.coming-soon {
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.coming-soon h2 {
  color: #333;
  margin-bottom: 8px;
}

.coming-soon p {
  color: #666;
  margin-bottom: 24px;
}
</style>
