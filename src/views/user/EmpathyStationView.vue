<template>
  <div class="station-container">
    <div class="station-header">
      <h1>🚉 同理心驿站</h1>
      <p>每日练习，培养同理心技能</p>
    </div>

    <div class="coming-soon">
      <div class="icon">🚧</div>
      <h2>功能开发中</h2>
      <p>同理心驿站功能正在精心开发中，敬请期待！</p>
      <el-button type="primary" @click="router.push('/dashboard')"> 返回主页 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.station-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
  padding: 24px;
}

.station-header {
  text-align: center;
  margin-bottom: 48px;
}

.station-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #2d7d32;
}

.station-header p {
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

/* 响应式设计 */
@media (min-width: 1024px) {
  .station-container {
    padding: 32px 48px;
  }

  .station-header h1 {
    font-size: 36px;
  }

  .coming-soon {
    max-width: 600px;
    padding: 56px 40px;
  }
}

@media (max-width: 768px) {
  .station-container {
    padding: 16px;
  }

  .station-header h1 {
    font-size: 24px;
  }

  .coming-soon {
    padding: 32px 24px;
  }
}
</style>
