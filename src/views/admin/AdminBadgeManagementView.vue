<template>
  <AdminLayout>
    <div class="badge-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1>🏆 徽章管理</h1>
          <p>设计和管理系统徽章，配置活动联动规则</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateBadgeDialog">
            <el-icon><Plus /></el-icon>
            创建新徽章
          </el-button>
          <el-button @click="loadBadgeData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section" v-loading="statsLoading">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalBadges }}</div>
                <div class="stat-label">总徽章数</div>
              </div>
              <div class="stat-icon">🏆</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.activeBadges }}</div>
                <div class="stat-label">活跃徽章</div>
              </div>
              <div class="stat-icon">✨</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.mostTriggeredBadges[0]?.name || '-' }}</div>
                <div class="stat-label">最受欢迎徽章</div>
              </div>
              <div class="stat-icon">🌟</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.badgesByCategory.length }}</div>
                <div class="stat-label">徽章分类</div>
              </div>
              <div class="stat-icon">📋</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-card>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-input
                v-model="searchFilter.keyword"
                placeholder="搜索徽章名称或描述"
                @input="handleSearch"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchFilter.category"
                @change="handleSearch"
                clearable
                placeholder="分类"
              >
                <el-option label="全部分类" value="all" />
                <el-option label="技能类" value="Skill" />
                <el-option label="参与类" value="Participation" />
                <el-option label="贡献类" value="Contribution" />
                <el-option label="特殊类" value="Special" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchFilter.rarity"
                @change="handleSearch"
                clearable
                placeholder="稀有度"
              >
                <el-option label="全部稀有度" value="all" />
                <el-option label="普通" value="common" />
                <el-option label="稀有" value="rare" />
                <el-option label="史诗" value="epic" />
                <el-option label="传说" value="legendary" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchFilter.sortBy"
                @change="handleSearch"
                placeholder="排序方式"
              >
                <el-option label="显示顺序" value="display_order" />
                <el-option label="创建时间" value="newest" />
                <el-option label="名称" value="name" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-switch
                v-model="searchFilter.isActive"
                @change="handleSearch"
                active-text="仅显示活跃徽章"
                inactive-text="显示全部徽章"
              />
            </el-col>
          </el-row>
        </el-card>
      </div>

      <!-- 徽章列表 -->
      <div class="badge-list-section" v-loading="badgeListLoading">
        <el-row :gutter="20">
          <el-col v-for="badge in badgeList" :key="badge.badgeId" :span="12" :lg="8" :xl="6">
            <el-card class="badge-card" :class="{ 'badge-inactive': !badge.isActive }">
              <div class="badge-preview">
                <img :src="badge.iconUrl" :alt="badge.name" class="badge-icon" />
                <div class="badge-rarity-glow" :class="`rarity-${badge.rarity}`"></div>
              </div>

              <div class="badge-info">
                <h3>{{ badge.name }}</h3>
                <p>{{ badge.description }}</p>

                <div class="badge-meta">
                  <el-tag :type="getCategoryType(badge.category)" size="small">
                    {{ getCategoryText(badge.category) }}
                  </el-tag>
                  <el-tag :type="getRarityType(badge.rarity)" size="small">
                    {{ getRarityText(badge.rarity) }}
                  </el-tag>
                </div>

                <div class="badge-criteria">
                  <span class="criteria-text">
                    {{ getCriteriaText(badge.unlockCriteria) }}
                  </span>
                </div>
              </div>

              <div class="badge-actions">
                <el-button size="small" @click="editBadge(badge)"> 编辑 </el-button>
                <el-button size="small" @click="configureBadgeActivity(badge)">
                  活动联动
                </el-button>
                <el-switch
                  v-model="badge.isActive"
                  @change="toggleBadgeStatus(badge)"
                  size="small"
                />
                <el-popconfirm title="确定删除这个徽章吗？" @confirm="deleteBadge(badge.badgeId)">
                  <template #reference>
                    <el-button size="small" type="danger" plain> 删除 </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalBadges"
            :page-sizes="[12, 24, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="loadBadgeList"
            @size-change="loadBadgeList"
          />
        </div>
      </div>
    </div>

    <!-- 创建/编辑徽章对话框 -->
    <el-dialog
      v-model="showBadgeDialog"
      :title="isEditMode ? '编辑徽章' : '创建新徽章'"
      width="800px"
      destroy-on-close
    >
      <BadgeDesigner
        :badge="editingBadge"
        :is-edit-mode="isEditMode"
        @save="handleBadgeSave"
        @cancel="closeBadgeDialog"
      />
    </el-dialog>

    <!-- 活动联动配置对话框 -->
    <el-dialog v-model="showActivityLinkDialog" title="配置活动联动" width="600px">
      <ActivityLinkConfig
        :badge="selectedBadge"
        :badge-id="selectedBadge?.badgeId || ''"
        @cancel="selectedBadge = null"
        @save="handleActivityLinkSave"
      />
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import BadgeDesigner from '@/components/admin/BadgeDesigner.vue'
import ActivityLinkConfig from '@/components/admin/ActivityLinkConfig.vue'
import { systemConfigApi } from '@/services/systemConfigApi'
import type { BadgeSystemConfig, BadgeManagementStats, BadgeSearchFilter } from '@/types'

// 响应式数据
const statsLoading = ref(false)
const badgeListLoading = ref(false)
const showBadgeDialog = ref(false)
const showActivityLinkDialog = ref(false)
const isEditMode = ref(false)

const stats = ref<BadgeManagementStats>({
  totalBadges: 0,
  activeBadges: 0,
  badgesByCategory: [],
  badgesByRarity: [],
  mostTriggeredBadges: [],
  recentlyCreated: [],
})

