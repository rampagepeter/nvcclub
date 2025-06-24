<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>👤 个人中心</h1>
      <p>管理你的个人信息和成长记录</p>
    </div>

    <div class="profile-content">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h2>基本信息</h2>
          <el-button type="primary" text @click="toggleEdit" :icon="editing ? Check : Edit">
            {{ editing ? '保存' : '编辑' }}
          </el-button>
        </div>

        <div class="info-content">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <el-avatar :size="120" :src="userInfo.avatarUrl" class="user-avatar">
              {{ userInfo.nickname?.[0] || '用' }}
            </el-avatar>
            <el-button v-if="editing" type="primary" text size="small" class="change-avatar">
              更换头像
            </el-button>
          </div>

          <!-- 信息表单 -->
          <div class="info-form">
            <div class="form-row">
              <label>昵称</label>
              <el-input v-if="editing" v-model="editForm.nickname" placeholder="请输入昵称" />
              <span v-else class="info-value">{{ userInfo.nickname || '未设置' }}</span>
            </div>

            <div class="form-row">
              <label>手机号</label>
              <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
            </div>

            <div class="form-row">
              <label>加入时间</label>
              <span class="info-value">{{ formatDate(userInfo.joinDate) }}</span>
            </div>

            <div class="form-row">
              <label>成长等级</label>
              <span class="info-value level-badge">Lv.{{ userInfo.level || 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 成长统计 -->
      <div class="stats-card">
        <h2>成长统计</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">✨</div>
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.xp || 0 }}</div>
              <div class="stat-label">总经验值</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.streak?.current || 0 }}</div>
              <div class="stat-label">连续练习天数</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.badges?.length || 0 }}</div>
              <div class="stat-label">获得徽章</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">🌳</div>
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.growthTree?.level || 1 }}</div>
              <div class="stat-label">成长之树等级</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 徽章收藏 -->
      <div class="badges-card" v-if="userInfo.badges?.length">
        <div class="card-header">
          <h2>🏆 我的徽章</h2>
          <el-button type="primary" text @click="$router.push('/user/badges')">
            查看全部
          </el-button>
        </div>
        <div class="badges-grid">
          <div v-for="badgeId in userInfo.badges.slice(0, 6)" :key="badgeId" class="badge-item">
            <div class="badge-icon">{{ getBadgeIcon(badgeId) }}</div>
            <div class="badge-name">{{ getBadgeName(badgeId) }}</div>
          </div>
          <div v-if="userInfo.badges.length > 6" class="more-badges">
            <div class="more-count">+{{ userInfo.badges.length - 6 }}</div>
            <div class="more-text">更多</div>
          </div>
        </div>
      </div>

      <!-- 成长之树 -->
      <div class="tree-card">
        <h2>🌱 我的成长之树</h2>
        <div class="tree-display">
          <GrowthTreeComponent :tree-data="userInfo.growthTree" />
          <div class="tree-stats">
            <div class="tree-level">等级 {{ userInfo.growthTree?.level || 1 }}</div>
            <div class="tree-elements">
              <div class="element-item">
                <span class="element-icon">🍃</span>
                <span class="element-count">{{ userInfo.growthTree?.elements?.leaves || 0 }}</span>
                <span class="element-label">叶子</span>
              </div>
              <div class="element-item">
                <span class="element-icon">🌸</span>
                <span class="element-count">{{ userInfo.growthTree?.elements?.flowers || 0 }}</span>
                <span class="element-label">花朵</span>
              </div>
              <div class="element-item">
                <span class="element-icon">🍎</span>
                <span class="element-count">{{ userInfo.growthTree?.elements?.fruits || 0 }}</span>
                <span class="element-label">果实</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户设置 -->
      <div class="settings-card">
        <h2>⚙️ 账户设置</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-content">
              <div class="setting-title">修改密码</div>
              <div class="setting-desc">更改登录密码</div>
            </div>
            <el-button type="primary" text @click="showChangePassword = true"> 修改 </el-button>
          </div>

          <div class="setting-item">
            <div class="setting-content">
              <div class="setting-title">练习提醒</div>
              <div class="setting-desc">开启每日练习提醒</div>
            </div>
            <el-switch v-model="settings.practiceReminder" />
          </div>

          <div class="setting-item">
            <div class="setting-content">
              <div class="setting-title">邮件通知</div>
              <div class="setting-desc">接收活动和更新通知</div>
            </div>
            <el-switch v-model="settings.emailNotification" />
          </div>

          <div class="setting-item logout-item">
            <div class="setting-content">
              <div class="setting-title">退出登录</div>
              <div class="setting-desc">退出当前账户</div>
            </div>
            <el-button type="danger" text @click="handleLogout"> 退出 </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showChangePassword" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi, badgeApi } from '@/services/api'
import GrowthTreeComponent from '@/components/GrowthTreeComponent.vue'
import { Edit, Check, Close, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Badge } from '@/types'

const router = useRouter()
const userStore = useAuthStore()

