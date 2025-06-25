<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 品牌头部 -->
      <div class="brand-header">
        <div class="logo">
          <div class="logo-icon">🌱</div>
          <h1>NVC成长乐园</h1>
        </div>
        <p class="brand-slogan">在同理心中成长，在沟通中蜕变</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
        @submit.prevent="handleLogin"
      >
        <div class="form-title">
          <h2>{{ isLoginMode ? '欢迎回来' : '加入我们' }}</h2>
          <p>{{ isLoginMode ? '继续你的成长之旅' : '开始你的NVC学习之路' }}</p>
        </div>

        <!-- 昵称输入框（仅注册时显示） -->
        <el-form-item v-if="!isLoginMode" prop="nickname">
          <el-input
            v-model="loginForm.nickname"
            placeholder="请输入昵称"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <!-- 手机号输入框 -->
        <el-form-item prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            clearable
            maxlength="11"
            show-word-limit
          />
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="authStore.loading"
            @click="handleLogin"
          >
            {{ isLoginMode ? '登录' : '注册' }}
          </el-button>
        </el-form-item>

        <!-- 切换登录/注册模式 -->
        <div class="mode-switch">
          <span>{{ isLoginMode ? '还没有账号？' : '已有账号？' }}</span>
          <el-button type="primary" link @click="toggleMode">
            {{ isLoginMode ? '立即注册' : '立即登录' }}
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-tree">🌳</div>
      <div class="decoration-leaves">🍃</div>
      <div class="decoration-flower">🌸</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, RegisterRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const loginForm = reactive({
  phone: '',
  password: '',
  nickname: '',
})

// 是否为登录模式
const isLoginMode = ref(true)

// 表单验证规则
const loginRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' },
  ],
}

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  // 清空表单
  loginFormRef.value?.resetFields()
  loginForm.nickname = ''
}

// 处理登录/注册
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    let success = false

    if (isLoginMode.value) {
      // 登录
      const loginData: LoginRequest = {
        phone: loginForm.phone,
        password: loginForm.password,
      }
      success = await authStore.login(loginData)
    } else {
      // 注册
      const registerData: RegisterRequest = {
        phone: loginForm.phone,
        password: loginForm.password,
        nickname: loginForm.nickname,
      }
      success = await authStore.register(registerData)

      if (success) {
        // 注册成功后切换到登录模式
        isLoginMode.value = true
        loginForm.nickname = ''
      }
    }

    if (success && isLoginMode.value) {
      // 登录成功，根据用户角色跳转
      if (authStore.isAdmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/dashboard')
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.brand-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 32px;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d7d32;
  background: linear-gradient(135deg, #2d7d32, #4caf50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-slogan {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-form {
  .form-title {
    text-align: center;
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4caf50, #2d7d32);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #45a049, #1b5e20);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
    }
  }
}

.mode-switch {
  text-align: center;
  margin-top: 16px;
  color: #666;
  font-size: 14px;

  .el-button--primary.is-link {
    color: #4caf50;
    font-weight: 500;
  }
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

.decoration-tree {
  position: absolute;
  top: 10%;
  left: 15%;
  font-size: 48px;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.decoration-leaves {
  position: absolute;
  top: 20%;
  right: 20%;
  font-size: 24px;
  opacity: 0.5;
  animation: float 4s ease-in-out infinite reverse;
}

.decoration-flower {
  position: absolute;
  bottom: 20%;
  left: 20%;
  font-size: 32px;
  opacity: 0.4;
  animation: float 5s ease-in-out infinite;
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

/* 响应式设计 - 优化PC端宽度 */
@media (min-width: 768px) {
  .login-card {
    max-width: 480px; /* 减小平板端宽度 */
    width: 50vw; /* 使用50%视口宽度 */
    padding: 48px;
  }
}

@media (min-width: 1024px) {
  .login-card {
    max-width: 420px; /* 减小桌面端宽度 */
    width: 35vw; /* 使用35%视口宽度 */
    padding: 48px;
  }
}

@media (min-width: 1200px) {
  .login-card {
    max-width: 440px; /* 稍微增加一点宽度保持舒适 */
    width: 30vw; /* 使用30%视口宽度 */
    padding: 52px;
  }
}

@media (min-width: 1600px) {
  .login-card {
    max-width: 460px; /* 超宽屏时适当增加 */
    width: 25vw; /* 使用25%视口宽度 */
    padding: 56px;
  }
}

@media (max-width: 480px) {
  .login-card {
    margin: 20px;
    padding: 32px 24px;
    max-width: 100%;
  }

  .logo h1 {
    font-size: 20px;
  }

  .decoration-tree,
  .decoration-leaves,
  .decoration-flower {
    display: none;
  }
}
</style>
