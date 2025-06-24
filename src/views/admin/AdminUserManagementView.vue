<template>
  <AdminLayout>
    <div class="user-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1>👥 用户管理</h1>
          <p>管理系统中的所有用户账户</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
          <el-button type="success" @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-card>
          <div class="search-form">
            <div class="search-row">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索用户名或手机号"
                clearable
                @input="handleSearch"
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="searchForm.role"
                placeholder="用户角色"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="普通用户" value="user" />
                <el-option label="管理员" value="admin" />
              </el-select>

              <el-select
                v-model="searchForm.status"
                placeholder="账户状态"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="正常" value="active" />
                <el-option label="未激活" value="inactive" />
                <el-option label="已停用" value="suspended" />
              </el-select>

              <el-select
                v-model="searchForm.sortBy"
                placeholder="排序方式"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="最新注册" value="newest" />
                <el-option label="最早注册" value="oldest" />
                <el-option label="等级排序" value="level" />
                <el-option label="活跃度" value="activity" />
              </el-select>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 用户列表 -->
      <div class="users-section">
        <el-card>
          <template #header>
            <div class="table-header">
              <span>用户列表 (共 {{ pagination.total }} 人)</span>
              <div class="table-actions">
                <el-button size="small" @click="loadUserList">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="loading" :data="userList" stripe style="width: 100%">
            <el-table-column label="用户信息" min-width="250">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :src="row.avatarUrl" :size="40" />
                  <div class="user-details">
                    <div class="user-name">{{ row.nickname }}</div>
                    <div class="user-phone">{{ row.phone }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
                  {{ row.role === 'admin' ? '管理员' : '用户' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="等级" width="80" align="center">
              <template #default="{ row }">
                <div class="level-badge">Lv.{{ row.level }}</div>
              </template>
            </el-table-column>

            <el-table-column label="活跃度" width="120" align="center">
              <template #default="{ row }">
                <div class="activity-stats">
                  <div>活动: {{ row.totalActivities }}</div>
                  <div>帖子: {{ row.totalPosts }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="注册时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.joinDate) }}
              </template>
            </el-table-column>

            <el-table-column label="最后登录" width="120">
              <template #default="{ row }">
                {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未登录' }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" @click="viewUserDetail(row.userId)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="editUser(row)"> 编辑 </el-button>
                  <el-popconfirm title="确定要删除这个用户吗？" @confirm="deleteUser(row.userId)">
                    <template #reference>
                      <el-button type="danger" size="small">删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="添加新用户"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="createForm.nickname" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" placeholder="选择角色" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createForm.status" placeholder="选择状态" style="width: 100%">
            <el-option label="正常" value="active" />
            <el-option label="未激活" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="createLoading" @click="handleCreateUser">
            创建用户
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Excel导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="批量导入用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="import-section">
        <div class="import-tips">
          <el-alert title="导入说明" type="info" :closable="false" show-icon>
            <template #default>
              <p>1. 请下载模板文件，按照模板格式填写用户信息</p>
              <p>2. 支持格式：.xlsx、.xls</p>
              <p>3. 必填字段：手机号、用户名、密码</p>
              <p>4. 可选字段：角色（user/admin）、状态（active/inactive）</p>
            </template>
          </el-alert>
        </div>

        <div class="import-actions">
          <el-button @click="downloadTemplate">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
        </div>

        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :limit="1"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将Excel文件拖拽到此处，或<em>点击选择文件</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传 xlsx/xls 格式文件，且不超过 10MB</div>
          </template>
        </el-upload>

        <div v-if="importPreview.length > 0" class="preview-section">
          <h4>预览数据（前5条）：</h4>
          <el-table :data="importPreview.slice(0, 5)" border size="small">
            <el-table-column label="手机号" prop="phone" />
            <el-table-column label="用户名" prop="nickname" />
            <el-table-column label="密码" prop="password" show-overflow-tooltip />
            <el-table-column label="角色" prop="role" />
            <el-table-column label="状态" prop="status" />
          </el-table>
          <p class="preview-total">共 {{ importPreview.length }} 条数据待导入</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="importLoading"
            :disabled="importPreview.length === 0"
            @click="handleImportUsers"
          >
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="showImportResultDialog" title="导入结果" width="700px">
      <div v-if="importResult" class="import-result">
        <el-alert
          :title="`导入完成：成功 ${importResult.successCount} 条，失败 ${importResult.failureCount} 条`"
          :type="importResult.successCount > 0 ? 'success' : 'error'"
          :closable="false"
          show-icon
        />

        <div v-if="importResult.errors.length > 0" class="error-details">
          <h4>错误详情：</h4>
          <el-table :data="importResult.errors" border size="small">
            <el-table-column label="行号" prop="row" width="80" />
            <el-table-column label="手机号" prop="phone" />
            <el-table-column label="错误信息" prop="error" />
          </el-table>
        </div>

        <div v-if="importResult.duplicates.length > 0" class="duplicate-details">
          <h4>重复的手机号：</h4>
          <el-tag v-for="phone in importResult.duplicates" :key="phone" class="duplicate-tag">
            {{ phone }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showImportResultDialog = false">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑用户"
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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search, Refresh, Download, UploadFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import AdminLayout from '@/components/AdminLayout.vue'
import {
  getUserList,
  createUser,
  batchCreateUsers,
  updateUser,
  deleteUser as deleteUserApi,
} from '@/services/userManagementApi'
import type {
  UserManagementData,
  CreateUserRequest,
  UpdateUserRequest,
  UserSearchFilter,
  ExcelImportResult,
} from '@/types'

const router = useRouter()

// 数据状态
const loading = ref(false)
const userList = ref<UserManagementData[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 搜索表单
const searchForm = reactive<UserSearchFilter>({
  keyword: '',
  role: 'all',
  status: 'all',
  sortBy: 'newest',
  sortOrder: 'desc',
})

// 添加用户相关
const showCreateDialog = ref(false)
const createLoading = ref(false)
const createFormRef = ref()
const createForm = reactive<CreateUserRequest>({
  phone: '',
  nickname: '',
  password: '',
  role: 'user',
  status: 'active',
})

const createRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 编辑用户相关
const showEditDialog = ref(false)
const editLoading = ref(false)
const editFormRef = ref()
const editForm = reactive<UpdateUserRequest & { userId?: string }>({
  userId: '',
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

// Excel导入相关
const showImportDialog = ref(false)
const importLoading = ref(false)
const importPreview = ref<CreateUserRequest[]>([])
const uploadRef = ref()
const showImportResultDialog = ref(false)
const importResult = ref<ExcelImportResult | null>(null)

// 方法
const loadUserList = async () => {
  loading.value = true
  try {
    const response = await getUserList(pagination.currentPage, pagination.pageSize, searchForm)
    if (response.success && response.data) {
      userList.value = response.data.users
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.error || '获取用户列表失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadUserList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadUserList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadUserList()
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

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 创建用户
const handleCreateUser = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    createLoading.value = true

    const response = await createUser(createForm)
    if (response.success) {
      ElMessage.success('用户创建成功')
      showCreateDialog.value = false
      // 重置表单
      Object.assign(createForm, {
        phone: '',
        nickname: '',
        password: '',
        role: 'user',
        status: 'active',
      })
      loadUserList()
    } else {
      ElMessage.error(response.error || '创建用户失败')
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    createLoading.value = false
  }
}

// 编辑用户
const editUser = (user: UserManagementData) => {
  Object.assign(editForm, {
    userId: user.userId,
    nickname: user.nickname,
    role: user.role,
    status: user.status,
    level: user.level,
    xp: user.xp,
  })
  showEditDialog.value = true
}

const handleUpdateUser = async () => {
  if (!editFormRef.value || !editForm.userId) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    const { userId, ...updateData } = editForm
    const response = await updateUser(userId, updateData)
    if (response.success) {
      ElMessage.success('用户信息更新成功')
      showEditDialog.value = false
      loadUserList()
    } else {
      ElMessage.error(response.error || '更新用户信息失败')
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    editLoading.value = false
  }
}

// 删除用户
const deleteUser = async (userId: string) => {
  try {
    const response = await deleteUserApi(userId)
    if (response.success) {
      ElMessage.success('用户删除成功')
      loadUserList()
    } else {
      ElMessage.error(response.error || '删除用户失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 查看用户详情
const viewUserDetail = (userId: string) => {
  router.push(`/admin/users/${userId}`)
}

// 下载Excel模板
const downloadTemplate = () => {
  const templateData = [
    ['手机号', '用户名', '密码', '角色', '状态'],
    ['13800138000', '示例用户', '123456', 'user', 'active'],
    ['13800138001', '示例管理员', '123456', 'admin', 'active'],
  ]

  const ws = XLSX.utils.aoa_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户导入模板')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, '用户导入模板.xlsx')
}

// 文件上传处理
const beforeUpload = (file: File) => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 格式文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB！')
    return false
  }
  return false // 阻止自动上传
}

const handleFileChange = (file: any) => {
  if (!file.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[]

      if (jsonData.length < 2) {
        ElMessage.error('Excel文件格式不正确，请检查数据')
        return
      }

      // 跳过标题行，解析数据
      const users: CreateUserRequest[] = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row[0] && !row[1] && !row[2]) continue // 跳过空行

        users.push({
          phone: row[0]?.toString() || '',
          nickname: row[1]?.toString() || '',
          password: row[2]?.toString() || '',
          role: (row[3]?.toString() === 'admin' ? 'admin' : 'user') as 'user' | 'admin',
          status: (row[4]?.toString() === 'inactive' ? 'inactive' : 'active') as
            | 'active'
            | 'inactive',
        })
      }

      importPreview.value = users
      ElMessage.success(`成功解析 ${users.length} 条用户数据`)
    } catch (error) {
      ElMessage.error('解析Excel文件失败，请检查文件格式')
    }
  }
  reader.readAsBinaryString(file.raw)
}

// 批量导入用户
const handleImportUsers = async () => {
  if (importPreview.value.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  importLoading.value = true
  try {
    const response = await batchCreateUsers({ users: importPreview.value })
    if (response.success && response.data) {
      importResult.value = response.data
      showImportDialog.value = false
      showImportResultDialog.value = true

      // 清理数据
      importPreview.value = []
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }

      // 刷新用户列表
      loadUserList()
    } else {
      ElMessage.error(response.error || '批量导入失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    importLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
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

.header-content h1 {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 28px;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-section {
  margin-bottom: 24px;
}

.search-form {
  padding: 20px;
}

.search-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.users-section {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-phone {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.activity-stats {
  font-size: 12px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.import-section {
  padding: 20px 0;
}

.import-tips {
  margin-bottom: 20px;
}

.import-actions {
  margin-bottom: 20px;
  text-align: center;
}

.upload-area {
  margin-bottom: 20px;
}

.preview-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.preview-total {
  margin: 12px 0 0 0;
  font-size: 14px;
  color: #666;
}

.import-result {
  padding: 20px 0;
}

.error-details,
.duplicate-details {
  margin-top: 20px;
}

.error-details h4,
.duplicate-details h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.duplicate-tag {
  margin: 4px 8px 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-row > * {
    width: 100% !important;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
