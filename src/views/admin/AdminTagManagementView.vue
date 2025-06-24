<template>
  <AdminLayout>
    <div class="tag-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1>🏷️ 标签管理</h1>
          <p>管理社区标签系统，维护标签分类和状态</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建标签
          </el-button>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <el-card>
          <div class="filter-form">
            <div class="filter-row">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索标签名称或描述"
                clearable
                @input="handleSearch"
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="searchForm.category"
                placeholder="标签分类"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="NVC" value="nvc" />
                <el-option label="情绪" value="emotion" />
                <el-option label="技能" value="skill" />
                <el-option label="活动" value="activity" />
                <el-option label="通用" value="general" />
              </el-select>

              <el-select
                v-model="searchForm.isOfficial"
                placeholder="标签类型"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" :value="undefined" />
                <el-option label="官方标签" :value="true" />
                <el-option label="用户标签" :value="false" />
              </el-select>

              <el-select
                v-model="searchForm.status"
                placeholder="标签状态"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="全部" value="all" />
                <el-option label="活跃" value="active" />
                <el-option label="已废弃" value="deprecated" />
                <el-option label="已禁用" value="banned" />
              </el-select>

              <el-select
                v-model="searchForm.sortBy"
                placeholder="排序方式"
                @change="handleSearch"
                style="width: 150px"
              >
                <el-option label="使用频率" value="usage" />
                <el-option label="最新创建" value="newest" />
                <el-option label="字母顺序" value="alphabetical" />
              </el-select>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 标签列表 -->
      <div class="tag-list">
        <el-card>
          <template #header>
            <div class="list-header">
              <span>标签列表 (共 {{ pagination.total }} 个)</span>
              <div class="list-actions">
                <el-button size="small" @click="loadTagList">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <div v-loading="loading" class="tag-items">
            <div v-for="tag in tagList" :key="tag.tagId" class="tag-item">
              <!-- 标签信息 -->
              <div class="tag-content">
                <div class="tag-header">
                  <div class="tag-name-section">
                    <h4 class="tag-name">{{ tag.name }}</h4>
                    <div class="tag-badges">
                      <el-tag :type="getCategoryType(tag.category)" size="small">
                        {{ getCategoryText(tag.category) }}
                      </el-tag>
                      <el-tag v-if="tag.isOfficial" type="success" size="small"> 官方 </el-tag>
                      <el-tag :type="getStatusType(tag.status)" size="small">
                        {{ getStatusText(tag.status) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="tag-stats">
                    <span class="usage-count">使用次数: {{ tag.usageCount }}</span>
                    <span class="create-time">{{ formatDateTime(tag.createdAt) }}</span>
                  </div>
                </div>

                <div class="tag-body">
                  <p v-if="tag.description" class="tag-description">{{ tag.description }}</p>
                  <div class="tag-meta">
                    <span class="creator">创建者: {{ tag.createdBy }}</span>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="tag-actions">
                <el-button size="small" @click="viewTagContent(tag)"> 查看内容 </el-button>
                <el-button size="small" @click="editTag(tag)"> 编辑 </el-button>
                <el-button
                  v-if="tag.status === 'active'"
                  type="warning"
                  size="small"
                  @click="deprecateTag(tag)"
                >
                  废弃
                </el-button>
                <el-button
                  v-if="tag.status === 'deprecated'"
                  type="success"
                  size="small"
                  @click="activateTag(tag)"
                >
                  激活
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteTag(tag)"
                  :disabled="tag.usageCount > 0"
                >
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

    <!-- 创建/编辑标签对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingTag ? '编辑标签' : '创建标签'"
      width="500px"
    >
      <el-form :model="tagForm" :rules="tagFormRules" ref="tagFormRef" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>

        <el-form-item label="标签描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述（可选）"
          />
        </el-form-item>

        <el-form-item label="标签分类" prop="category">
          <el-select v-model="tagForm.category" placeholder="请选择标签分类" style="width: 100%">
            <el-option label="NVC" value="nvc" />
            <el-option label="情绪" value="emotion" />
            <el-option label="技能" value="skill" />
            <el-option label="活动" value="activity" />
            <el-option label="通用" value="general" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签类型">
          <el-switch v-model="tagForm.isOfficial" active-text="官方标签" inactive-text="用户标签" />
        </el-form-item>

        <el-form-item v-if="editingTag" label="标签状态" prop="status">
          <el-select v-model="tagForm.status" placeholder="请选择标签状态" style="width: 100%">
            <el-option label="活跃" value="active" />
            <el-option label="已废弃" value="deprecated" />
            <el-option label="已禁用" value="banned" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitTag">
            {{ editingTag ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看标签内容对话框 -->
    <el-dialog
      v-model="showContentDialog"
      :title="`标签内容 - ${selectedTag?.name}`"
      width="800px"
      top="50px"
    >
      <div v-loading="contentLoading" class="tag-content-list">
        <div v-if="tagContentList.length === 0" class="empty-content">
          <el-empty description="暂无使用该标签的内容" />
        </div>
        <div v-else>
          <div
            v-for="content in tagContentList"
            :key="content.contentId"
            class="content-item-preview"
          >
            <div class="content-header">
              <div class="author-info">
                <el-avatar :src="content.authorAvatar" :size="32">
                  {{ content.authorName[0] }}
                </el-avatar>
                <div class="author-details">
                  <span class="author-name">{{ content.authorName }}</span>
                  <span class="content-type-text">{{
                    getContentTypeText(content.contentType)
                  }}</span>
                </div>
              </div>
              <span class="create-time">{{ formatDateTime(content.createdAt) }}</span>
            </div>
            <div class="content-body">
              <p class="content-text">{{ content.content }}</p>
              <div class="content-stats">
                <span>👍 {{ content.likesCount || 0 }}</span>
                <span>💬 {{ content.commentsCount || 0 }}</span>
                <span>📤 {{ content.sharesCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showContentDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { contentModerationApi } from '@/services/contentModerationApi'
import type { TagManagement, CreateTagRequest, UpdateTagRequest, TagSearchFilter } from '@/types'

// 响应式数据
const loading = ref(false)
const tagList = ref<TagManagement[]>([])
const editingTag = ref<TagManagement | null>(null)

// 查看标签内容相关
const showContentDialog = ref(false)
const contentLoading = ref(false)
const selectedTag = ref<TagManagement | null>(null)
const tagContentList = ref<any[]>([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: 'all',
  isOfficial: undefined as boolean | undefined,
  status: 'all',
  sortBy: 'usage',
})

// 创建/编辑对话框
const showCreateDialog = ref(false)
const submitLoading = ref(false)
const tagFormRef = ref<FormInstance>()

const tagForm = reactive({
  name: '',
  description: '',
  category: 'general' as 'nvc' | 'emotion' | 'skill' | 'activity' | 'general',
  isOfficial: false,
  status: 'active' as 'active' | 'deprecated' | 'banned',
})

const tagFormRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度在 1 到 20 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择标签分类', trigger: 'change' }],
}

// 方法
const loadTagList = async () => {
  loading.value = true
  try {
    const searchParams: TagSearchFilter = {
      keyword: searchForm.keyword || undefined,
      category: searchForm.category as
        | 'all'
        | 'activity'
        | 'nvc'
        | 'emotion'
        | 'skill'
        | 'general'
        | undefined,
      isOfficial: searchForm.isOfficial,
      status: searchForm.status as 'all' | 'active' | 'deprecated' | 'banned' | undefined,
      sortBy: searchForm.sortBy as 'newest' | 'usage' | 'alphabetical' | undefined,
    }

    const response = await contentModerationApi.getTagList(
      searchParams,
      pagination.currentPage,
      pagination.pageSize,
    )

    if (response.success && response.data) {
      tagList.value = response.data.tags
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.error || '加载标签列表失败')
    }
  } catch (error) {
    ElMessage.error('加载标签列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadTagList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadTagList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadTagList()
}

const editTag = (tag: TagManagement) => {
  editingTag.value = tag
  tagForm.name = tag.name
  tagForm.description = tag.description || ''
  tagForm.category = tag.category
  tagForm.isOfficial = tag.isOfficial
  tagForm.status = tag.status
  showCreateDialog.value = true
}

const cancelEdit = () => {
  showCreateDialog.value = false
  editingTag.value = null
  resetForm()
}

const resetForm = () => {
  tagForm.name = ''
  tagForm.description = ''
  tagForm.category = 'general'
  tagForm.isOfficial = false
  tagForm.status = 'active'
  tagFormRef.value?.clearValidate()
}

const submitTag = async () => {
  if (!tagFormRef.value) return

  try {
    await tagFormRef.value.validate()
  } catch (error) {
    return
  }

  submitLoading.value = true
  try {
    let response

    if (editingTag.value) {
      // 更新标签
      const updateRequest: UpdateTagRequest = {
        name: tagForm.name,
        description: tagForm.description,
        category: tagForm.category,
        isOfficial: tagForm.isOfficial,
        status: tagForm.status,
      }
      response = await contentModerationApi.updateTag(editingTag.value.tagId, updateRequest)
    } else {
      // 创建标签
      const createRequest: CreateTagRequest = {
        name: tagForm.name,
        description: tagForm.description,
        category: tagForm.category,
        isOfficial: tagForm.isOfficial,
      }
      response = await contentModerationApi.createTag(createRequest)
    }

    if (response.success) {
      ElMessage.success(response.message || `标签${editingTag.value ? '更新' : '创建'}成功`)
      showCreateDialog.value = false
      editingTag.value = null
      resetForm()
      await loadTagList()
    } else {
      ElMessage.error(response.error || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const deprecateTag = async (tag: TagManagement) => {
  try {
    await ElMessageBox.confirm(`确定要废弃标签"${tag.name}"吗？`, '废弃标签', {
      type: 'warning',
    })

    const response = await contentModerationApi.updateTag(tag.tagId, { status: 'deprecated' })

    if (response.success) {
      ElMessage.success('标签已废弃')
      await loadTagList()
    } else {
      ElMessage.error(response.error || '操作失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const activateTag = async (tag: TagManagement) => {
  try {
    await ElMessageBox.confirm(`确定要激活标签"${tag.name}"吗？`, '激活标签', {
      type: 'success',
    })

    const response = await contentModerationApi.updateTag(tag.tagId, { status: 'active' })

    if (response.success) {
      ElMessage.success('标签已激活')
      await loadTagList()
    } else {
      ElMessage.error(response.error || '操作失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const deleteTag = async (tag: TagManagement) => {
  if (tag.usageCount > 0) {
    ElMessage.warning('标签正在使用中，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除标签"${tag.name}"吗？此操作不可恢复！`, '删除标签', {
      type: 'error',
    })

    const response = await contentModerationApi.deleteTag(tag.tagId)

    if (response.success) {
      ElMessage.success('标签删除成功')
      await loadTagList()
    } else {
      ElMessage.error(response.error || '删除失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const viewTagContent = (tag: TagManagement) => {
  selectedTag.value = tag
  showContentDialog.value = true
  loadTagContent(tag.tagId)
}

const loadTagContent = async (tagId: string) => {
  contentLoading.value = true
  try {
    // 模拟加载标签相关内容
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟数据
    tagContentList.value = [
      {
        contentId: 'content_1',
        authorName: '张小花',
        authorAvatar: 'https://picsum.photos/64/64?random=1',
        contentType: 'post',
        content: `今天学习了${selectedTag.value?.name}相关的知识，受益匪浅。特别是在实际应用中，这些技巧真的很有帮助。`,
        createdAt: new Date('2024-12-15T10:30:00'),
        likesCount: 15,
        commentsCount: 3,
        sharesCount: 2,
      },
      {
        contentId: 'content_2',
        authorName: '李同理',
        authorAvatar: 'https://picsum.photos/64/64?random=2',
        contentType: 'post',
        content: `分享一个关于${selectedTag.value?.name}的实践经验，希望对大家有帮助。`,
        createdAt: new Date('2024-12-14T15:20:00'),
        likesCount: 8,
        commentsCount: 5,
        sharesCount: 1,
      },
    ]
  } catch (error) {
    ElMessage.error('加载标签内容失败')
    tagContentList.value = []
  } finally {
    contentLoading.value = false
  }
}

// 辅助方法
const getCategoryText = (category: string) => {
  const categories = {
    nvc: 'NVC',
    emotion: '情绪',
    skill: '技能',
    activity: '活动',
    general: '通用',
  }
  return categories[category as keyof typeof categories] || category
}

const getCategoryType = (category: string) => {
  const types = {
    nvc: 'success',
    emotion: 'warning',
    skill: 'primary',
    activity: 'info',
    general: '',
  }
  return types[category as keyof typeof types] || ''
}

const getStatusText = (status: string) => {
  const texts = {
    active: '活跃',
    deprecated: '已废弃',
    banned: '已禁用',
  }
  return texts[status as keyof typeof texts] || status
}

const getStatusType = (status: string) => {
  const types = {
    active: 'success',
    deprecated: 'warning',
    banned: 'danger',
  }
  return types[status as keyof typeof types] || 'info'
}

const getContentTypeText = (type: string) => {
  const types = {
    post: '动态',
    comment: '评论',
    activity: '活动',
  }
  return types[type as keyof typeof types] || type
}

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  loadTagList()
})
</script>

<style scoped>
.tag-management {
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

.tag-list {
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

.tag-items {
  min-height: 400px;
}

.tag-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 16px;
  background: white;
  transition: all 0.3s ease;
}

.tag-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2e7d32;
}

.tag-content {
  flex: 1;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.tag-name-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-name {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.tag-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.usage-count {
  font-weight: 500;
  color: #2e7d32;
}

.tag-body {
  margin-bottom: 12px;
}

.tag-description {
  margin: 0 0 8px 0;
  color: #666;
  line-height: 1.6;
}

.tag-meta {
  font-size: 12px;
  color: #999;
}

.tag-actions {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row > * {
    width: 100% !important;
  }

  .tag-item {
    flex-direction: column;
    gap: 12px;
  }

  .tag-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tag-actions {
    flex-direction: row;
    justify-content: center;
  }
}

/* 标签内容样式 */
.tag-content-list {
  max-height: 500px;
  overflow-y: auto;
}

.empty-content {
  padding: 40px 0;
  text-align: center;
}

.content-item-preview {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  transition: all 0.3s ease;
}

.content-item-preview:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #2e7d32;
}

.content-item-preview .content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.content-item-preview .author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-item-preview .author-details {
  display: flex;
  flex-direction: column;
}

.content-item-preview .author-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.content-item-preview .content-type-text {
  font-size: 12px;
  color: #666;
}

.content-item-preview .create-time {
  font-size: 12px;
  color: #999;
}

.content-item-preview .content-body {
  margin-bottom: 8px;
}

.content-item-preview .content-text {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.content-item-preview .content-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.content-item-preview .content-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
