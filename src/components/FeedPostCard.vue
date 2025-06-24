<template>
  <div class="feed-post-card">
    <!-- 用户信息头部 -->
    <div class="post-header">
      <div class="user-info">
        <el-avatar :src="post.userAvatar" :size="40" class="user-avatar">
          {{ post.userName[0] }}
        </el-avatar>
        <div class="user-details">
          <span class="user-name">{{ post.userName }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
      </div>
      <el-dropdown @command="handleMenuCommand">
        <el-button type="text" :icon="MoreFilled" class="more-btn" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="report">举报</el-dropdown-item>
            <el-dropdown-item command="block" v-if="post.userId !== currentUserId"
              >屏蔽用户</el-dropdown-item
            >
            <el-dropdown-item command="delete" v-if="post.userId === currentUserId" divided
              >删除</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 动态内容 -->
    <div class="post-content">
      <div class="content-text" v-html="formatContent(post.content)"></div>

      <!-- 图片展示 -->
      <div v-if="post.images && post.images.length > 0" class="images-grid">
        <div
          v-for="(image, index) in post.images"
          :key="index"
          class="image-item"
          :class="getImageGridClass(post.images.length)"
          @click="previewImage(image, index)"
        >
          <img :src="image" :alt="`图片 ${index + 1}`" />
        </div>
      </div>

      <!-- 标签展示 -->
      <div v-if="post.tags && post.tags.length > 0" class="tags-container">
        <el-tag
          v-for="tag in post.tags"
          :key="tag"
          size="small"
          type="info"
          class="tag-item"
          @click="searchByTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>

      <!-- 关联活动 -->
      <div
        v-if="post.mentionedActivities && post.mentionedActivities.length > 0"
        class="mentioned-activities"
      >
        <div
          v-for="activity in post.mentionedActivities"
          :key="activity.activityId"
          class="activity-mention"
          @click="goToActivity(activity)"
        >
          <span class="activity-icon">{{ getActivityIcon(activity.activityType) }}</span>
          <span class="activity-title">{{ activity.activityTitle }}</span>
          <span class="activity-type">{{ getActivityTypeName(activity.activityType) }}</span>
        </div>
      </div>
    </div>

    <!-- 互动统计 -->
    <div class="interaction-stats">
      <span v-if="post.likesCount > 0" class="stat-item">
        <el-icon><Star /></el-icon>
        {{ post.likesCount }} 个赞
      </span>
      <span v-if="post.commentsCount > 0" class="stat-item">
        <el-icon><ChatLineSquare /></el-icon>
        {{ post.commentsCount }} 条评论
      </span>
      <span v-if="post.sharesCount > 0" class="stat-item">
        <el-icon><Share /></el-icon>
        {{ post.sharesCount }} 次分享
      </span>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button
        :type="post.isLiked ? 'primary' : ''"
        :icon="post.isLiked ? StarFilled : Star"
        @click="toggleLike"
        :loading="liking"
        class="action-btn"
      >
        {{ post.isLiked ? '已赞' : '点赞' }}
      </el-button>

      <el-button :icon="ChatLineSquare" @click="toggleComments" class="action-btn">
        评论
      </el-button>

      <el-button :icon="Share" @click="sharePost" class="action-btn"> 分享 </el-button>

      <el-button
        :type="post.isBookmarked ? 'warning' : ''"
        :icon="post.isBookmarked ? StarFilled : Star"
        @click="toggleBookmark"
        :loading="bookmarking"
        class="action-btn bookmark-btn"
      >
        {{ post.isBookmarked ? '已收藏' : '收藏' }}
      </el-button>
    </div>

    <!-- 评论区 -->
    <div v-if="showComments" class="comments-section">
      <!-- 评论输入框 -->
      <div class="comment-input-section">
        <el-avatar :src="userStore.user?.avatarUrl" :size="32" class="comment-avatar">
          {{ userStore.user?.nickname?.[0] || '用' }}
        </el-avatar>
        <div class="comment-input-wrapper">
          <el-input
            v-model="commentContent"
            placeholder="写下你的评论..."
            @keyup.enter="submitComment"
            class="comment-input"
          />
          <el-button
            type="primary"
            size="small"
            @click="submitComment"
            :loading="commenting"
            :disabled="!commentContent.trim()"
          >
            发布
          </el-button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
          <el-avatar :src="comment.userAvatar" :size="32" class="comment-avatar">
            {{ comment.userName[0] }}
          </el-avatar>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-user">{{ comment.userName }}</span>
              <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button
                type="text"
                size="small"
                :icon="comment.isLiked ? StarFilled : Star"
                @click="toggleCommentLike(comment)"
              >
                {{ comment.likesCount || '' }}
              </el-button>
              <el-button type="text" size="small" @click="replyToComment(comment)">
                回复
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多评论 -->
      <div v-if="hasMoreComments" class="load-more-comments">
        <el-button type="text" @click="loadMoreComments" :loading="loadingComments">
          查看更多评论
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { feedApi } from '@/services/api'
import { MoreFilled, Star, StarFilled, ChatLineSquare, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FeedPost, FeedComment } from '@/types'

// Props
const props = defineProps<{
  post: FeedPost
}>()

// Emits
const emit = defineEmits<{
  tagClick: [tag: string]
  activityClick: [activityId: string, activityType: string]
  updated: [post: FeedPost]
}>()

// Store & Router
const userStore = useAuthStore()
const router = useRouter()

// 响应式数据
const showComments = ref(false)
const comments = ref<FeedComment[]>([])
const commentContent = ref('')
const liking = ref(false)
const bookmarking = ref(false)
const commenting = ref(false)
const loadingComments = ref(false)
const hasMoreComments = ref(false)

// 计算属性
const currentUserId = computed(() => userStore.user?.userId || 'current_user')

// 方法
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatContent = (content: string) => {
  // 处理标签
  let formatted = content.replace(/#([^\s#]+)/g, '<span class="hashtag">#$1</span>')

  // 处理@活动
  formatted = formatted.replace(/@([^\s@]+)/g, '<span class="mention">@$1</span>')

  // 处理换行
  formatted = formatted.replace(/\n/g, '<br>')

  return formatted
}

const getImageGridClass = (count: number) => {
  if (count === 1) return 'single-image'
  if (count === 2) return 'two-images'
  if (count === 3) return 'three-images'
  return 'multi-images'
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

const toggleLike = async () => {
  liking.value = true
  try {
    const response = await feedApi.toggleLike(props.post.postId, 'post')
    if (response.success) {
      // 更新本地状态
      const updatedPost = { ...props.post }
      updatedPost.isLiked = !updatedPost.isLiked
      updatedPost.likesCount += updatedPost.isLiked ? 1 : -1
      emit('updated', updatedPost)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    liking.value = false
  }
}

const toggleBookmark = async () => {
  bookmarking.value = true
  try {
    const response = await feedApi.toggleBookmark(props.post.postId)
    if (response.success) {
      const updatedPost = { ...props.post }
      updatedPost.isBookmarked = !updatedPost.isBookmarked
      emit('updated', updatedPost)
      ElMessage.success(updatedPost.isBookmarked ? '已收藏' : '已取消收藏')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    bookmarking.value = false
  }
}

const sharePost = async () => {
  try {
    await feedApi.sharePost(props.post.postId)
    ElMessage.success('分享成功')
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const toggleComments = () => {
  showComments.value = !showComments.value
  if (showComments.value && comments.value.length === 0) {
    loadComments()
  }
}

const loadComments = async () => {
  loadingComments.value = true
  try {
    const response = await feedApi.getComments(props.post.postId)
    if (response.success) {
      comments.value = response.data || []
    }
  } catch (error) {
    ElMessage.error('加载评论失败')
  } finally {
    loadingComments.value = false
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return

  commenting.value = true
  try {
    const response = await feedApi.createComment({
      postId: props.post.postId,
      content: commentContent.value,
    })

    if (response.success) {
      comments.value.unshift(response.data!)
      commentContent.value = ''

      // 更新评论数
      const updatedPost = { ...props.post }
      updatedPost.commentsCount += 1
      emit('updated', updatedPost)
    }
  } catch (error) {
    ElMessage.error('发布评论失败')
  } finally {
    commenting.value = false
  }
}

const toggleCommentLike = async (comment: FeedComment) => {
  try {
    await feedApi.toggleLike(comment.commentId, 'comment')
    // 更新评论点赞状态
    comment.isLiked = !comment.isLiked
    comment.likesCount += comment.isLiked ? 1 : -1
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const replyToComment = (comment: FeedComment) => {
  commentContent.value = `@${comment.userName} `
}

const loadMoreComments = () => {
  // 实现加载更多评论
  ElMessage.info('加载更多评论功能开发中')
}

const previewImage = (image: string, index: number) => {
  ElMessage.info('图片预览功能开发中')
}

const searchByTag = (tag: string) => {
  emit('tagClick', tag)
}

const goToActivity = (activity: any) => {
  emit('activityClick', activity.activityId, activity.activityType)
}

const handleMenuCommand = (command: string) => {
  switch (command) {
    case 'report':
      ElMessage.info('举报功能开发中')
      break
    case 'block':
      ElMessage.info('屏蔽功能开发中')
      break
    case 'delete':
      ElMessage.info('删除功能开发中')
      break
  }
}
</script>

<style scoped>
.feed-post-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.feed-post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.post-time {
  color: #999;
  font-size: 12px;
}

.more-btn {
  color: #999;
}

/* 内容区 */
.post-content {
  margin-bottom: 16px;
}

.content-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  word-break: break-word;
}

.content-text :deep(.hashtag) {
  color: #2196f3;
  font-weight: 500;
  cursor: pointer;
}

.content-text :deep(.hashtag):hover {
  text-decoration: underline;
}

.content-text :deep(.mention) {
  color: #4caf50;
  font-weight: 500;
  cursor: pointer;
}

.content-text :deep(.mention):hover {
  text-decoration: underline;
}

/* 图片网格 */
.images-grid {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.images-grid.single-image {
  grid-template-columns: 1fr;
  max-width: 400px;
}

.images-grid.two-images {
  grid-template-columns: 1fr 1fr;
}

.images-grid.three-images {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.images-grid.three-images .image-item:first-child {
  grid-row: 1 / 3;
}

.images-grid.multi-images {
  grid-template-columns: repeat(3, 1fr);
}

.image-item {
  aspect-ratio: 1;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 标签 */
.tags-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  background: #2196f3;
  color: white;
}

/* 关联活动 */
.mentioned-activities {
  margin-bottom: 12px;
}

.activity-mention {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f8e9;
  padding: 6px 12px;
  border-radius: 20px;
  margin-right: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 12px;
}

.activity-mention:hover {
  background: #e8f5e8;
}

.activity-icon {
  font-size: 14px;
}

.activity-title {
  color: #2e7d32;
  font-weight: 500;
}

.activity-type {
  color: #666;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 8px;
}

/* 互动统计 */
.interaction-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  font-size: 13px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  margin: 0 4px;
}

.bookmark-btn {
  border-left: 1px solid #eee;
  margin-left: 8px;
  padding-left: 12px;
}

/* 评论区 */
.comments-section {
  margin-top: 16px;
}

.comment-input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-avatar {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
}

.comment-input {
  flex: 1;
}

.comment-input :deep(.el-input__inner) {
  border-radius: 20px;
  background: #f8f9fa;
  border: none;
}

/* 评论列表 */
.comments-list {
  margin-bottom: 12px;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-user {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-text {
  color: #333;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 6px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.load-more-comments {
  text-align: center;
}
</style>
