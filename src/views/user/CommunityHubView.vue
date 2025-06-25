<template>
  <div class="community-hub">
    <!-- 页面头部 -->
    <div class="hub-header">
      <div class="header-content">
        <h1>🌱 社群中心</h1>
        <p>分享成长感悟，连接同行伙伴</p>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <el-tabs v-model="activeFilter" @tab-click="handleFilterChange">
            <el-tab-pane label="最新" name="newest"></el-tab-pane>
            <el-tab-pane label="热门" name="popular"></el-tab-pane>
            <el-tab-pane label="趋势" name="trending"></el-tab-pane>
          </el-tabs>
        </div>

        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索动态、用户或标签..."
            :prefix-icon="Search"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            class="search-input"
          />
          <el-button type="primary" @click="handleSearch" :icon="Search"> 搜索 </el-button>
        </div>
      </div>
    </div>

    <div class="hub-content">
      <!-- 左侧主要内容 -->
      <div class="main-content">
        <!-- 动态发布器 -->
        <FeedPostEditor @published="handlePostPublished" />

        <!-- 动态列表 -->
        <div class="feed-list">
          <div v-if="loading && posts.length === 0" class="loading-state">
            <LoadingSpinner type="growth" size="medium" text="正在加载最新动态..." />
          </div>

          <div v-else-if="posts.length === 0" class="empty-state">
            <EmptyState
              type="post"
              theme="community"
              :show-action="true"
              action-text="发布第一条动态"
              @action="handleCreateFirstPost"
            />
          </div>

          <div v-else>
            <FeedPostCard
              v-for="post in posts"
              :key="post.postId"
              :post="post"
              @tag-click="handleTagClick"
              @activity-click="handleActivityClick"
              @updated="handlePostUpdated"
            />

            <!-- 加载更多 -->
            <div v-if="hasMore" class="load-more">
              <el-button @click="loadMorePosts" :loading="loadingMore" type="primary" text>
                <LoadingSpinner v-if="loadingMore" type="dots" size="small" />
                <span v-else>加载更多</span>
              </el-button>
            </div>

            <div v-else class="no-more">
              <span>没有更多动态了</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 我的统计 -->
        <div class="stats-card">
          <h3>我的动态</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">{{ userStats.postsCount }}</span>
              <span class="stat-label">发布</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.likesReceived }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.commentsReceived }}</span>
              <span class="stat-label">评论</span>
            </div>
          </div>
        </div>

        <!-- 热门标签 -->
        <div class="popular-tags-card">
          <h3>热门标签</h3>
          <div class="tags-cloud">
            <el-tag
              v-for="tag in popularTags"
              :key="tag"
              @click="handleTagClick(tag)"
              class="cloud-tag"
              :class="getTagClass(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 活跃用户 -->
        <div class="active-users-card">
          <h3>活跃伙伴</h3>
          <div class="users-list">
            <div
              v-for="user in activeUsers"
              :key="user.userId"
              class="user-item"
              @click="viewUserProfile(user.userId)"
            >
              <el-avatar :src="user.avatarUrl" :size="32">
                {{ user.nickname[0] }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ user.nickname }}</span>
                <span class="user-activity">{{ user.recentActivity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐活动 -->
        <div class="recommended-activities-card">
          <h3>推荐活动</h3>
          <div class="activities-list">
            <div
              v-for="activity in recommendedActivities"
              :key="activity.activityId"
              class="activity-item"
              @click="goToActivity(activity)"
            >
              <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
              <div class="activity-info">
                <h4>{{ activity.title }}</h4>
                <p>{{ formatActivityTime(activity.scheduledTime) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { feedApi, activityApi } from '@/services/api'
import FeedPostEditor from '@/components/FeedPostEditor.vue'
import FeedPostCard from '@/components/FeedPostCard.vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FeedPost, FeedFilter, Activity } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Store & Router
const userStore = useAuthStore()
const router = useRouter()

// 响应式数据
const activeFilter = ref<'newest' | 'popular' | 'trending'>('newest')
const searchKeyword = ref('')
const posts = ref<FeedPost[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

const popularTags = ref<string[]>([])
const activeUsers = ref<any[]>([])
const recommendedActivities = ref<Activity[]>([])

// 模拟用户统计数据
const userStats = ref({
  postsCount: 5,
  likesReceived: 42,
  commentsReceived: 18,
})

// 计算属性
const filterConfig = computed(
  (): FeedFilter => ({
    sortBy: activeFilter.value,
    tags: searchKeyword.value ? [searchKeyword.value] : undefined,
  }),
)

// 方法
const loadPosts = async (reset = false) => {
  if (reset) {
    loading.value = true
    currentPage.value = 1
  } else {
    loadingMore.value = true
  }

  try {
    const response = await feedApi.getFeedPosts(filterConfig.value)
    if (response.success) {
      const newPosts = response.data || []
      if (reset) {
        posts.value = newPosts
      } else {
        posts.value.push(...newPosts)
      }

      // 模拟分页
      hasMore.value = newPosts.length === 10 && currentPage.value < 3
    }
  } catch (error) {
    console.error('加载动态失败:', error)
    ElMessage.error('加载动态失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMorePosts = () => {
  currentPage.value++
  loadPosts(false)
}

const loadSidebarData = async () => {
  try {
    // 加载热门标签
    const tagsResponse = await feedApi.getPopularTags()
    if (tagsResponse.success) {
      popularTags.value = tagsResponse.data || []
    }

    // 加载推荐活动
    const activitiesResponse = await activityApi.getRecommendedActivities()
    if (activitiesResponse.success) {
      recommendedActivities.value = activitiesResponse.data || []
    }

    // 模拟活跃用户数据
    activeUsers.value = [
      {
        userId: 'user_001',
        nickname: '张华',
        avatarUrl: '/avatars/user-001.png',
        recentActivity: '刚刚发布了动态',
      },
      {
        userId: 'user_002',
        nickname: '小明',
        avatarUrl: '/avatars/user-002.png',
        recentActivity: '参加了同理心驿站',
      },
      {
        userId: 'user_003',
        nickname: '李梅',
        avatarUrl: '/avatars/user-003.png',
        recentActivity: '分享了学习心得',
      },
    ]
  } catch (error) {
    console.error('加载侧边栏数据失败:', error)
  }
}

const handleFilterChange = () => {
  loadPosts(true)
}

const handleSearch = () => {
  loadPosts(true)
}

const handleCreateFirstPost = () => {
  // 滚动到发布器
  const editor = document.querySelector('.feed-post-editor')
  if (editor) {
    editor.scrollIntoView({ behavior: 'smooth' })
    // 聚焦到输入框
    setTimeout(() => {
      const textarea = editor.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    }, 500)
  }
}

const handlePostPublished = (newPost: FeedPost) => {
  posts.value.unshift(newPost)
  ElMessage.success('动态发布成功！')
}

const handlePostUpdated = (updatedPost: FeedPost) => {
  const index = posts.value.findIndex((p) => p.postId === updatedPost.postId)
  if (index !== -1) {
    posts.value[index] = updatedPost
  }
}

const handleTagClick = (tag: string) => {
  searchKeyword.value = tag
  handleSearch()
}

const handleActivityClick = (activityId: string, activityType: string) => {
  const routes = {
    EmpathyStation: '/user/empathy-station',
    ThemeSalon: '/user/theme-salon',
    LifeGrowth: '/user/life-growth',
  }

  const route = routes[activityType as keyof typeof routes]
  if (route) {
    router.push(route)
  }
}

const getTagClass = (tag: string) => {
  // 根据标签热度返回不同样式
  const hotTags = ['#NVC学习', '#同理心分享', '#成长感悟']
  return hotTags.includes(tag) ? 'hot-tag' : ''
}

const getActivityIcon = (type: string) => {
  const icons = {
    EmpathyStation: '🏠',
    ThemeSalon: '💬',
    LifeGrowth: '🎤',
  }
  return icons[type as keyof typeof icons] || '📚'
}

const formatActivityTime = (date?: Date) => {
  if (!date) return '时间待定'
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewUserProfile = (userId: string) => {
  ElMessage.info('用户主页功能开发中')
}

const goToActivity = (activity: Activity) => {
  handleActivityClick(activity.activityId, activity.type)
}

// 监听筛选变化
watch(
  filterConfig,
  () => {
    loadPosts(true)
  },
  { deep: true },
)

// 生命周期
onMounted(() => {
  loadPosts(true)
  loadSidebarData()
})
</script>

<style scoped>
.community-hub {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 头部 */
.hub-header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: var(--max-width-standard, 1400px);
  margin: 0 auto;
}

.header-content {
  text-align: center;
  margin-bottom: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 28px;
}

.header-content p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.filter-tabs {
  flex: 1;
}

.search-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  width: 300px;
}

/* 主要内容区 */
.hub-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  max-width: var(--max-width-wide, 1600px);
  margin: 0 auto;
}

.main-content {
  min-height: 500px;
}

/* 动态列表 */
.feed-list {
  margin-top: 24px;
}

.loading-state {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #666;
}

.load-more {
  text-align: center;
  padding: 24px;
}

.no-more {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card,
.popular-tags-card,
.active-users-card,
.recommended-activities-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-card h3,
.popular-tags-card h3,
.active-users-card h3,
.recommended-activities-card h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 热门标签 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cloud-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.cloud-tag:hover {
  background: #2196f3;
  color: white;
}

.cloud-tag.hot-tag {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  border: none;
}

/* 活跃用户 */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.user-item:hover {
  background: #f5f5f5;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.user-activity {
  color: #666;
  font-size: 12px;
}

/* 推荐活动 */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  border: 1px solid #f0f0f0;
}

.activity-item:hover {
  background: #f8f9fa;
  border-color: #2e7d32;
}

.activity-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
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
  font-size: 13px;
}

.activity-info p {
  margin: 0;
  color: #666;
  font-size: 11px;
}

/* 响应式设计 - 统一优化版本 */
.community-hub {
  width: 100%;
  /* 移除最大宽度限制，采用分区域控制 */
}

/* 分区域最大宽度控制 */
.hub-header {
  max-width: var(--max-width-standard, 1400px);
  margin: 0 auto;
}

.hub-content {
  max-width: var(--max-width-wide, 1600px);
  margin: 0 auto;
}

@media (min-width: 1200px) {
  .community-hub {
    padding: var(--container-padding-desktop, 48px);
  }

  .hub-header {
    padding: 32px;
    max-width: var(--max-width-standard, 1400px);
  }

  .hub-content {
    gap: 32px;
    max-width: var(--max-width-wide, 1600px);
  }

  .search-input {
    width: 350px;
  }
}

@media (min-width: 1600px) {
  .community-hub {
    padding: var(--container-padding-large, 64px);
  }

  .hub-content {
    max-width: var(--max-width-ultrawide, 1800px);
  }

  .search-input {
    width: 400px;
  }
}

@media (max-width: 768px) {
  .community-hub {
    padding: var(--container-padding-mobile, 16px);
  }

  .hub-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .filter-section {
    flex-direction: column;
    gap: 16px;
  }

  .search-section {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }
}
</style>