const badgeList = ref<BadgeSystemConfig[]>([])
const totalBadges = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const editingBadge = ref<BadgeSystemConfig | null>(null)
const selectedBadge = ref<BadgeSystemConfig | null>(null)

const searchFilter = reactive<BadgeSearchFilter>({
  keyword: '',
  category: 'all',
  rarity: 'all',
  isActive: true,
  sortBy: 'display_order',
  sortOrder: 'asc',
})

// 方法
const loadBadgeData = async () => {
  await Promise.all([loadStats(), loadBadgeList()])
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    const response = await systemConfigApi.getBadgeManagementStats()
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

const loadBadgeList = async () => {
  badgeListLoading.value = true
  try {
    const response = await systemConfigApi.getBadgeList(
      searchFilter,
      currentPage.value,
      pageSize.value,
    )
    if (response.success && response.data) {
      badgeList.value = response.data.badges
      totalBadges.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('加载徽章列表失败')
  } finally {
    badgeListLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadBadgeList()
}

const showCreateBadgeDialog = () => {
  isEditMode.value = false
  editingBadge.value = null
  showBadgeDialog.value = true
}

const editBadge = (badge: BadgeSystemConfig) => {
  isEditMode.value = true
  editingBadge.value = { ...badge }
  showBadgeDialog.value = true
}

const closeBadgeDialog = () => {
  showBadgeDialog.value = false
  editingBadge.value = null
}

const handleBadgeSave = async (badgeData: any) => {
  try {
    if (isEditMode.value && editingBadge.value) {
      const response = await systemConfigApi.updateBadge(editingBadge.value.badgeId, badgeData)
      if (response.success) {
        ElMessage.success('徽章更新成功')
      }
    } else {
      const response = await systemConfigApi.createBadge(badgeData)
      if (response.success) {
        ElMessage.success('徽章创建成功')
      }
    }

    closeBadgeDialog()
    await loadBadgeData()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

const configureBadgeActivity = (badge: BadgeSystemConfig) => {
  selectedBadge.value = badge
  showActivityLinkDialog.value = true
}

const handleActivityLinkSave = () => {
  selectedBadge.value = null
  ElMessage.success('活动联动配置保存成功')
}

const toggleBadgeStatus = async (badge: BadgeSystemConfig) => {
  try {
    const response = await systemConfigApi.updateBadgeConfig(badge.badgeId, {
      isActive: badge.isActive,
    })

    if (response.success) {
      ElMessage.success(`徽章已${badge.isActive ? '启用' : '禁用'}`)
    } else {
      badge.isActive = !badge.isActive // 回滚
      ElMessage.error('操作失败')
    }
  } catch (error) {
    badge.isActive = !badge.isActive // 回滚
    ElMessage.error('操作失败，请重试')
  }
}

const deleteBadge = async (badgeId: string) => {
  try {
    const response = await systemConfigApi.deleteBadge(badgeId)
    if (response.success) {
      ElMessage.success('徽章删除成功')
      await loadBadgeData()
    } else {
      ElMessage.error(response.error || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败，请重试')
  }
}

// 辅助方法
const getCategoryType = (category: string) => {
  const types = {
    Skill: 'success',
    Participation: 'primary',
    Contribution: 'warning',
    Special: 'danger',
  }
  return types[category as keyof typeof types] || 'info'
}

const getCategoryText = (category: string) => {
  const texts = {
    Skill: '技能类',
    Participation: '参与类',
    Contribution: '贡献类',
    Special: '特殊类',
  }
  return texts[category as keyof typeof texts] || category
}

const getRarityType = (rarity: string) => {
  const types = {
    common: 'info',
    rare: 'primary',
    epic: 'warning',
    legendary: 'danger',
  }
  return types[rarity as keyof typeof types] || 'info'
}

const getRarityText = (rarity: string) => {
  const texts = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return texts[rarity as keyof typeof texts] || rarity
}

const getCriteriaText = (criteria: any) => {
  const typeTexts = {
    activity_count: '活动参与次数',
    streak_days: '连续天数',
    post_count: '发帖数量',
    level_reached: '等级达到',
    xp_earned: '经验值获得',
  }

  return `${typeTexts[criteria.type as keyof typeof typeTexts] || criteria.type}: ${criteria.threshold}`
}

// 初始化
onMounted(() => {
  loadBadgeData()
})
</script>

<style scoped>
.badge-management {
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

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.search-section {
  margin-bottom: 24px;
}

.badge-list-section {
  margin-bottom: 24px;
}

.badge-card {
  margin-bottom: 20px;
  position: relative;
  transition: all 0.3s;
}

.badge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.badge-card.badge-inactive {
  opacity: 0.6;
}

.badge-preview {
  position: relative;
  text-align: center;
  margin-bottom: 16px;
}

.badge-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #f0f0f0;
}

.badge-rarity-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 72px;
  border-radius: 12px;
  pointer-events: none;
}

.badge-rarity-glow.rarity-common {
  box-shadow: 0 0 8px rgba(96, 125, 139, 0.3);
}

.badge-rarity-glow.rarity-rare {
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.4);
}

.badge-rarity-glow.rarity-epic {
  box-shadow: 0 0 16px rgba(156, 39, 176, 0.5);
}

.badge-rarity-glow.rarity-legendary {
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.6);
}

.badge-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.badge-info p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.badge-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.badge-criteria {
  margin-bottom: 16px;
}

.criteria-text {
  font-size: 11px;
  color: #999;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.badge-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .badge-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-section .el-row {
    flex-direction: column;
    gap: 12px;
  }

  .badge-actions {
    justify-content: center;
  }
}
</style>
