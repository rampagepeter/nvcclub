<template>
  <div class="activity-link-config">
    <div class="config-header">
      <h3>{{ badge?.name }} - 活动联动配置</h3>
      <p>配置此徽章与各种活动的触发规则和条件</p>
    </div>

    <!-- 现有联动规则 -->
    <div class="existing-links" v-if="existingLinks.length > 0">
      <h4>📋 现有联动规则</h4>
      <div class="link-list">
        <div v-for="link in existingLinks" :key="link.linkId" class="link-item">
          <div class="link-info">
            <div class="activity-type">
              <span class="activity-icon">{{ getActivityIcon(link.activityType) }}</span>
              <span class="activity-name">{{ getActivityName(link.activityType) }}</span>
            </div>
            <div class="link-condition">
              <span class="condition-text">
                {{ getConditionText(link.triggerCondition) }}
              </span>
              <el-tag :type="link.isActive ? 'success' : 'info'" size="small">
                {{ link.isActive ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
          <div class="link-actions">
            <el-button size="small" @click="editLink(link)"> 编辑 </el-button>
            <el-switch v-model="link.isActive" @change="toggleLinkStatus(link)" size="small" />
            <el-popconfirm title="确定删除这个联动规则吗？" @confirm="deleteLink(link.linkId)">
              <template #reference>
                <el-button size="small" type="danger" plain> 删除 </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新联动规则 -->
    <div class="create-link-section">
      <h4>➕ 创建新的活动联动</h4>

      <el-form :model="linkForm" :rules="linkRules" ref="linkFormRef" label-width="120px">
        <el-form-item label="关联活动" prop="activityType">
          <el-select v-model="linkForm.activityType" placeholder="选择活动类型" style="width: 100%">
            <el-option label="🏠 同理心驿站" value="EmpathyStation" />
            <el-option label="💬 主题沙龙" value="ThemeSalon" />
            <el-option label="🎤 生命成长分享" value="LifeGrowth" />
          </el-select>
        </el-form-item>

        <el-form-item label="触发条件" prop="triggerCondition.type">
          <el-select
            v-model="linkForm.triggerCondition.type"
            placeholder="选择触发条件类型"
            style="width: 100%"
          >
            <el-option label="参与次数达到" value="participation_count" />
            <el-option label="连续参与天数" value="consecutive_days" />
            <el-option label="活动质量评分" value="quality_rating" />
            <el-option label="主持活动次数" value="hosting_count" />
          </el-select>
        </el-form-item>

        <el-form-item label="触发阈值" prop="triggerCondition.threshold">
          <el-input-number
            v-model="linkForm.triggerCondition.threshold"
            :min="1"
            :max="1000"
            style="width: 200px"
          />
          <span class="threshold-unit">{{ getThresholdUnit() }}</span>
        </el-form-item>

        <el-form-item label="时间范围" prop="triggerCondition.timeframe">
          <el-select
            v-model="linkForm.triggerCondition.timeframe"
            placeholder="选择时间范围"
            style="width: 100%"
          >
            <el-option label="全部时间" value="all_time" />
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="每季度" value="quarterly" />
            <el-option label="每年" value="yearly" />
          </el-select>
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="linkForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="createLink" :loading="saving">
          {{ editingLink ? '更新配置' : '创建联动' }}
        </el-button>
      </div>
    </div>

    <!-- 预览效果 -->
    <div class="preview-section">
      <h4>🔍 联动效果预览</h4>
      <div class="preview-content">
        <div class="preview-card">
          <div class="badge-preview">
            <img :src="badge?.iconUrl" :alt="badge?.name" class="badge-icon" />
            <div class="badge-info">
              <h5>{{ badge?.name }}</h5>
              <p>{{ badge?.description }}</p>
            </div>
          </div>

          <div class="trigger-arrow">→</div>

          <div class="activity-preview" v-if="linkForm.activityType">
            <div class="activity-icon">{{ getActivityIcon(linkForm.activityType) }}</div>
            <div class="activity-info">
              <h5>{{ getActivityName(linkForm.activityType) }}</h5>
              <p>{{ getConditionPreviewText() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="dialog-actions">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="$emit('save')"> 保存所有配置 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { systemConfigApi } from '@/services/systemConfigApi'
import type { BadgeSystemConfig, BadgeActivityLink } from '@/types'

interface Props {
  badge?: BadgeSystemConfig | null
  badgeId: string
}

const props = withDefaults(defineProps<Props>(), {
  badge: null,
  badgeId: '',
})

const emit = defineEmits<{
  save: []
  cancel: []
}>()

// 响应式数据
const linkFormRef = ref<FormInstance>()
const saving = ref(false)
const existingLinks = ref<BadgeActivityLink[]>([])
const editingLink = ref<BadgeActivityLink | null>(null)

const linkForm = reactive({
  activityType: '' as 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth' | '',
  triggerCondition: {
    type: '' as
      | 'participation_count'
      | 'consecutive_days'
      | 'quality_rating'
      | 'hosting_count'
      | '',
    threshold: 1,
    timeframe: 'all_time' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time',
  },
  isActive: true,
})

const linkRules: FormRules = {
  activityType: [{ required: true, message: '请选择关联活动', trigger: 'change' }],
  'triggerCondition.type': [{ required: true, message: '请选择触发条件类型', trigger: 'change' }],
  'triggerCondition.threshold': [{ required: true, message: '请输入触发阈值', trigger: 'blur' }],
}

// 计算属性
const getThresholdUnit = () => {
  switch (linkForm.triggerCondition.type) {
    case 'participation_count':
      return '次'
    case 'consecutive_days':
      return '天'
    case 'quality_rating':
      return '分'
    case 'hosting_count':
      return '次'
    default:
      return ''
  }
}

const getConditionPreviewText = () => {
  if (!linkForm.activityType || !linkForm.triggerCondition.type) {
    return '请完成配置以查看预览'
  }

  const activityName = getActivityName(linkForm.activityType)
  const conditionText = getConditionTypeText(linkForm.triggerCondition.type)
  const threshold = linkForm.triggerCondition.threshold
  const unit = getThresholdUnit()
  const timeframe = getTimeframeText(linkForm.triggerCondition.timeframe)

  return `在${timeframe}内，${activityName}的${conditionText}达到${threshold}${unit}时自动获得此徽章`
}

// 方法
const loadExistingLinks = async () => {
  if (!props.badge) return

  try {
    const response = await systemConfigApi.getBadgeActivityLinks(props.badge.badgeId)
    if (response.success && response.data) {
      existingLinks.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载联动配置失败')
  }
}

const createLink = async () => {
  // 验证必填字段
  if (!linkForm.activityType || !linkForm.triggerCondition.type || !props.badgeId) {
    ElMessage.warning('请完整填写联动规则')
    return
  }

  saving.value = true
  try {
    const linkData = {
      badgeId: props.badgeId,
      activityType: linkForm.activityType as 'EmpathyStation' | 'ThemeSalon' | 'LifeGrowth',
      triggerCondition: {
        type: linkForm.triggerCondition.type as
          | 'participation_count'
          | 'consecutive_days'
          | 'quality_rating'
          | 'hosting_count',
        threshold: linkForm.triggerCondition.threshold,
        timeframe: linkForm.triggerCondition.timeframe,
      },
      isActive: linkForm.isActive,
    }

    const response = await systemConfigApi.createBadgeActivityLink(linkData)

    if (response.success) {
      ElMessage.success('联动配置创建成功')
      await loadExistingLinks()
      resetForm()
    } else {
      ElMessage.error(response.error || '创建失败')
    }
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    saving.value = false
  }
}

const editLink = (link: BadgeActivityLink) => {
  editingLink.value = link
  linkForm.activityType = link.activityType
  linkForm.triggerCondition = {
    ...link.triggerCondition,
    timeframe: link.triggerCondition.timeframe || 'all_time',
  }
  linkForm.isActive = link.isActive
}

const toggleLinkStatus = async (link: BadgeActivityLink) => {
  // 这里可以调用API更新状态
  ElMessage.success(`联动规则已${link.isActive ? '启用' : '禁用'}`)
}

const deleteLink = async (linkId: string) => {
  // 这里可以调用API删除联动
  const index = existingLinks.value.findIndex((link) => link.linkId === linkId)
  if (index > -1) {
    existingLinks.value.splice(index, 1)
    ElMessage.success('联动规则删除成功')
  }
}

const resetForm = () => {
  if (linkFormRef.value) {
    linkFormRef.value.resetFields()
  }
  editingLink.value = null
  linkForm.activityType = ''
  linkForm.triggerCondition.type = ''
  linkForm.triggerCondition.threshold = 1
  linkForm.triggerCondition.timeframe = 'all_time'
  linkForm.isActive = true
}

// 辅助方法
const getActivityIcon = (type: string) => {
  const icons = {
    EmpathyStation: '🏠',
    ThemeSalon: '💬',
    LifeGrowth: '🎤',
  }
  return icons[type as keyof typeof icons] || '📚'
}

const getActivityName = (type: string) => {
  const names = {
    EmpathyStation: '同理心驿站',
    ThemeSalon: '主题沙龙',
    LifeGrowth: '生命成长分享',
  }
  return names[type as keyof typeof names] || type
}

const getConditionText = (condition: any) => {
  const typeText = getConditionTypeText(condition.type)
  const timeText = getTimeframeText(condition.timeframe)
  return `${typeText}达到${condition.threshold}${getConditionUnit(condition.type)} (${timeText})`
}

const getConditionTypeText = (type: string) => {
  const texts = {
    participation_count: '参与次数',
    consecutive_days: '连续参与天数',
    quality_rating: '质量评分',
    hosting_count: '主持次数',
  }
  return texts[type as keyof typeof texts] || type
}

const getConditionUnit = (type: string) => {
  const units = {
    participation_count: '次',
    consecutive_days: '天',
    quality_rating: '分',
    hosting_count: '次',
  }
  return units[type as keyof typeof units] || ''
}

const getTimeframeText = (timeframe: string) => {
  const texts = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    quarterly: '每季度',
    yearly: '每年',
    all_time: '全部时间',
  }
  return texts[timeframe as keyof typeof texts] || timeframe
}

// 初始化
onMounted(() => {
  loadExistingLinks()
})
</script>

<style scoped>
.activity-link-config {
  padding: 20px;
}

.config-header {
  margin-bottom: 24px;
}

.config-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.config-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.existing-links {
  margin-bottom: 32px;
}

.existing-links h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.link-info {
  flex: 1;
}

.activity-type {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.activity-icon {
  font-size: 18px;
}

.activity-name {
  font-weight: 600;
  color: #333;
}

.link-condition {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-text {
  font-size: 14px;
  color: #666;
}

.link-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-link-section {
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.create-link-section h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.threshold-unit {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.preview-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.preview-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.badge-preview,
.activity-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 8px;
}

.badge-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.activity-icon {
  font-size: 24px;
}

.badge-info h5,
.activity-info h5 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 14px;
}

.badge-info p,
.activity-info p {
  margin: 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.trigger-arrow {
  font-size: 20px;
  color: #2e7d32;
  font-weight: bold;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .link-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .link-actions {
    justify-content: center;
  }

  .preview-card {
    flex-direction: column;
    gap: 12px;
  }

  .trigger-arrow {
    transform: rotate(90deg);
  }
}
</style>
