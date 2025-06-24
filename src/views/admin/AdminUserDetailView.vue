<template>
  <AdminLayout>
    <div class="user-detail">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else-if="!userDetail" class="error-container">
        <el-result icon="warning" title="用户不存在" sub-title="请检查用户ID是否正确">
          <template #extra>
            <el-button type="primary" @click="router.push('/admin/users')">
              返回用户列表
            </el-button>
          </template>
        </el-result>
      </div>

      <div v-else class="user-detail-content">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="header-content">
            <el-button class="back-button" @click="router.push('/admin/users')">
              <el-icon><ArrowLeft /></el-icon>
              返回用户列表
            </el-button>
            <h1>👤 用户详情</h1>
          </div>
          <div class="header-actions">
            <el-button @click="editUser">
              <el-icon><Edit /></el-icon>
              编辑用户
            </el-button>
            <el-button type="warning" @click="showResetPasswordDialog = true">
              <el-icon><Key /></el-icon>
              重置密码
            </el-button>
            <el-popconfirm title="确定要删除这个用户吗？此操作不可恢复！" @confirm="deleteUser">
              <template #reference>
                <el-button type="danger">
                  <el-icon><Delete /></el-icon>
                  删除用户
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <!-- 用户基本信息 -->
        <div class="info-section">
          <el-row :gutter="24">
            <el-col :lg="8" :md="12" :sm="24">
              <el-card class="user-profile-card">
                <div class="profile-header">
                  <el-avatar :src="userDetail.avatarUrl" :size="80" />
                  <div class="profile-info">
                    <h3>{{ userDetail.nickname }}</h3>
                    <div class="profile-tags">
                      <el-tag :type="userDetail.role === 'admin' ? 'danger' : 'primary'">
                        {{ userDetail.role === 'admin' ? '管理员' : '用户' }}
                      </el-tag>
                      <el-tag :type="getStatusType(userDetail.status)">
                        {{ getStatusText(userDetail.status) }}
                      </el-tag>
                    </div>
                  </div>
                </div>

                <div class="profile-stats">
                  <div class="stat-item">
                    <div class="stat-value">Lv.{{ userDetail.level }}</div>
                    <div class="stat-label">用户等级</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ userDetail.xp }}</div>
                    <div class="stat-label">经验值</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ userDetail.streak.current }}</div>
                    <div class="stat-label">连续天数</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :lg="16" :md="12" :sm="24">
              <el-card class="user-info-card">
                <template #header>
                  <span>基本信息</span>
                </template>

                <div class="info-grid">
                  <div class="info-item">
                    <label>手机号：</label>
                    <span>{{ userDetail.phone }}</span>
                  </div>
                  <div class="info-item">
                    <label>用户ID：</label>
                    <span>{{ userDetail.userId }}</span>
                  </div>
                  <div class="info-item">
                    <label>注册时间：</label>
                    <span>{{ formatDateTime(userDetail.joinDate) }}</span>
                  </div>
                  <div class="info-item">
                    <label>最后登录：</label>
                    <span>{{
                      userDetail.lastLoginAt ? formatDateTime(userDetail.lastLoginAt) : '从未登录'
                    }}</span>
                  </div>
                  <div class="info-item">
                    <label>创建者：</label>
                    <span>{{ userDetail.createdBy || '系统' }}</span>
                  </div>
                  <div class="info-item">
                    <label>更新时间：</label>
                    <span>{{
                      userDetail.updatedAt ? formatDateTime(userDetail.updatedAt) : '-'
                    }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 活动统计 -->
        <div class="stats-section">
          <el-row :gutter="24">
            <el-col :lg="6" :md="12" :sm="24">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon activity">📋</div>
                  <div class="stat-details">
                    <div class="stat-number">{{ userDetail.totalActivities }}</div>
                    <div class="stat-title">参与活动</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :lg="6" :md="12" :sm="24">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon post">📝</div>
                  <div class="stat-details">
                    <div class="stat-number">{{ userDetail.totalPosts }}</div>
                    <div class="stat-title">发布动态</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :lg="6" :md="12" :sm="24">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon badge">🏆</div>
                  <div class="stat-details">
                    <div class="stat-number">{{ userDetail.badges.length }}</div>
                    <div class="stat-title">获得徽章</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :lg="6" :md="12" :sm="24">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon tree">🌳</div>
                  <div class="stat-details">
                    <div class="stat-number">{{ userDetail.growthTree.level }}</div>
                    <div class="stat-title">成长树等级</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 成长数据 -->
        <div class="growth-section">
          <el-row :gutter="24">
            <el-col :lg="12" :sm="24">
              <el-card class="growth-card">
                <template #header>
                  <span>徽章收藏</span>
                </template>

                <div v-if="userDetail.badges.length > 0" class="badges-grid">
                  <div v-for="badge in userDetail.badges" :key="badge" class="badge-item">
                    <div class="badge-icon">🏆</div>
                    <div class="badge-name">{{ getBadgeName(badge) }}</div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <span>暂无徽章</span>
                </div>
              </el-card>
            </el-col>

            <el-col :lg="12" :sm="24">
              <el-card class="growth-card">
                <template #header>
                  <span>成长树</span>
                </template>

                <div class="tree-stats">
                  <div class="tree-level">
                    <span class="tree-icon">🌳</span>
                    <span class="tree-text">等级 {{ userDetail.growthTree.level }}</span>
                  </div>

                  <div class="tree-elements">
                    <div class="element-item">
                      <span class="element-icon">🍃</span>
                      <span class="element-count">{{ userDetail.growthTree.elements.leaves }}</span>
                      <span class="element-label">叶子</span>
                    </div>
                    <div class="element-item">
                      <span class="element-icon">🌸</span>
                      <span class="element-count">{{
                        userDetail.growthTree.elements.flowers
                      }}</span>
                      <span class="element-label">花朵</span>
                    </div>
                    <div class="element-item">
                      <span class="element-icon">🍎</span>
                      <span class="element-count">{{ userDetail.growthTree.elements.fruits }}</span>
                      <span class="element-label">果实</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑用户信息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="选择角色" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="选择状态" style="width: 100%">
            <el-option label="正常" value="active" />
            <el-option label="未激活" value="inactive" />
            <el-option label="已停用" value="suspended" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input-number v-model="editForm.level" :min="1" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="经验值" prop="xp">
          <el-input-number v-model="editForm.xp" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="handleUpdateUser">
            保存修改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="showResetPasswordDialog"
      title="重置用户密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showResetPasswordDialog = false">取消</el-button>
          <el-button type="primary" :loading="resetPasswordLoading" @click="handleResetPassword">
            重置密码
          </el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Key, Delete } from '@element-plus/icons-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import {
  getUserDetail,
  updateUser,
  deleteUser as deleteUserApi,
  resetUserPassword,
} from '@/services/userManagementApi'
import type { UserManagementData, UpdateUserRequest } from '@/types'

