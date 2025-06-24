<template>
  <AdminLayout>
    <div class="content-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1>📝 内容管理</h1>
          <p>管理活动发布、参与者和内容审核</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateActivityDialog = true">
            <el-icon><Plus /></el-icon>
            创建活动
          </el-button>
          <el-button
            type="success"
            @click="showBatchAddDialog = true"
            :disabled="!selectedActivity"
          >
            <el-icon><User /></el-icon>
            批量添加参与者
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
                placeholder="搜索活动标题、描述或主持人"
                clearable
                @input="handleSearch"
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="searchForm.type"
                placeholder="活动类型"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="同理心驿站" value="EmpathyStation" />
                <el-option label="主题沙龙" value="ThemeSalon" />
                <el-option label="生命成长" value="LifeGrowth" />
              </el-select>

              <el-select
                v-model="searchForm.status"
                placeholder="活动状态"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="即将开始" value="upcoming" />
                <el-option label="进行中" value="ongoing" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>

              <el-select
                v-model="searchForm.sortBy"
                placeholder="排序方式"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="最新创建" value="newest" />
                <el-option label="最早创建" value="oldest" />
                <el-option label="开始时间" value="scheduled_time" />
                <el-option label="参与人数" value="participants" />
              </el-select>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 活动列表 -->
      <div class="activities-section">
        <el-card>
          <template #header>
            <div class="table-header">
              <span>活动列表 (共 {{ pagination.total }} 个)</span>
              <div class="table-actions">
                <el-button size="small" @click="loadActivityList">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="activityList"
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />

            <el-table-column label="活动信息" min-width="300">
              <template #default="{ row }">
                <div class="activity-info">
                  <div class="activity-title">{{ row.title }}</div>
                  <div class="activity-desc">{{ row.description }}</div>
                  <div class="activity-tags">
                    <el-tag v-for="tag in row.tags" :key="tag" size="small" class="tag-item">
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getActivityTypeColor(row.type)" size="small">
                  {{ getActivityTypeName(row.type) }}
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

            <el-table-column label="开始时间" width="160">
              <template #default="{ row }">
                {{ row.scheduledTime ? formatDateTime(row.scheduledTime) : '-' }}
              </template>
            </el-table-column>

            <el-table-column label="参与情况" width="120" align="center">
              <template #default="{ row }">
                <div class="participation-stats">
                  <div>{{ row.totalParticipants }}/{{ row.capacity || '∞' }}</div>
                  <div class="completion-rate">完成率: {{ row.completionRate }}%</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="主持人" width="120">
              <template #default="{ row }">
                {{ row.hostBy || '-' }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewActivityDetail(row.activityId)"
                  >
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="editActivity(row)">
                    编辑
                  </el-button>
                  <el-button type="success" size="small" @click="openBatchAddDialog(row)">
                    添加参与者
                  </el-button>
                  <el-button type="info" size="small" @click="viewParticipants(row)">
                    管理参与者
                  </el-button>
                  <el-popconfirm
                    title="确定要删除这个活动吗？"
                    @confirm="deleteActivity(row.activityId)"
                  >
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

    <!-- 创建活动对话框 -->
    <el-dialog
      v-model="showCreateActivityDialog"
      title="创建新活动"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="createForm.type" placeholder="选择活动类型" style="width: 100%">
            <el-option label="同理心驿站" value="EmpathyStation" />
            <el-option label="主题沙龙" value="ThemeSalon" />
            <el-option label="生命成长" value="LifeGrowth" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入活动标题" />
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="scheduledTime">
              <el-date-picker
                v-model="createForm.scheduledTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="持续时间" prop="durationInMinutes">
              <el-input-number
                v-model="createForm.durationInMinutes"
                :min="30"
                :max="480"
                :step="30"
                style="width: 100%"
              />
              <span style="margin-left: 8px; color: #666">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经验奖励" prop="xpReward">
              <el-input-number
                v-model="createForm.xpReward"
                :min="10"
                :max="500"
                :step="10"
                style="width: 100%"
              />
              <span style="margin-left: 8px; color: #666">XP</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动频率" prop="frequency">
              <el-select v-model="createForm.frequency" placeholder="选择频率" style="width: 100%">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="每季度" value="quarterly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动地点" prop="location">
              <el-input v-model="createForm.location" placeholder="请输入活动地点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主持人" prop="hostBy">
              <el-input v-model="createForm.hostBy" placeholder="请输入主持人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动容量" prop="capacity">
          <el-input-number
            v-model="createForm.capacity"
            :min="1"
            :max="1000"
            style="width: 200px"
          />
          <span style="margin-left: 8px; color: #666">人（留空表示无限制）</span>
        </el-form-item>

        <el-form-item label="活动标签" prop="tags">
          <el-select
            v-model="createForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option label="NVC练习" value="NVC练习" />
            <el-option label="同理心分享" value="同理心分享" />
            <el-option label="情绪管理" value="情绪管理" />
            <el-option label="亲子沟通" value="亲子沟通" />
            <el-option label="职场沟通" value="职场沟通" />
            <el-option label="伴侣关系" value="伴侣关系" />
            <el-option label="生命成长" value="生命成长" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateActivityDialog = false">取消</el-button>
          <el-button type="primary" :loading="createLoading" @click="handleCreateActivity">
            创建活动
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量添加参与者对话框 -->
    <el-dialog
      v-model="showBatchAddDialog"
      title="批量添加参与者"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedActivity" class="batch-add-section">
        <div class="activity-summary">
          <h4>{{ selectedActivity.title }}</h4>
          <p>{{ selectedActivity.description }}</p>
          <div class="activity-meta">
            <el-tag :type="getActivityTypeColor(selectedActivity.type)">
              {{ getActivityTypeName(selectedActivity.type) }}
            </el-tag>
            <span class="meta-item">
              当前参与: {{ selectedActivity.totalParticipants }}/{{
                selectedActivity.capacity || '∞'
              }}
            </span>
            <span class="meta-item"> 经验奖励: {{ selectedActivity.xpReward }}XP </span>
          </div>
        </div>

        <el-divider />

        <div class="user-selection">
          <div class="selection-header">
            <h4>选择参与用户</h4>
            <div class="selection-actions">
              <el-input
                v-model="userSearchKeyword"
                placeholder="搜索用户"
                clearable
                @input="handleUserSearch"
                style="width: 200px; margin-right: 12px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button @click="selectAllUsers">全选</el-button>
              <el-button @click="clearUserSelection">清空</el-button>
            </div>
          </div>

          <div class="user-list">
            <el-checkbox-group v-model="selectedUserIds">
              <div class="user-grid">
                <div v-for="user in filteredUsers" :key="user.userId" class="user-item">
                  <el-checkbox
                    :value="user.userId"
                    :disabled="isUserAlreadyParticipant(user.userId)"
                  >
                    <div class="user-info">
                      <el-avatar :src="user.avatarUrl" :size="32" />
                      <div class="user-details">
                        <div class="user-name">{{ user.nickname }}</div>
                        <div class="user-meta">Lv.{{ user.level }} | {{ user.phone }}</div>
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </div>

        <el-divider />

        <div class="batch-options">
          <el-checkbox v-model="batchOptions.autoAttend">
            自动标记为已参加（将立即获得经验值和徽章奖励）
          </el-checkbox>
          <el-checkbox v-model="batchOptions.sendNotification"> 发送通知给参与用户 </el-checkbox>
        </div>

        <div class="selected-summary">
          <el-alert
            :title="`已选择 ${selectedUserIds.length} 个用户`"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p v-if="batchOptions.autoAttend">
                这些用户将立即获得 {{ selectedActivity.xpReward }}XP 经验值奖励
              </p>
              <p v-else>这些用户将被添加到活动参与列表中</p>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBatchAddDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="batchAddLoading"
            :disabled="selectedUserIds.length === 0"
            @click="handleBatchAddParticipants"
          >
            添加参与者 ({{ selectedUserIds.length }})
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量添加结果对话框 -->
    <el-dialog v-model="showBatchResultDialog" title="批量添加结果" width="700px">
      <div v-if="batchResult" class="batch-result">
        <el-alert
          :title="`添加完成：成功 ${batchResult.successCount} 个，失败 ${batchResult.failureCount} 个`"
          :type="batchResult.successCount > 0 ? 'success' : 'error'"
          :closable="false"
          show-icon
        />

        <div v-if="batchResult.results.length > 0" class="result-details">
          <h4>详细结果：</h4>
          <el-table :data="batchResult.results" border size="small">
            <el-table-column label="用户" prop="userName" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="获得经验" width="100">
              <template #default="{ row }"> {{ row.xpEarned || 0 }}XP </template>
            </el-table-column>
            <el-table-column label="获得徽章" width="120">
              <template #default="{ row }">
                <el-tag
                  v-for="badge in row.badgesEarned || []"
                  :key="badge"
                  size="small"
                  class="badge-tag"
                >
                  {{ badge }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="错误信息" prop="error" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showBatchResultDialog = false">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 参与者管理对话框 -->
    <el-dialog
      v-model="showParticipantsDialog"
      title="参与者管理"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedActivity" class="participants-management">
        <div class="activity-summary">
          <h4>{{ selectedActivity.title }}</h4>
          <div class="activity-stats">
            <el-tag :type="getActivityTypeColor(selectedActivity.type)">
              {{ getActivityTypeName(selectedActivity.type) }}
            </el-tag>
            <span class="stat-item"> 总参与: {{ selectedActivity.totalParticipants }}人 </span>
            <span class="stat-item">
              已参加:
              {{ selectedActivity.participants.filter((p) => p.status === 'attended').length }}人
            </span>
            <span class="stat-item"> 完成率: {{ selectedActivity.completionRate }}% </span>
          </div>
        </div>

        <el-divider />

        <div class="participants-list">
          <div class="list-header">
            <h4>参与者列表</h4>
            <div class="batch-actions">
              <el-button
                type="success"
                size="small"
                @click="batchMarkAttendance(true)"
                :disabled="selectedParticipantIds.length === 0"
              >
                批量标记已参加
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="batchMarkAttendance(false)"
                :disabled="selectedParticipantIds.length === 0"
              >
                批量标记未参加
              </el-button>
            </div>
          </div>

          <el-table
            :data="selectedActivity.participants"
            border
            size="small"
            @selection-change="handleParticipantSelectionChange"
          >
            <el-table-column type="selection" width="55" />

            <el-table-column label="用户信息" width="200">
              <template #default="{ row }">
                <div class="participant-info">
                  <el-avatar :src="row.userAvatar" :size="32">
                    {{ row.userName[0] }}
                  </el-avatar>
                  <div class="participant-details">
                    <div class="participant-name">{{ row.userName }}</div>
                    <div class="participant-id">ID: {{ row.userId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="报名时间" width="140">
              <template #default="{ row }">
                {{ formatDateTime(row.registeredAt) }}
              </template>
            </el-table-column>

            <el-table-column label="参加状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getParticipantStatusType(row.status)" size="small">
                  {{ getParticipantStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="参加时间" width="140">
              <template #default="{ row }">
                {{ row.attendedAt ? formatDateTime(row.attendedAt) : '-' }}
              </template>
            </el-table-column>

            <el-table-column label="获得经验" width="100" align="center">
              <template #default="{ row }">
                <span :class="{ 'xp-earned': row.xpEarned > 0 }"> {{ row.xpEarned }}XP </span>
              </template>
            </el-table-column>

            <el-table-column label="获得徽章" width="120">
              <template #default="{ row }">
                <el-tag
                  v-for="badge in row.badgesEarned"
                  :key="badge"
                  size="small"
                  class="badge-tag"
                >
                  {{ badge }}
                </el-tag>
                <span v-if="row.badgesEarned.length === 0" class="no-badges">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <div class="participant-actions">
                  <el-button
                    v-if="row.status !== 'attended'"
                    type="success"
                    size="small"
                    @click="markSingleAttendance(row, true)"
                  >
                    标记参加
                  </el-button>
                  <el-button
                    v-if="row.status === 'attended'"
                    type="warning"
                    size="small"
                    @click="markSingleAttendance(row, false)"
                  >
                    取消参加
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showParticipantsDialog = false">关闭</el-button>
          <el-button type="primary" @click="refreshActivityData"> 刷新数据 </el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User, Search, Refresh } from '@element-plus/icons-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { contentManagementApi } from '@/services/contentManagementApi'
import type {
  ActivityManagementData,
  CreateActivityRequest,
  BatchAddParticipantsRequest,
  BatchAddParticipantsResult,
  ActivitySearchFilter,
  UserManagementData,
} from '@/types'

const router = useRouter()

// 响应式数据
const showCreateDialog = ref(false)
const showBatchAddDialog = ref(false)
const showBatchResultDialog = ref(false)
const showParticipantsDialog = ref(false)
const selectedActivity = ref<ActivityManagementData | null>(null)
const selectedParticipantIds = ref<string[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)
const batchResult = ref<BatchAddParticipantsResult | null>(null)

// 数据状态
const activityList = ref<ActivityManagementData[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 搜索表单
const searchForm = reactive<ActivitySearchFilter>({
  keyword: '',
  type: 'all',
  status: 'all',
  sortBy: 'newest',
  sortOrder: 'desc',
})

// 创建活动相关
const showCreateActivityDialog = ref(false)
const createLoading = ref(false)
const createFormRef = ref()
const createForm = reactive<CreateActivityRequest>({
  type: 'EmpathyStation',
  title: '',
  description: '',
  scheduledTime: new Date(),
  durationInMinutes: 60,
  xpReward: 50,
  frequency: 'daily',
  location: '',
  hostBy: '',
  capacity: undefined,
  tags: [],
})

const createRules = {
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' },
  ],
  scheduledTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  durationInMinutes: [{ required: true, message: '请输入持续时间', trigger: 'blur' }],
  xpReward: [{ required: true, message: '请输入经验奖励', trigger: 'blur' }],
  frequency: [{ required: true, message: '请选择活动频率', trigger: 'change' }],
}

// 批量添加参与者相关
const batchAddLoading = ref(false)
const selectedUserIds = ref<string[]>([])
const userSearchKeyword = ref('')
const availableUsers = ref<UserManagementData[]>([])
const batchOptions = reactive({
  autoAttend: false,
  sendNotification: true,
})

// 计算属性
const filteredUsers = computed(() => {
  if (!userSearchKeyword.value) return availableUsers.value

  const keyword = userSearchKeyword.value.toLowerCase()
  return availableUsers.value.filter(
    (user) => user.nickname.toLowerCase().includes(keyword) || user.phone.includes(keyword),
  )
})

// 方法
const loadActivityList = async () => {
  loading.value = true
  try {
    const response = await contentManagementApi.getActivityList(
      pagination.currentPage,
      pagination.pageSize,
      searchForm,
    )
    if (response.success && response.data) {
      activityList.value = response.data.activities
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.error || '获取活动列表失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadAvailableUsers = async () => {
  try {
    // 使用模拟用户数据
    availableUsers.value = [
      {
        userId: 'u1',
        nickname: '张小花',
        phone: '13800138001',
        passwordHash: 'hashed_password',
        role: 'user',
        avatarUrl: 'https://picsum.photos/64/64?random=1',
        joinDate: new Date('2024-01-15'),
        level: 3,
        xp: 850,
        xpForNextLevel: 1200,
        streak: { current: 7, lastPracticeDate: new Date() },
        badges: ['listener', 'empathy_beginner'],
        inventory: {},
        growthTree: { level: 3, elements: { leaves: 25, flowers: 8, fruits: 3 } },
        status: 'active',
        totalActivities: 12,
        totalPosts: 5,
      },
      {
        userId: 'u2',
        nickname: '李同理',
        phone: '13800138002',
        passwordHash: 'hashed_password',
        role: 'user',
        avatarUrl: 'https://picsum.photos/64/64?random=2',
        joinDate: new Date('2024-02-20'),
        level: 2,
        xp: 450,
        xpForNextLevel: 600,
        streak: { current: 3, lastPracticeDate: new Date() },
        badges: ['newcomer'],
        inventory: {},
        growthTree: { level: 2, elements: { leaves: 15, flowers: 4, fruits: 1 } },
        status: 'active',
        totalActivities: 8,
        totalPosts: 3,
      },
      {
        userId: 'u3',
        nickname: '赵静心',
        phone: '13800138003',
        passwordHash: 'hashed_password',
        role: 'user',
        avatarUrl: 'https://picsum.photos/64/64?random=3',
        joinDate: new Date('2024-03-10'),
        level: 4,
        xp: 1150,
        xpForNextLevel: 1500,
        streak: { current: 12, lastPracticeDate: new Date() },
        badges: ['listener', 'empathy_master', 'station_regular'],
        inventory: {},
        growthTree: { level: 4, elements: { leaves: 35, flowers: 12, fruits: 5 } },
        status: 'active',
        totalActivities: 18,
        totalPosts: 8,
      },
      {
        userId: 'u4',
        nickname: '王成长',
        phone: '13800138004',
        passwordHash: 'hashed_password',
        role: 'user',
        avatarUrl: 'https://picsum.photos/64/64?random=4',
        joinDate: new Date('2024-04-05'),
        level: 1,
        xp: 120,
        xpForNextLevel: 300,
        streak: { current: 1, lastPracticeDate: new Date() },
        badges: [],
        inventory: {},
        growthTree: { level: 1, elements: { leaves: 5, flowers: 1, fruits: 0 } },
        status: 'active',
        totalActivities: 2,
        totalPosts: 1,
      },
    ]
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadActivityList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadActivityList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadActivityList()
}

const handleSelectionChange = (selection: ActivityManagementData[]) => {
  // 处理表格选择变化
}

const getActivityTypeColor = (type: string) => {
  const colors = {
    EmpathyStation: 'success',
    ThemeSalon: 'warning',
    LifeGrowth: 'danger',
  }
  return colors[type as keyof typeof colors] || 'info'
}

const getActivityTypeName = (type: string) => {
  const names = {
    EmpathyStation: '同理心驿站',
    ThemeSalon: '主题沙龙',
    LifeGrowth: '生命成长',
  }
  return names[type as keyof typeof names] || type
}

const getStatusType = (status: string) => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger',
  }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status as keyof typeof texts] || status
}

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 创建活动
const handleCreateActivity = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    createLoading.value = true

    const response = await contentManagementApi.createActivity(createForm)
    if (response.success) {
      ElMessage.success('活动创建成功')
      showCreateActivityDialog.value = false
      // 重置表单
      Object.assign(createForm, {
        type: 'EmpathyStation',
        title: '',
        description: '',
        scheduledTime: new Date(),
        durationInMinutes: 60,
        xpReward: 50,
        frequency: 'daily',
        location: '',
        hostBy: '',
        capacity: undefined,
        tags: [],
      })
      loadActivityList()
    } else {
      ElMessage.error(response.error || '创建活动失败')
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    createLoading.value = false
  }
}

// 查看活动详情
const viewActivityDetail = (activityId: string) => {
  // router.push(`/admin/content/activities/${activityId}`)
  ElMessage.info('活动详情页面开发中')
}

// 编辑活动
const editActivity = (activity: ActivityManagementData) => {
  // router.push(`/admin/content/activities/${activity.activityId}/edit`)
  ElMessage.info('活动编辑功能开发中')
}

// 删除活动
const deleteActivity = async (activityId: string) => {
  try {
    const response = await contentManagementApi.deleteActivity(activityId)
    if (response.success) {
      ElMessage.success('活动删除成功')
      loadActivityList()
    } else {
      ElMessage.error(response.error || '删除活动失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 打开批量添加对话框
const openBatchAddDialog = (activity: ActivityManagementData) => {
  selectedActivity.value = activity
  selectedUserIds.value = []
  userSearchKeyword.value = ''
  batchOptions.autoAttend = false
  batchOptions.sendNotification = true
  showBatchAddDialog.value = true

  if (availableUsers.value.length === 0) {
    loadAvailableUsers()
  }
}

// 检查用户是否已经参与
const isUserAlreadyParticipant = (userId: string) => {
  if (!selectedActivity.value) return false
  return selectedActivity.value.participants.some((p) => p.userId === userId)
}

// 用户搜索
const handleUserSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 全选用户
const selectAllUsers = () => {
  selectedUserIds.value = filteredUsers.value
    .filter((user) => !isUserAlreadyParticipant(user.userId))
    .map((user) => user.userId)
}

// 清空选择
const clearUserSelection = () => {
  selectedUserIds.value = []
}

// 批量添加参与者
const handleBatchAddParticipants = async () => {
  if (!selectedActivity.value || selectedUserIds.value.length === 0) {
    ElMessage.warning('请选择要添加的用户')
    return
  }

  batchAddLoading.value = true
  try {
    const request: BatchAddParticipantsRequest = {
      activityId: selectedActivity.value.activityId,
      userIds: selectedUserIds.value,
      autoAttend: batchOptions.autoAttend,
      sendNotification: batchOptions.sendNotification,
    }

    const response = await contentManagementApi.batchAddParticipants(request)
    if (response.success) {
      batchResult.value = response
      showBatchResultDialog.value = true

      // 刷新活动列表
      await loadActivityList()

      // 清空选择
      selectedUserIds.value = []
      userSearchKeyword.value = ''
      batchOptions.autoAttend = false
      batchOptions.sendNotification = true

      ElMessage.success(
        `批量添加完成：成功 ${response.successCount} 个，失败 ${response.failureCount} 个`,
      )
    } else {
      ElMessage.error(response.error || '批量添加失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    batchAddLoading.value = false
  }
}

// 查看参与者
const viewParticipants = async (activity: ActivityManagementData) => {
  try {
    loading.value = true
    // 获取活动详细信息和参与者列表
    const activityDetail = await contentManagementApi.getActivityById(activity.activityId)
    selectedActivity.value = activityDetail
    showParticipantsDialog.value = true
  } catch (error) {
    console.error('获取参与者信息失败:', error)
    ElMessage.error('获取参与者信息失败')
  } finally {
    loading.value = false
  }
}

// 处理参与者选择变化
const handleParticipantSelectionChange = (selection: any[]) => {
  selectedParticipantIds.value = selection.map((item) => item.userId)
}

// 获取参与者状态类型
const getParticipantStatusType = (status: string) => {
  const types = {
    registered: 'primary',
    attended: 'success',
    absent: 'warning',
    cancelled: 'danger',
  }
  return types[status as keyof typeof types] || 'info'
}

// 获取参与者状态文本
const getParticipantStatusText = (status: string) => {
  const texts = {
    registered: '已报名',
    attended: '已参加',
    absent: '缺席',
    cancelled: '已取消',
  }
  return texts[status as keyof typeof texts] || status
}

// 标记单个参与者参与状态
const markSingleAttendance = async (participant: any, markAsAttended: boolean) => {
  try {
    const result = await contentManagementApi.markParticipantAttendance(
      selectedActivity.value!.activityId,
      participant.userId,
      markAsAttended,
    )

    if (result.success) {
      // 更新本地数据
      participant.status = markAsAttended ? 'attended' : 'registered'
      participant.attendedAt = markAsAttended ? new Date().toISOString() : null
      participant.xpEarned = markAsAttended ? result.xpEarned : 0
      participant.badgesEarned = markAsAttended ? result.badgesEarned : []

      ElMessage.success(
        markAsAttended
          ? `已标记 ${participant.userName} 为参加状态，获得 ${result.xpEarned}XP`
          : `已取消 ${participant.userName} 的参加状态`,
      )

      // 刷新活动统计
      await refreshActivityData()
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error) {
    console.error('标记参与状态失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 批量标记参与状态
const batchMarkAttendance = async (markAsAttended: boolean) => {
  if (selectedParticipantIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的参与者')
    return
  }

  try {
    const result = await contentManagementApi.batchMarkAttendance(
      selectedActivity.value!.activityId,
      selectedParticipantIds.value,
      markAsAttended,
    )

    if (result.success) {
      // 更新本地数据
      selectedActivity.value!.participants.forEach((participant) => {
        if (selectedParticipantIds.value.includes(participant.userId)) {
          const participantResult = result.results.find((r: any) => r.userId === participant.userId)
          if (participantResult && participantResult.success) {
            participant.status = markAsAttended ? 'attended' : 'registered'
            participant.attendedAt = markAsAttended ? new Date() : undefined
            participant.xpEarned = markAsAttended ? participantResult.xpEarned : 0
            participant.badgesEarned = markAsAttended ? participantResult.badgesEarned : []
          }
        }
      })

      ElMessage.success(
        `批量操作完成：成功 ${result.successCount} 个，失败 ${result.failureCount} 个`,
      )

      // 清空选择
      selectedParticipantIds.value = []

      // 刷新活动统计
      await refreshActivityData()
    } else {
      ElMessage.error('批量操作失败')
    }
  } catch (error) {
    console.error('批量标记参与状态失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 刷新活动数据
const refreshActivityData = async () => {
  if (!selectedActivity.value) return

  try {
    const activityDetail = await contentManagementApi.getActivityById(
      selectedActivity.value.activityId,
    )
    selectedActivity.value = activityDetail

    // 同时刷新活动列表中的数据
    const index = activityList.value.findIndex(
      (a) => a.activityId === selectedActivity.value!.activityId,
    )
    if (index !== -1) {
      activityList.value[index] = { ...activityDetail }
    }
  } catch (error) {
    console.error('刷新活动数据失败:', error)
    ElMessage.error('刷新数据失败')
  }
}

// 初始化
onMounted(() => {
  loadActivityList()
})
</script>

<style scoped>
.content-management {
  padding: 20px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.management-title {
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
}

.search-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.activity-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.activity-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.activity-title {
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
  margin: 0;
}

.activity-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.activity-description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.activity-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.activity-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.batch-result {
  margin-bottom: 20px;
}

.result-details {
  margin-top: 16px;
}

.result-details h4 {
  margin-bottom: 12px;
  color: #2e7d32;
}

.badge-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.batch-add-form {
  margin-bottom: 20px;
}

.user-selection {
  margin-bottom: 16px;
}

.user-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f5f5f5;
}

.user-item.selected {
  background-color: #e8f5e9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.selection-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.auto-attend-option {
  margin-bottom: 16px;
}

/* 参与者管理对话框样式 */
.participants-management {
  padding: 0;
}

.activity-summary {
  margin-bottom: 20px;
}

.activity-summary h4 {
  margin: 0 0 12px 0;
  color: #2e7d32;
  font-size: 18px;
}

.activity-stats {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 14px;
  color: #666;
}

.participants-list {
  margin-top: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h4 {
  margin: 0;
  color: #2e7d32;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participant-details {
  flex: 1;
}

.participant-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.participant-id {
  font-size: 12px;
  color: #999;
}

.participant-actions {
  display: flex;
  gap: 4px;
}

.xp-earned {
  font-weight: 500;
  color: #4caf50;
}

.no-badges {
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .activity-meta,
  .activity-stats,
  .activity-actions {
    flex-direction: column;
    gap: 8px;
  }

  .batch-actions {
    flex-direction: column;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
