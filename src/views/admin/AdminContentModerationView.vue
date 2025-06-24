<template>
  <AdminLayout>
    <div class="content-moderation">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1>🛡️ 内容审核</h1>
          <p>管理社区动态内容，处理举报和违规内容</p>
        </div>
        <div class="header-stats">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-number">{{ moderationStats.pendingCount }}</span>
              <span class="stat-label">待审核</span>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-number">{{ moderationStats.reportedCount }}</span>
              <span class="stat-label">被举报</span>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-number">{{ moderationStats.todayProcessed }}</span>
              <span class="stat-label">今日处理</span>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <el-card>
          <div class="filter-form">
            <div class="filter-row">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索内容、作者或标签"
                clearable
                @input="handleSearch"
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="searchForm.status"
                placeholder="审核状态"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="已删除" value="deleted" />
              </el-select>

              <el-select
                v-model="searchForm.contentType"
                placeholder="内容类型"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="动态" value="post" />
                <el-option label="评论" value="comment" />
              </el-select>

              <el-select
                v-model="searchForm.hasReports"
                placeholder="举报状态"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="有举报" value="true" />
                <el-option label="无举报" value="false" />
              </el-select>

              <el-select
                v-model="searchForm.sortBy"
                placeholder="排序方式"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="最新创建" value="newest" />
                <el-option label="最多举报" value="most_reported" />
                <el-option label="待处理优先" value="pending_first" />
              </el-select>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 批量操作栏 -->
      <div v-if="selectedItems.length > 0" class="batch-actions">
        <el-card>
          <div class="batch-toolbar">
            <span class="selection-info">已选择 {{ selectedItems.length }} 项</span>
            <div class="batch-buttons">
              <el-button type="success" @click="batchApprove">
                <el-icon><Check /></el-icon>
                批量通过
              </el-button>
              <el-button type="warning" @click="batchReject">
                <el-icon><Close /></el-icon>
                批量拒绝
              </el-button>
              <el-button type="danger" @click="batchDelete">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
              <el-button @click="clearSelection">清空选择</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 内容列表 -->
      <div class="content-list">
        <el-card>
          <template #header>
            <div class="list-header">
              <span>内容列表 (共 {{ pagination.total }} 项)</span>
              <div class="list-actions">
                <el-button size="small" @click="loadContentList">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <div v-loading="loading" class="content-items">
            <div
              v-for="item in contentList"
              :key="item.itemId"
              class="content-item"
              :class="{ selected: selectedItems.includes(item.itemId) }"
              @click="toggleSelection(item.itemId)"
            >
              <!-- 选择框 -->
              <div class="item-checkbox">
                <el-checkbox
                  :model-value="selectedItems.includes(item.itemId)"
                  @change="toggleSelection(item.itemId)"
                />
              </div>

              <!-- 内容主体 -->
              <div class="item-content">
                <div class="content-header">
                  <div class="author-info">
                    <el-avatar :src="item.authorAvatar" :size="32">
                      {{ item.authorName[0] }}
                    </el-avatar>
                    <div class="author-details">
                      <span class="author-name">{{ item.authorName }}</span>
                      <span class="content-type">{{ getContentTypeText(item.itemType) }}</span>
                    </div>
                  </div>
                  <div class="content-meta">
                    <el-tag :type="getStatusType(item.status)" size="small">
                      {{ getStatusText(item.status) }}
                    </el-tag>
                    <span class="create-time">{{ formatDateTime(item.createdAt) }}</span>
                  </div>
                </div>

                <div class="content-body">
                  <h4 class="content-title">{{ item.title }}</h4>
                  <p class="content-text">{{ item.content }}</p>

                  <!-- 标签 -->
                  <div v-if="item.tags && item.tags.length > 0" class="content-tags">
                    <el-tag v-for="tag in item.tags" :key="tag" size="small" class="tag-item">
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>

                <!-- 举报信息 -->
                <div v-if="item.reportCount > 0" class="report-info">
                  <el-alert
                    :title="`收到 ${item.reportCount} 个举报`"
                    type="warning"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <div class="report-details">
                        <span
                          v-for="report in item.reports.slice(0, 3)"
                          :key="report.reportId"
                          class="report-reason"
                        >
                          {{ getReportReasonText(report.reason) }}
                        </span>
                        <el-button
                          v-if="item.reports.length > 3"
                          type="text"
                          size="small"
                          @click="viewAllReports(item)"
                        >
                          查看全部举报
                        </el-button>
                      </div>
                    </template>
                  </el-alert>
                </div>

                <!-- 审核信息 -->
                <div v-if="item.moderatorName" class="moderation-info">
                  <span class="moderator">审核人：{{ item.moderatorName }}</span>
                  <span class="moderate-time">{{
                    item.moderatedAt ? formatDateTime(item.moderatedAt) : '未处理'
                  }}</span>
                  <span v-if="item.moderationReason" class="moderate-reason">
                    原因：{{ item.moderationReason }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="item-actions">
                <el-button
                  v-if="item.status === 'pending'"
                  type="success"
                  size="small"
                  @click.stop="approveContent(item)"
                >
                  通过
                </el-button>
                <el-button
                  v-if="item.status === 'pending'"
                  type="warning"
                  size="small"
                  @click.stop="rejectContent(item)"
                >
                  拒绝
                </el-button>
                <el-button type="info" size="small" @click.stop="viewContentDetail(item)">
                  详情
                </el-button>
                <el-button type="danger" size="small" @click.stop="deleteContent(item)">
                  删除
                </el-button>
              </div>
            </div>
          </div>

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

    <!-- 审核操作对话框 -->
    <el-dialog
      v-model="showModerationDialog"
      :title="moderationAction === 'approve' ? '审核通过' : '审核拒绝'"
      width="500px"
    >
      <el-form :model="moderationForm" label-width="80px">
        <el-form-item label="审核原因">
          <el-input
            v-model="moderationForm.reason"
            type="textarea"
            :rows="3"
            :placeholder="moderationAction === 'approve' ? '通过原因（可选）' : '拒绝原因（必填）'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showModerationDialog = false">取消</el-button>
          <el-button type="primary" :loading="moderationLoading" @click="confirmModeration">
            确认{{ moderationAction === 'approve' ? '通过' : '拒绝' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 举报详情对话框 -->
    <el-dialog v-model="showReportsDialog" title="举报详情" width="700px">
      <div v-if="selectedContentItem" class="reports-detail">
        <div class="content-summary">
          <h4>被举报内容</h4>
          <p>{{ selectedContentItem.content }}</p>
        </div>

        <el-divider />

        <div class="reports-list">
          <h4>举报记录 ({{ selectedContentItem.reports.length }})</h4>
          <div
            v-for="report in selectedContentItem.reports"
            :key="report.reportId"
            class="report-item"
          >
            <div class="report-header">
              <span class="reporter">{{ report.reporterName }}</span>
              <span class="report-time">{{ formatDateTime(report.reportedAt) }}</span>
            </div>
            <div class="report-content">
              <el-tag :type="getReportReasonType(report.reason)" size="small">
                {{ getReportReasonText(report.reason) }}
              </el-tag>
              <p class="report-description">{{ report.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showReportsDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Check, Close, Delete, Refresh } from '@element-plus/icons-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { contentModerationApi } from '@/services/contentModerationApi'
import type {
  ContentModerationItemExtended,
  ModerationStats,
  ModerationSearchFilter,
} from '@/types'

// 响应式数据
const loading = ref(false)
const contentList = ref<ContentModerationItemExtended[]>([])
const selectedItems = ref<string[]>([])
const selectedContentItem = ref<ContentModerationItemExtended | null>(null)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: 'all',
  contentType: 'all',
  hasReports: 'all',
  sortBy: 'newest',
})

// 审核统计
const moderationStats = reactive<ModerationStats>({
  pendingCount: 0,
  reportedCount: 0,
  todayProcessed: 0,
  weeklyProcessed: 0,
  monthlyProcessed: 0,
  averageProcessingTime: 0,
  topReportReasons: [],
})

// 审核对话框
const showModerationDialog = ref(false)
const moderationAction = ref<'approve' | 'reject'>('approve')
const moderationLoading = ref(false)
const moderationForm = reactive({
  reason: '',
})

// 举报详情对话框
const showReportsDialog = ref(false)

// 方法
const loadContentList = async () => {
  loading.value = true
  try {
    const searchParams: ModerationSearchFilter = {
      keyword: searchForm.keyword || undefined,
      status: searchForm.status as
        | 'all'
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'deleted'
        | undefined,
      contentType: searchForm.contentType as 'all' | 'post' | 'comment' | 'activity' | undefined,
      hasReports: searchForm.hasReports as 'true' | 'false' | 'all' | undefined,
      sortBy: searchForm.sortBy as
        | 'newest'
        | 'oldest'
        | 'most_reported'
        | 'pending_first'
        | undefined,
    }

    const response = await contentModerationApi.getContentList(
      searchParams,
      pagination.currentPage,
      pagination.pageSize,
    )

    if (response.success && response.data) {
      contentList.value = response.data.items
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.error || '加载内容列表失败')
    }
  } catch (error) {
    ElMessage.error('加载内容列表失败')
  } finally {
    loading.value = false
  }
}

const loadModerationStats = async () => {
  try {
    const response = await contentModerationApi.getModerationStats()
    if (response.success && response.data) {
      Object.assign(moderationStats, response.data)
    }
  } catch (error) {
    console.error('加载审核统计失败:', error)
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadContentList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadContentList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadContentList()
}

const toggleSelection = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

const clearSelection = () => {
  selectedItems.value = []
}

const approveContent = (item: ContentModerationItemExtended) => {
  moderationAction.value = 'approve'
  selectedContentItem.value = item
  moderationForm.reason = ''
  showModerationDialog.value = true
}

const rejectContent = (item: ContentModerationItemExtended) => {
  moderationAction.value = 'reject'
  selectedContentItem.value = item
  moderationForm.reason = ''
  showModerationDialog.value = true
}

const confirmModeration = async () => {
  if (moderationAction.value === 'reject' && !moderationForm.reason.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }

  if (!selectedContentItem.value) return

  moderationLoading.value = true
  try {
    const response = await contentModerationApi.moderateContent(
      selectedContentItem.value.itemId,
      moderationAction.value,
      moderationForm.reason,
    )

    if (response.success) {
      ElMessage.success(
        response.message || `内容${moderationAction.value === 'approve' ? '通过' : '拒绝'}成功`,
      )
      showModerationDialog.value = false
      await loadContentList()
      await loadModerationStats()
    } else {
      ElMessage.error(response.error || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    moderationLoading.value = false
  }
}

const batchApprove = async () => {
  if (selectedItems.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要批量通过选中的 ${selectedItems.value.length} 项内容吗？`,
      '批量通过',
      {
        type: 'warning',
      },
    )

    const response = await contentModerationApi.batchModerateContent({
      itemIds: selectedItems.value,
      action: 'approve',
    })

    if (response.success && response.data) {
      ElMessage.success(`批量通过 ${response.data.successCount} 项内容`)
      clearSelection()
      await loadContentList()
      await loadModerationStats()
    } else {
      ElMessage.error('批量操作失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const batchReject = async () => {
  if (selectedItems.value.length === 0) return

  try {
    const reason = await ElMessageBox.prompt('请输入拒绝原因', '批量拒绝', {
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '请输入拒绝原因'
        }
        return true
      },
    })

    const response = await contentModerationApi.batchModerateContent({
      itemIds: selectedItems.value,
      action: 'reject',
      reason: reason.value,
    })

    if (response.success && response.data) {
      ElMessage.success(`批量拒绝 ${response.data.successCount} 项内容`)
      clearSelection()
      await loadContentList()
      await loadModerationStats()
    } else {
      ElMessage.error('批量操作失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const batchDelete = async () => {
  if (selectedItems.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 项内容吗？此操作不可恢复！`,
      '批量删除',
      {
        type: 'error',
      },
    )

    const response = await contentModerationApi.batchModerateContent({
      itemIds: selectedItems.value,
      action: 'delete',
    })

    if (response.success && response.data) {
      ElMessage.success(`批量删除 ${response.data.successCount} 项内容`)
      clearSelection()
      await loadContentList()
      await loadModerationStats()
    } else {
      ElMessage.error('批量操作失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const deleteContent = async (item: ContentModerationItemExtended) => {
  try {
    await ElMessageBox.confirm('确定要删除这项内容吗？此操作不可恢复！', '删除内容', {
      type: 'error',
    })

    const response = await contentModerationApi.deleteContent(item.itemId)

    if (response.success) {
      ElMessage.success(response.message || '内容删除成功')
      await loadContentList()
      await loadModerationStats()
    } else {
      ElMessage.error(response.error || '删除失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const viewContentDetail = (item: ContentModerationItemExtended) => {
  // 跳转到内容详情页面或打开详情对话框
  ElMessage.info('内容详情功能开发中')
}

const viewAllReports = (item: ContentModerationItemExtended) => {
  selectedContentItem.value = item
  showReportsDialog.value = true
}

// 辅助方法
const getContentTypeText = (type: string) => {
  const types = {
    post: '动态',
    comment: '评论',
    activity: '活动',
  }
  return types[type as keyof typeof types] || type
}

const getStatusType = (status: string) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    deleted: 'info',
  }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    deleted: '已删除',
  }
  return texts[status as keyof typeof texts] || status
}

const getReportReasonText = (reason: string) => {
  const reasons = {
    spam: '垃圾信息',
    inappropriate: '不当内容',
    harassment: '骚扰辱骂',
    false_info: '虚假信息',
    other: '其他',
  }
  return reasons[reason as keyof typeof reasons] || reason
}

const getReportReasonType = (reason: string) => {
  const types = {
    spam: 'warning',
    inappropriate: 'danger',
    harassment: 'danger',
    false_info: 'warning',
    other: 'info',
  }
  return types[reason as keyof typeof types] || 'info'
}

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(async () => {
  await Promise.all([loadContentList(), loadModerationStats()])
})
</script>

<style scoped>
.content-moderation {
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

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  min-width: 120px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-form {
  padding: 20px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.batch-actions {
  margin-bottom: 24px;
}

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.selection-info {
  font-weight: 500;
  color: #2e7d32;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

.content-list {
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.content-items {
  min-height: 400px;
}

.content-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 16px;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.content-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2e7d32;
}

.content-item.selected {
  border-color: #2e7d32;
  background: #f8fff9;
}

.item-checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.item-content {
  flex: 1;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.content-type {
  font-size: 12px;
  color: #666;
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-time {
  font-size: 12px;
  color: #999;
}

.content-body {
  margin-bottom: 16px;
}

.content-title {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.content-text {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.6;
}

.content-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-item {
  margin: 0;
}

.report-info {
  margin-bottom: 16px;
}

.report-details {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.report-reason {
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
}

.moderation-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
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

/* 举报详情样式 */
.reports-detail {
  padding: 20px 0;
}

.content-summary h4 {
  margin: 0 0 12px 0;
  color: #2e7d32;
}

.content-summary p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.reports-list h4 {
  margin: 0 0 16px 0;
  color: #2e7d32;
}

.report-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reporter {
  font-weight: 500;
  color: #333;
}

.report-time {
  font-size: 12px;
  color: #999;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-description {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-moderation {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-stats {
    justify-content: space-around;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row > * {
    width: 100% !important;
  }

  .batch-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .batch-buttons {
    justify-content: center;
  }

  .content-item {
    flex-direction: column;
    gap: 12px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .item-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