const router = useRouter()
const route = useRoute()

// 数据状态
const loading = ref(true)
const userDetail = ref<UserManagementData | null>(null)

// 编辑用户相关
const showEditDialog = ref(false)
const editLoading = ref(false)
const editFormRef = ref()
const editForm = reactive<UpdateUserRequest>({
  nickname: '',
  role: 'user',
  status: 'active',
  level: 1,
  xp: 0,
})

const editRules = {
  nickname: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 重置密码相关
const showResetPasswordDialog = ref(false)
const resetPasswordLoading = ref(false)
const resetPasswordFormRef = ref()
const resetPasswordForm = reactive({
  newPassword: '',
  confirmPassword: '',
})

const validatePasswordConfirm = (rule: any, value: string, callback: Function) => {
  if (value !== resetPasswordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePasswordConfirm, trigger: 'blur' },
  ],
}

// 获取用户ID
const userId = computed(() => route.params.userId as string)

// 方法
const loadUserDetail = async () => {
  if (!userId.value) {
    router.push('/admin/users')
    return
  }

  loading.value = true
  try {
    const response = await getUserDetail(userId.value)
    if (response.success && response.data) {
      userDetail.value = response.data
    } else {
      ElMessage.error(response.error || '获取用户详情失败')
      userDetail.value = null
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    userDetail.value = null
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    suspended: 'danger',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    suspended: '已停用',
  }
  return statusMap[status] || status
}

const getBadgeName = (badgeId: string) => {
  const badgeNames: Record<string, string> = {
    listener: '聆听之耳',
    empath: '感受色彩家',
    helper: '同理心伙伴',
    master: '同理心大师',
    participant: '驿站常客',
    newcomer: '新手上路',
    admin: '管理员',
  }
  return badgeNames[badgeId] || badgeId
}

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 编辑用户
const editUser = () => {
  if (!userDetail.value) return

  Object.assign(editForm, {
    nickname: userDetail.value.nickname,
    role: userDetail.value.role,
    status: userDetail.value.status,
    level: userDetail.value.level,
    xp: userDetail.value.xp,
  })
  showEditDialog.value = true
}

const handleUpdateUser = async () => {
  if (!editFormRef.value || !userDetail.value) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    const response = await updateUser(userDetail.value.userId, editForm)
    if (response.success) {
      ElMessage.success('用户信息更新成功')
      showEditDialog.value = false
      loadUserDetail() // 重新加载用户详情
    } else {
      ElMessage.error(response.error || '更新用户信息失败')
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    editLoading.value = false
  }
}

// 重置密码
const handleResetPassword = async () => {
  if (!resetPasswordFormRef.value || !userDetail.value) return

  try {
    await resetPasswordFormRef.value.validate()
    resetPasswordLoading.value = true

    const response = await resetUserPassword(userDetail.value.userId, resetPasswordForm.newPassword)
    if (response.success) {
      ElMessage.success('密码重置成功')
      showResetPasswordDialog.value = false
      // 重置表单
      resetPasswordForm.newPassword = ''
      resetPasswordForm.confirmPassword = ''
    } else {
      ElMessage.error(response.error || '重置密码失败')
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    resetPasswordLoading.value = false
  }
}

// 删除用户
const deleteUser = async () => {
  if (!userDetail.value) return

  try {
    const response = await deleteUserApi(userDetail.value.userId)
    if (response.success) {
      ElMessage.success('用户删除成功')
      router.push('/admin/users')
    } else {
      ElMessage.error(response.error || '删除用户失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 初始化
onMounted(() => {
  loadUserDetail()
})
</script>

<style scoped>
.user-detail {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.loading-container,
.error-container {
  padding: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  border: none;
  background: #f0f2f5;
  color: #666;
}

.back-button:hover {
  background: #e6e8eb;
  color: #2e7d32;
}

.header-content h1 {
  margin: 0;
  color: #2e7d32;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.info-section {
  margin-bottom: 24px;
}

.user-profile-card {
  height: 100%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.profile-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.profile-tags {
  display: flex;
  gap: 8px;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.user-info-card {
  height: 100%;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-item span {
  color: #333;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.stat-icon.activity {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.post {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.tree {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.growth-section {
  margin-bottom: 24px;
}

.growth-card {
  height: 100%;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.badge-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
}

.tree-stats {
  padding: 20px;
}

.tree-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.tree-icon {
  font-size: 24px;
}

.tree-elements {
  display: flex;
  justify-content: space-around;
}

.element-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.element-icon {
  font-size: 24px;
}

.element-count {
  font-size: 20px;
  font-weight: 600;
  color: #2e7d32;
}

.element-label {
  font-size: 12px;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-detail {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .tree-elements {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