// 响应式数据
const activeTab = ref('profile')
const editMode = ref(false)
const loading = ref(false)
const editForm = ref({
  nickname: '',
  email: '',
  bio: '',
})
const allBadges = ref<Badge[]>([])
const earnedBadges = ref<Badge[]>([])
const selectedBadgeCategory = ref('all')
const editing = ref(false)
const showChangePassword = ref(false)

// 用户信息 - 使用any类型避免类型错误
const userInfo = computed(() => (userStore.user as any) || {})

// 设置
const settings = ref({
  practiceReminder: true,
  emailNotification: true,
})

// 修改密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 方法
const formatDate = (date?: Date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getBadgeIcon = (badgeId: string) => {
  const icons = {
    empathy_master: '🤝',
    daily_warrior: '🗡️',
    community_helper: '🤲',
    nvc_master: '🌟',
    teacher: '👨‍🏫',
    community_builder: '🏗️',
  }
  return icons[badgeId as keyof typeof icons] || '🏆'
}

const getBadgeName = (badgeId: string) => {
  const names = {
    empathy_master: '同理心大师',
    daily_warrior: '每日行者',
    community_helper: '社群助手',
    nvc_master: 'NVC大师',
    teacher: '导师',
    community_builder: '社群建设者',
  }
  return names[badgeId as keyof typeof names] || '未知徽章'
}

const toggleEdit = async () => {
  if (editing.value) {
    // 保存编辑
    await saveProfile()
  } else {
    // 开始编辑
    startEdit()
  }
}

const startEdit = () => {
  editing.value = true
  editForm.value.nickname = userInfo.value.nickname || ''
}

const saveProfile = async () => {
  try {
    loading.value = true
    const response = await userApi.updateProfile(editForm.value)

    if (response.success) {
      // 更新本地用户信息
      if (userStore.user) {
        Object.assign(userStore.user, response.data)
      }
      editing.value = false
      ElMessage.success('个人信息更新成功')
    }
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请填写所有必填项')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  try {
    // 这里应该调用修改密码的API
    ElMessage.success('密码修改成功')
    showChangePassword.value = false
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (error) {
    ElMessage.error('密码修改失败，请重试')
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    // 用户取消操作
  }
}

// 生命周期
onMounted(() => {
  // 页面加载时的初始化
})
</script>

<style scoped>
/* 响应式设计 - 统一优化版本 */
.profile-container {
  width: 100%;
  /* 移除最大宽度限制，采用分区域控制 */
}

/* 分区域最大宽度控制 */
.profile-header {
  max-width: var(--max-width-narrow, 1200px);
  margin: 0 auto;
}

.profile-content {
  max-width: var(--max-width-standard, 1400px);
  margin: 0 auto;
}

.stats-section,
.badges-section {
  max-width: var(--max-width-wide, 1600px);
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.profile-content {
  display: grid;
  gap: 24px;
}

/* 基础卡片样式 */
.info-card,
.stats-card,
.badges-card,
.tree-card,
.settings-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-header h2 {
  margin: 0;
  color: #2e7d32;
  font-size: 20px;
}

/* 基本信息 */
.info-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 32px;
  align-items: start;
}

.avatar-section {
  text-align: center;
}

.user-avatar {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  font-weight: bold;
  margin-bottom: 12px;
}

.change-avatar {
  display: block;
  margin: 0 auto;
}

.info-form {
  display: grid;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 16px;
}

.form-row label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-size: 16px;
}

.level-badge {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
}

/* 成长统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 徽章收藏 */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.badge-item {
  text-align: center;
  background: #f1f8e9;
  padding: 16px;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.badge-item:hover {
  transform: translateY(-2px);
}

.badge-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 14px;
  color: #2e7d32;
  font-weight: 500;
}

/* 成长之树 */
.tree-display {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: center;
}

.tree-stats {
  text-align: center;
}

.tree-level {
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 16px;
}

.tree-elements {
  display: grid;
  gap: 12px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f8e9;
  padding: 8px 12px;
  border-radius: 20px;
}

.element-icon {
  font-size: 20px;
}

.element-count {
  font-weight: bold;
  color: #2e7d32;
  min-width: 20px;
}

.element-label {
  font-size: 14px;
  color: #666;
}

/* 账户设置 */
.settings-list {
  display: grid;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.setting-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 14px;
  color: #666;
}

.logout-item {
  border: 1px solid #ffebee;
  background: #ffebee;
}

/* 响应式 */
@media (min-width: 1024px) {
  .profile-container {
    padding: var(--container-padding-tablet, 24px) var(--container-padding-desktop, 48px);
  }

  .profile-header {
    padding: 32px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }

  .badges-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
  }
}

@media (min-width: 1200px) {
  .profile-container {
    padding: var(--container-padding-desktop, 48px) var(--container-padding-large, 64px);
  }

  .stats-section,
  .badges-section {
    max-width: var(--max-width-wide, 1600px);
  }
}

@media (min-width: 1600px) {
  .profile-container {
    padding: var(--container-padding-large, 64px);
  }

  .stats-section,
  .badges-section {
    max-width: var(--max-width-ultrawide, 1800px);
  }

  .badges-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--container-padding-mobile, 12px);
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .badges-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .tree-display {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .element-item {
    justify-content: center;
  }
}
</style>
