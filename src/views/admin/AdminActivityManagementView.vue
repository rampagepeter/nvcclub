<template>
  <AdminLayout>
    <div class="admin-activity-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>活动管理</h1>
        <p>管理所有活动，设置推荐活动</p>
      </div>

      <!-- 操作工具栏 -->
      <div class="toolbar">
        <div class="search-filters">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索活动标题..."
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="typeFilter" placeholder="活动类型" @change="handleSearch">
            <el-option label="全部类型" value="all" />
            <el-option label="同理心驿站" value="EmpathyStation" />
            <el-option label="主题沙龙" value="ThemeSalon" />
            <el-option label="刘轶说生命成长" value="LifeGrowth" />
          </el-select>
          
          <el-select v-model="statusFilter" placeholder="活动状态" @change="handleSearch">
            <el-option label="全部状态" value="all" />
            <el-option label="即将开始" value="upcoming" />
            <el-option label="正在进行" value="ongoing" />
            <el-option label="已结束" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
        
        <el-button type="primary" @click="handleCreateActivity">
          <el-icon><Plus /></el-icon>
          创建活动
        </el-button>
      </div>

      <!-- 活动列表 -->
      <div class="activity-list">
        <el-table
          :data="activities"
          v-loading="loading"
          class="activity-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="title" label="活动标题" min-width="200">
            <template #default="{ row }">
              <div class="activity-title">
                <span class="title-text">{{ row.title }}</span>
                <el-tag
                  v-if="row.isRecommended"
                  type="warning"
                  size="small"
                  class="recommended-tag"
                >
                  推荐
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getActivityTypeTag(row.type)">
                {{ getActivityTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="scheduledTime" label="活动时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.scheduledTime) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="participants" label="参与人数" width="120">
            <template #default="{ row }">
              <span>{{ row.participants?.length || 0 }}/{{ row.capacity || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleEditActivity(row)"
              >
                编辑
              </el-button>
              
              <el-button
                v-if="!row.isRecommended"
                type="warning"
                size="small"
                @click="handleSetRecommended(row, true)"
              >
                设为推荐
              </el-button>
              
              <el-button
                v-else
                type="info"
                size="small"
                @click="handleSetRecommended(row, false)"
              >
                取消推荐
              </el-button>
              
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteActivity(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 创建/编辑活动对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogMode === 'create' ? '创建活动' : '编辑活动'"
        width="600px"
        @closed="resetForm"
      >
        <el-form
          ref="formRef"
          :model="activityForm"
          :rules="formRules"
          label-width="100px"
        >
          <el-form-item label="活动标题" prop="title">
            <el-input v-model="activityForm.title" placeholder="请输入活动标题" />
          </el-form-item>
          
          <el-form-item label="活动类型" prop="type">
            <el-select v-model="activityForm.type" placeholder="请选择活动类型" style="width: 100%">
              <el-option label="同理心驿站" value="EmpathyStation" />
              <el-option label="主题沙龙" value="ThemeSalon" />
              <el-option label="刘轶说生命成长" value="LifeGrowth" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="活动描述" prop="description">
            <el-input
              v-model="activityForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入活动描述"
            />
          </el-form-item>
          
          <el-form-item label="详细内容" prop="content">
            <el-input
              v-model="activityForm.content"
              type="textarea"
              :rows="5"
              placeholder="请输入活动详细内容"
            />
          </el-form-item>
          
          <el-form-item label="活动时间" prop="scheduledTime">
            <el-date-picker
              v-model="activityForm.scheduledTime"
              type="datetime"
              placeholder="选择活动时间"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="活动时长" prop="durationInMinutes">
            <el-input-number
              v-model="activityForm.durationInMinutes"
              :min="30"
              :max="480"
              :step="30"
              style="width: 100%"
            />
            <span class="form-note">分钟</span>
          </el-form-item>
          
          <el-form-item label="活动地点" prop="location">
            <el-input v-model="activityForm.location" placeholder="请输入活动地点" />
          </el-form-item>
          
          <el-form-item label="主持人" prop="hostBy">
            <el-input v-model="activityForm.hostBy" placeholder="请输入主持人" />
          </el-form-item>
          
          <el-form-item label="容纳人数" prop="capacity">
            <el-input-number
              v-model="activityForm.capacity"
              :min="1"
              :max="1000"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="经验奖励" prop="xpReward">
            <el-input-number
              v-model="activityForm.xpReward"
              :min="10"
              :max="1000"
              :step="10"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="设为推荐">
            <el-switch v-model="activityForm.isRecommended" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              {{ dialogMode === 'create' ? '创建' : '保存' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { activityApi } from '@/services/api'
import AdminLayout from '@/components/AdminLayout.vue'
import type { Activity } from '@/types'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const activities = ref<Activity[]>([])
const selectedActivities = ref<Activity[]>([])

// 搜索和筛选
const searchKeyword = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()

// 表单数据
const activityForm = reactive({
  activityId: '',
  title: '',
  type: '' as 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth' | '',
  description: '',
  content: '',
  scheduledTime: null as Date | null,
  durationInMinutes: 60,
  location: '',
  hostBy: '',
  capacity: 30,
  xpReward: 50,
  frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
  status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  isRecommended: false,
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  scheduledTime: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  durationInMinutes: [{ required: true, message: '请输入活动时长', trigger: 'blur' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  hostBy: [{ required: true, message: '请输入主持人', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入容纳人数', trigger: 'blur' }],
  xpReward: [{ required: true, message: '请输入经验奖励', trigger: 'blur' }],
}

// 方法
const getActivityTypeName = (type: string) => {
  const names = {
    EmpathyStation: '同理心驿站',
    ThemeSalon: '主题沙龙',
    LifeGrowth: '刘轶说生命成长',
  }
  return names[type as keyof typeof names] || '未知类型'
}

const getActivityTypeTag = (type: string) => {
  const tags = {
    EmpathyStation: 'success',
    ThemeSalon: 'warning',
    LifeGrowth: 'danger',
  }
  return tags[type as keyof typeof tags] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    upcoming: '即将开始',
    ongoing: '正在进行',
    completed: '已结束',
    cancelled: '已取消',
  }
  return texts[status as keyof typeof texts] || '未知状态'
}

const getStatusTag = (status: string) => {
  const tags = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger',
  }
  return tags[status as keyof typeof tags] || 'info'
}

const formatDateTime = (dateTime: Date | string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadActivities = async () => {
  loading.value = true
  try {
    const response = await activityApi.getActivities()
    if (response.success) {
      activities.value = response.data || []
      total.value = activities.value.length
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 实现搜索和筛选逻辑
  loadActivities()
}

const handleSelectionChange = (selection: Activity[]) => {
  selectedActivities.value = selection
}

const handleCreateActivity = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const handleEditActivity = (activity: Activity) => {
  dialogMode.value = 'edit'
  Object.assign(activityForm, activity)
  dialogVisible.value = true
}

const handleSetRecommended = async (activity: Activity, isRecommended: boolean) => {
  try {
    await ElMessageBox.confirm(
      `确定要${isRecommended ? '设为推荐' : '取消推荐'}活动"${activity.title}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用API更新推荐状态
    const response = await activityApi.updateActivityRecommendation(activity.activityId, isRecommended)
    
    if (response.success) {
      // 更新本地活动数据的推荐状态
      const activityIndex = activities.value.findIndex(a => a.activityId === activity.activityId)
      if (activityIndex !== -1) {
        activities.value[activityIndex].isRecommended = isRecommended
      }
      
      ElMessage.success(response.message || `${isRecommended ? '设为推荐' : '取消推荐'}成功`)
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('设置推荐状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleDeleteActivity = async (activity: Activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${activity.title}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 这里应该调用API删除活动
    ElMessage.success('删除成功')
    await loadActivities()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 这里应该调用API创建或更新活动
    ElMessage.success(dialogMode.value === 'create' ? '创建成功' : '更新成功')
    dialogVisible.value = false
    await loadActivities()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(activityForm, {
    activityId: '',
    title: '',
    type: '',
    description: '',
    content: '',
    scheduledTime: null,
    durationInMinutes: 60,
    location: '',
    hostBy: '',
    capacity: 30,
    xpReward: 50,
    frequency: 'daily',
    status: 'upcoming',
    isRecommended: false,
  })
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  loadActivities()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadActivities()
}

// 生命周期
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.admin-activity-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 48px);
  margin-left: 260px; /* 为侧边栏留出空间 */
}

.page-header {
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 16px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .search-filters {
    display: flex;
    gap: 16px;
    align-items: center;

    .search-input {
      width: 300px;
    }
  }
}

.activity-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-table {
  .activity-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-text {
      font-weight: 500;
    }

    .recommended-tag {
      flex-shrink: 0;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.form-note {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-activity-management {
    padding: 16px;
    margin-left: 0;
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;

    .search-filters {
      width: 100%;
      flex-wrap: wrap;

      .search-input {
        width: 100%;
      }
    }
  }
}
</style> 