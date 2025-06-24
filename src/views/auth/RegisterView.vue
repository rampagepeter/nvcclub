<template>
  <div>
    <!-- 注册功能已集成到登录页面，自动重定向 -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 重定向到登录页面（登录页面包含注册功能）
  router.replace('/login')
})
</script>
