<template>
  <div class="post-editor">
    <div class="editor-card">
      <!-- 用户头像和基本信息 -->
      <div class="editor-header">
        <el-avatar :src="userStore.user?.avatarUrl" :size="40" class="user-avatar">
          {{ userStore.user?.nickname?.[0] || '用' }}
        </el-avatar>
        <div class="user-info">
          <span class="user-name">{{ userStore.user?.nickname || '用户' }}</span>
          <span class="post-type">分享一下想法...</span>
        </div>
      </div>

      <!-- 内容编辑区 -->
      <div class="editor-content">
        <el-input
          v-model="content"
          type="textarea"
          :rows="4"
          placeholder="分享你的NVC学习心得、成长感悟或生活体验..."
          maxlength="500"
          show-word-limit
          resize="none"
          class="content-input"
        />

        <!-- 图片预览区 -->
        <div v-if="imageUrls.length > 0" class="image-preview-grid">
          <div v-for="(url, index) in imageUrls" :key="index" class="image-preview-item">
            <img :src="url" :alt="`预览图片 ${index + 1}`" />
            <div class="image-overlay">
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="removeImage(index)"
              />
            </div>
          </div>
        </div>

        <!-- 标签输入区 -->
        <div class="tags-section">
          <div class="section-label">
            <el-icon><PriceTag /></el-icon>
            <span>添加标签</span>
          </div>
          <div class="tags-input">
            <el-tag
              v-for="tag in selectedTags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible"
              v-model="tagInputValue"
              size="small"
              @keyup.enter="addTag"
              @blur="addTag"
              placeholder="输入标签..."
              class="tag-input"
            />
            <el-button v-else size="small" type="primary" text @click="showTagInput">
              + 标签
            </el-button>
          </div>

          <!-- 热门标签推荐 -->
          <div class="popular-tags">
            <span class="popular-label">热门标签：</span>
            <el-tag
              v-for="tag in popularTags"
              :key="tag"
              size="small"
              type="info"
              @click="addPopularTag(tag)"
              class="popular-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- @活动区 -->
        <div class="activities-section">
          <div class="section-label">
            <el-icon><Star /></el-icon>
            <span>关联活动</span>
          </div>
          <div class="mentioned-activities">
            <el-tag
              v-for="activity in mentionedActivities"
              :key="activity.activityId"
              closable
              @close="removeActivity(activity.activityId)"
              :type="getActivityTagType(activity.activityType)"
              class="activity-tag"
            >
              {{ getActivityIcon(activity.activityType) }} {{ activity.activityTitle }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 操作按钮区 -->
      <div class="editor-actions">
        <div class="action-buttons">
          <el-button
            :icon="Picture"
            @click="triggerImageUpload"
            :disabled="imageUrls.length >= 9"
            type="primary"
            text
          >
            图片
          </el-button>
          <el-button :icon="Star" @click="showActivitySelector" type="primary" text>
            @活动
          </el-button>
        </div>

        <div class="submit-buttons">
          <el-button @click="resetEditor">取消</el-button>
          <el-button
            type="primary"
            @click="publishPost"
            :loading="publishing"
            :disabled="!canPublish"
          >
            发布
          </el-button>
        </div>
      </div>

      <!-- 隐藏的文件上传 -->
      <input
        ref="imageUpload"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleImageUpload"
      />
    </div>

    <!-- 活动选择弹窗 -->
    <el-dialog v-model="activitySelectorVisible" title="选择关联活动" width="500px">
      <div class="activity-list">
        <div
          v-for="activity in availableActivities"
          :key="activity.activityId"
          class="activity-item"
          @click="selectActivity(activity)"
        >
          <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
          <div class="activity-info">
            <h4>{{ activity.title }}</h4>
            <p>{{ activity.description }}</p>
            <span class="activity-type">{{ getActivityTypeName(activity.type) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { feedApi, activityApi } from '@/services/api'
import { Delete, Picture, PriceTag, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Activity, CreatePostRequest } from '@/types'

// Props & Emits
const emit = defineEmits<{
  published: [post: any]
}>()

// Store
const userStore = useAuthStore()

// 响应式数据
const content = ref('')
const selectedTags = ref<string[]>([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const imageUrls = ref<string[]>([])
const selectedImages = ref<File[]>([])
const mentionedActivities = ref<
  {
    activityId: string
    activityTitle: string
    activityType: 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth'
  }[]
>([])

const publishing = ref(false)
const popularTags = ref<string[]>([])
const availableActivities = ref<Activity[]>([])
const activitySelectorVisible = ref(false)

// Refs
const imageUpload = ref<HTMLInputElement>()

// 计算属性
const canPublish = computed(() => {
  return content.value.trim().length > 0 && !publishing.value
})

// 方法
const triggerImageUpload = () => {
  imageUpload.value?.click()
}

const handleImageUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  const newFiles = Array.from(files).slice(0, 9 - imageUrls.value.length)
  selectedImages.value.push(...newFiles)

  newFiles.forEach((file) => {
    const url = URL.createObjectURL(file)
    imageUrls.value.push(url)
  })
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(imageUrls.value[index])
  imageUrls.value.splice(index, 1)
  selectedImages.value.splice(index, 1)
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    const input = document.querySelector('.tag-input input') as HTMLInputElement
    input?.focus()
  })
}

const addTag = () => {
  const tag = tagInputValue.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const addPopularTag = (tag: string) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
}

const showActivitySelector = () => {
  activitySelectorVisible.value = true
}

const selectActivity = (activity: Activity) => {
  const exists = mentionedActivities.value.some((item) => item.activityId === activity.activityId)

  if (!exists) {
    mentionedActivities.value.push({
      activityId: activity.activityId,
      activityTitle: activity.title,
      activityType: activity.type as any,
    })
  }

  activitySelectorVisible.value = false
}

const removeActivity = (activityId: string) => {
  const index = mentionedActivities.value.findIndex((item) => item.activityId === activityId)
  if (index > -1) {
    mentionedActivities.value.splice(index, 1)
  }
}

const getActivityIcon = (type: string) => {
  const icons = {
    EmpathyStation: '🏠',
    ThemeSalon: '💬',
    LifeGrowth: '🎤',
  }
  return icons[type as keyof typeof icons] || '📚'
}

const getActivityTypeName = (type: string) => {
  const names = {
    EmpathyStation: '同理心驿站',
    ThemeSalon: '主题沙龙',
    LifeGrowth: '刘轶说生命成长',
  }
  return names[type as keyof typeof names] || '活动'
}

const getActivityTagType = (type: string) => {
  const types = {
    EmpathyStation: 'success',
    ThemeSalon: 'primary',
    LifeGrowth: 'warning',
  }
  return types[type as keyof typeof types] || 'info'
}

const publishPost = async () => {
  publishing.value = true
  try {
    const request: CreatePostRequest = {
      content: content.value,
      images: selectedImages.value,
      tags: selectedTags.value,
      mentionedActivities: mentionedActivities.value.map((item) => item.activityId),
    }

    const response = await feedApi.createPost(request)
    if (response.success) {
      ElMessage.success('发布成功！')
      emit('published', response.data)
      resetEditor()
    } else {
      ElMessage.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布动态失败:', error)
    ElMessage.error('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

const resetEditor = () => {
  content.value = ''
  selectedTags.value = []
  tagInputVisible.value = false
  tagInputValue.value = ''
  mentionedActivities.value = []

  // 清理图片
  imageUrls.value.forEach((url) => URL.revokeObjectURL(url))
  imageUrls.value = []
  selectedImages.value = []
}

const loadData = async () => {
  try {
    // 加载热门标签
    const tagsResponse = await feedApi.getPopularTags()
    if (tagsResponse.success) {
      popularTags.value = tagsResponse.data || []
    }

    // 加载可用活动
    const activitiesResponse = await activityApi.getActivities()
    if (activitiesResponse.success) {
      availableActivities.value = activitiesResponse.data || []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.post-editor {
  margin-bottom: 24px;
}

.editor-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  font-weight: bold;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.post-type {
  font-size: 12px;
  color: #666;
}

.editor-content {
  margin-bottom: 16px;
}

.content-input {
  margin-bottom: 16px;
}

.content-input :deep(.el-textarea__inner) {
  border: none;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.tags-section,
.activities-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.tags-input {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tag-item {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
}

.tag-input {
  width: 120px;
}

.popular-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.popular-label {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.popular-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.popular-tag:hover {
  background: #2196f3;
  color: white;
}

.mentioned-activities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.activity-tag {
  border: none;
}

.editor-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.submit-buttons {
  display: flex;
  gap: 8px;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.activity-item:hover {
  background: #f5f5f5;
}

.activity-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f8e9;
  border-radius: 50%;
}

.activity-info {
  flex: 1;
}

.activity-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 14px;
}

.activity-info p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.activity-type {
  font-size: 11px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
