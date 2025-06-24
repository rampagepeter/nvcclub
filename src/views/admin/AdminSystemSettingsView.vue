<template>
  <AdminLayout>
    <div class="system-settings">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1>⚙️ 系统设置</h1>
          <p>管理系统参数配置、活动类型设置和积分奖励规则</p>
        </div>
        <div class="header-actions">
          <el-button @click="loadAllConfigs">
            <el-icon><Refresh /></el-icon>
            刷新配置
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section" v-loading="statsLoading">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.activeActivityTypes }}</div>
                <div class="stat-label">活跃活动类型</div>
              </div>
              <div class="stat-icon activity-icon">🎯</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.activeBadges }}</div>
                <div class="stat-label">可获得徽章</div>
              </div>
              <div class="stat-icon badge-icon">🏆</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalXpDistributed.toLocaleString() }}</div>
                <div class="stat-label">累计分发经验值</div>
              </div>
              <div class="stat-icon xp-icon">⭐</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.avgXpPerActivity }}</div>
                <div class="stat-label">平均活动奖励</div>
              </div>
              <div class="stat-icon avg-icon">📊</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 配置选项卡 -->
      <div class="settings-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 活动类型配置 -->
          <el-tab-pane label="活动类型配置" name="activity">
            <div class="activity-config-section">
              <div v-loading="activityConfigLoading">
                <div
                  v-for="config in activityConfigs"
                  :key="config.type"
                  class="activity-config-card"
                >
                  <el-card>
                    <template #header>
                      <div class="config-header">
                        <div class="config-title">
                          <h3>{{ getActivityTypeIcon(config.type) }} {{ config.name }}</h3>
                          <p>{{ config.description }}</p>
                        </div>
                        <div class="config-actions">
                          <el-switch
                            v-model="config.isActive"
                            @change="updateActivityStatus(config)"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                          <el-button size="small" @click="editActivityConfig(config)">
                            编辑配置
                          </el-button>
                          <el-button
                            size="small"
                            type="warning"
                            @click="resetActivityConfig(config.type)"
                          >
                            重置默认
                          </el-button>
                        </div>
                      </div>
                    </template>

                    <div class="config-content">
                      <!-- 基础配置 -->
                      <div class="config-section">
                        <h4>📋 基础配置</h4>
                        <el-row :gutter="20">
                          <el-col :span="8">
                            <div class="config-item">
                              <label>基础经验值奖励</label>
                              <span class="config-value">{{ config.baseXpReward }} XP</span>
                            </div>
                          </el-col>
                          <el-col :span="8">
                            <div class="config-item">
                              <label>默认活动时长</label>
                              <span class="config-value">{{ config.defaultDuration }} 分钟</span>
                            </div>
                          </el-col>
                          <el-col :span="8">
                            <div class="config-item">
                              <label>默认容量</label>
                              <span class="config-value">{{ config.defaultCapacity }} 人</span>
                            </div>
                          </el-col>
                        </el-row>
                      </div>

                      <!-- 奖励规则 -->
                      <div class="config-section">
                        <h4>🎁 积分奖励规则</h4>
                        <el-row :gutter="20">
                          <el-col :span="8">
                            <div class="config-item">
                              <label>等级倍数奖励</label>
                              <span class="config-value"
                                >{{ config.bonusXpRules.userLevelMultiplier * 100 }}% /级</span
                              >
                            </div>
                          </el-col>
                          <el-col :span="8">
                            <div class="config-item">
                              <label>连续参与奖励</label>
                              <span class="config-value"
                                >+{{ config.bonusXpRules.streakBonus }} XP</span
                              >
                            </div>
                          </el-col>
                          <el-col :span="8">
                            <div class="config-item">
                              <label>高质量奖励</label>
                              <span class="config-value"
                                >+{{ config.bonusXpRules.qualityBonus }} XP</span
                              >
                            </div>
                          </el-col>
                        </el-row>
                      </div>

                      <!-- 参与要求 -->
                      <div class="config-section">
                        <h4>🎯 参与要求</h4>
                        <el-row :gutter="20">
                          <el-col :span="8">
                            <div class="config-item">
                              <label>最低等级要求</label>
                              <span class="config-value"
                                >Lv.{{ config.participationRequirements.minLevel }}</span
                              >
                            </div>
                          </el-col>
                          <el-col :span="8">
                            <div class="config-item">
                              <label>必需徽章</label>
                              <span class="config-value">
                                {{
                                  config.participationRequirements.requiredBadges.length === 0
                                    ? '无要求'
                                    : config.participationRequirements.requiredBadges.join(', ')
                                }}
                              </span>
                            </div>
                          </el-col>
                          <el-col :span="8">
                            <div class="config-item">
                              <label>冷却时间</label>
                              <span class="config-value"
                                >{{ config.participationRequirements.cooldownHours }} 小时</span
                              >
                            </div>
                          </el-col>
                        </el-row>
                      </div>

                      <!-- 徽章触发规则 -->
                      <div class="config-section">
                        <h4>🏆 徽章触发规则</h4>
                        <div class="badge-rules">
                          <div
                            v-for="rule in config.badgeTriggerRules"
                            :key="rule.badgeId"
                            class="badge-rule-item"
                          >
                            <span class="badge-icon">🏆</span>
                            <span class="rule-text">{{ rule.description }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 徽章系统配置 -->
          <el-tab-pane label="徽章系统配置" name="badge">
            <div class="badge-config-section" v-loading="badgeConfigLoading">
              <div class="section-header">
                <h3>🏆 徽章系统配置</h3>
                <p>管理徽章的获得条件、奖励和显示设置</p>
              </div>

              <div v-for="badge in badgeConfigs" :key="badge.badgeId" class="badge-config-item">
                <el-card>
                  <div class="badge-config-content">
                    <div class="badge-info">
                      <div class="badge-basic">
                        <img :src="badge.iconUrl" :alt="badge.name" class="badge-icon-img" />
                        <div class="badge-details">
                          <h4>{{ badge.name }}</h4>
                          <p>{{ badge.description }}</p>
                          <div class="badge-meta">
                            <el-tag :type="getBadgeCategoryType(badge.category)" size="small">
                              {{ getBadgeCategoryText(badge.category) }}
                            </el-tag>
                            <el-tag :type="getBadgeRarityType(badge.rarity)" size="small">
                              {{ getBadgeRarityText(badge.rarity) }}
                            </el-tag>
                          </div>
                        </div>
                      </div>

                      <div class="badge-criteria">
                        <h5>获得条件</h5>
                        <p>{{ getBadgeCriteriaText(badge.unlockCriteria) }}</p>

                        <h5>奖励</h5>
                        <div class="badge-rewards">
                          <span v-if="badge.rewards.xpBonus > 0">
                            经验值加成: +{{ badge.rewards.xpBonus }}%
                          </span>
                          <span v-if="badge.rewards.specialPrivileges.length > 0">
                            特殊权限: {{ badge.rewards.specialPrivileges.join(', ') }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="badge-actions">
                      <el-switch
                        v-model="badge.isActive"
                        @change="updateBadgeStatus(badge)"
                        active-text="启用"
                        inactive-text="禁用"
                      />
                      <el-button size="small" @click="editBadgeConfig(badge)"> 编辑 </el-button>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>

          <!-- 通用系统设置 -->
          <el-tab-pane label="通用设置" name="general">
            <div class="general-config-section" v-loading="generalConfigLoading">
              <div class="section-header">
                <h3>🔧 通用系统设置</h3>
                <p>管理系统的基础参数和功能开关</p>
              </div>

              <div
                v-for="config in generalConfigs"
                :key="config.configId"
                class="general-config-item"
              >
                <el-card>
                  <div class="config-item-content">
                    <div class="config-info">
                      <h4>{{ config.description }}</h4>
                      <p class="config-key">配置键: {{ config.key }}</p>
                      <el-tag :type="getConfigCategoryType(config.category)" size="small">
                        {{ getConfigCategoryText(config.category) }}
                      </el-tag>
                    </div>

                    <div class="config-value-editor">
                      <!-- 字符串类型 -->
                      <el-input
                        v-if="config.dataType === 'string'"
                        v-model="config.value"
                        @blur="updateGeneralConfig(config)"
                        :disabled="!config.isEditable"
                      />

                      <!-- 数字类型 -->
                      <el-input-number
                        v-else-if="config.dataType === 'number'"
                        v-model="config.value"
                        @blur="updateGeneralConfig(config)"
                        :disabled="!config.isEditable"
                      />

                      <!-- 布尔类型 -->
                      <el-switch
                        v-else-if="config.dataType === 'boolean'"
                        v-model="config.value"
                        @change="updateGeneralConfig(config)"
                        :disabled="!config.isEditable"
                      />

                      <!-- 数组类型 -->
                      <el-input
                        v-else-if="config.dataType === 'array'"
                        :model-value="JSON.stringify(config.value)"
                        @input="updateArrayConfig(config, $event)"
                        @blur="updateGeneralConfig(config)"
                        placeholder="JSON格式数组"
                        :disabled="!config.isEditable"
                      />

                      <!-- 对象类型 -->
                      <el-input
                        v-else-if="config.dataType === 'object'"
                        :model-value="JSON.stringify(config.value)"
                        type="textarea"
                        :rows="3"
                        @input="updateObjectConfig(config, $event)"
                        @blur="updateGeneralConfig(config)"
                        placeholder="JSON格式对象"
                        :disabled="!config.isEditable"
                      />
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 活动配置编辑对话框 -->
    <el-dialog
      v-model="showActivityConfigDialog"
      :title="`编辑${editingActivityConfig?.name}配置`"
      width="800px"
    >
      <el-form
        v-if="editingActivityConfig"
        :model="activityConfigForm"
        :rules="activityConfigRules"
        ref="activityConfigFormRef"
        label-width="120px"
      >
        <el-tabs v-model="configEditTab">
          <el-tab-pane label="基础配置" name="basic">
            <el-form-item label="基础经验奖励" prop="baseXpReward">
              <el-input-number
                v-model="activityConfigForm.baseXpReward"
                :min="10"
                :max="1000"
                :step="10"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">XP</span>
            </el-form-item>

            <el-form-item label="默认时长" prop="defaultDuration">
              <el-input-number
                v-model="activityConfigForm.defaultDuration"
                :min="30"
                :max="480"
                :step="15"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">分钟</span>
            </el-form-item>

            <el-form-item label="默认容量" prop="defaultCapacity">
              <el-input-number
                v-model="activityConfigForm.defaultCapacity"
                :min="5"
                :max="500"
                :step="5"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">人</span>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="奖励规则" name="bonus">
            <el-form-item label="等级倍数奖励">
              <el-input-number
                v-model="activityConfigForm.bonusXpRules.userLevelMultiplier"
                :min="0"
                :max="1"
                :step="0.05"
                :precision="2"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">每级增加比例</span>
            </el-form-item>

            <el-form-item label="连续参与奖励">
              <el-input-number
                v-model="activityConfigForm.bonusXpRules.streakBonus"
                :min="0"
                :max="100"
                :step="5"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">XP</span>
            </el-form-item>

            <el-form-item label="高质量奖励">
              <el-input-number
                v-model="activityConfigForm.bonusXpRules.qualityBonus"
                :min="0"
                :max="200"
                :step="10"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">XP</span>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="参与要求" name="requirements">
            <el-form-item label="最低等级要求">
              <el-input-number
                v-model="activityConfigForm.participationRequirements.minLevel"
                :min="1"
                :max="50"
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item label="冷却时间">
              <el-input-number
                v-model="activityConfigForm.participationRequirements.cooldownHours"
                :min="0"
                :max="168"
                style="width: 200px"
              />
              <span style="margin-left: 8px; color: #666">小时</span>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelActivityConfigEdit">取消</el-button>
          <el-button
            type="primary"
            :loading="activityConfigSubmitLoading"
            @click="submitActivityConfig"
          >
            保存配置
          </el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { systemConfigApi } from '@/services/systemConfigApi'
import type {
  ActivityTypeConfig,
  SystemConfig,
  BadgeSystemConfig,
  ConfigManagementStats,
  UpdateActivityConfigRequest,
} from '@/types'

// 响应式数据
const statsLoading = ref(false)
const activityConfigLoading = ref(false)
const badgeConfigLoading = ref(false)
const generalConfigLoading = ref(false)

const activeTab = ref('activity')
const stats = ref<ConfigManagementStats>({
  totalConfigs: 0,
  activeActivityTypes: 0,
  activeBadges: 0,
  totalXpDistributed: 0,
  avgXpPerActivity: 0,
  mostTriggeredBadge: {
    badgeId: '',
    name: '',
    triggerCount: 0,
  },
  activityTypeStats: [],
})

const activityConfigs = ref<ActivityTypeConfig[]>([])
const badgeConfigs = ref<BadgeSystemConfig[]>([])
const generalConfigs = ref<SystemConfig[]>([])

// 活动配置编辑
const showActivityConfigDialog = ref(false)
const editingActivityConfig = ref<ActivityTypeConfig | null>(null)
const activityConfigSubmitLoading = ref(false)
const activityConfigFormRef = ref<FormInstance>()
const configEditTab = ref('basic')

const activityConfigForm = reactive({
  baseXpReward: 50,
  defaultDuration: 60,
  defaultCapacity: 30,
  bonusXpRules: {
    userLevelMultiplier: 0.1,
    streakBonus: 5,
    qualityBonus: 10,
  },
  participationRequirements: {
    minLevel: 1,
    cooldownHours: 0,
  },
})

const activityConfigRules: FormRules = {
  baseXpReward: [{ required: true, message: '请输入基础经验奖励', trigger: 'blur' }],
  defaultDuration: [{ required: true, message: '请输入默认时长', trigger: 'blur' }],
  defaultCapacity: [{ required: true, message: '请输入默认容量', trigger: 'blur' }],
}

// 方法
const loadAllConfigs = async () => {
  await Promise.all([loadStats(), loadActivityConfigs(), loadBadgeConfigs(), loadGeneralConfigs()])
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    const response = await systemConfigApi.getConfigStats()
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

const loadActivityConfigs = async () => {
  activityConfigLoading.value = true
  try {
    const response = await systemConfigApi.getActivityTypeConfigs()
    if (response.success && response.data) {
      activityConfigs.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载活动配置失败')
  } finally {
    activityConfigLoading.value = false
  }
}

const loadBadgeConfigs = async () => {
  badgeConfigLoading.value = true
  try {
    const response = await systemConfigApi.getBadgeConfigs()
    if (response.success && response.data) {
      badgeConfigs.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载徽章配置失败')
  } finally {
    badgeConfigLoading.value = false
  }
}

const loadGeneralConfigs = async () => {
  generalConfigLoading.value = true
  try {
    const response = await systemConfigApi.getSystemConfigs()
    if (response.success && response.data) {
      generalConfigs.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载通用配置失败')
  } finally {
    generalConfigLoading.value = false
  }
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName

  // 根据切换的选项卡加载对应数据
  switch (tabName) {
    case 'activity':
      if (activityConfigs.value.length === 0) {
        loadActivityConfigs()
      }
      break
    case 'badge':
      if (badgeConfigs.value.length === 0) {
        loadBadgeConfigs()
      }
      break
    case 'general':
      if (generalConfigs.value.length === 0) {
        loadGeneralConfigs()
      }
      break
  }
}

const getActivityTypeIcon = (type: string) => {
  const icons = {
    EmpathyStation: '🏠',
    ThemeSalon: '💬',
    LifeGrowth: '🎤',
  }
  return icons[type as keyof typeof icons] || '📚'
}

const editActivityConfig = (config: ActivityTypeConfig) => {
  editingActivityConfig.value = config

  // 复制配置到表单
  activityConfigForm.baseXpReward = config.baseXpReward
  activityConfigForm.defaultDuration = config.defaultDuration
  activityConfigForm.defaultCapacity = config.defaultCapacity
  activityConfigForm.bonusXpRules = { ...config.bonusXpRules }
  activityConfigForm.participationRequirements = { ...config.participationRequirements }

  showActivityConfigDialog.value = true
}

const cancelActivityConfigEdit = () => {
  showActivityConfigDialog.value = false
  editingActivityConfig.value = null
  configEditTab.value = 'basic'
}

const submitActivityConfig = async () => {
  if (!activityConfigFormRef.value || !editingActivityConfig.value) return

  try {
    await activityConfigFormRef.value.validate()
  } catch (error) {
    return
  }

  activityConfigSubmitLoading.value = true
  try {
    const request: UpdateActivityConfigRequest = {
      baseXpReward: activityConfigForm.baseXpReward,
      defaultDuration: activityConfigForm.defaultDuration,
      defaultCapacity: activityConfigForm.defaultCapacity,
      bonusXpRules: activityConfigForm.bonusXpRules,
      participationRequirements: activityConfigForm.participationRequirements,
    }

    const response = await systemConfigApi.updateActivityTypeConfig(
      editingActivityConfig.value.type,
      request,
    )

    if (response.success) {
      ElMessage.success('活动配置更新成功')
      showActivityConfigDialog.value = false
      await loadActivityConfigs()
    } else {
      ElMessage.error(response.error || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  } finally {
    activityConfigSubmitLoading.value = false
  }
}

const updateActivityStatus = async (config: ActivityTypeConfig) => {
  try {
    const response = await systemConfigApi.updateActivityTypeConfig(config.type, {
      isActive: config.isActive,
    })

    if (response.success) {
      ElMessage.success(`${config.name}已${config.isActive ? '启用' : '禁用'}`)
    } else {
      ElMessage.error(response.error || '操作失败')
      config.isActive = !config.isActive // 回滚状态
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    config.isActive = !config.isActive // 回滚状态
  }
}

const resetActivityConfig = async (type: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要重置该活动类型的配置为默认值吗？此操作不可恢复！',
      '重置配置',
      { type: 'warning' },
    )

    const response = await systemConfigApi.resetActivityTypeConfig(type)

    if (response.success) {
      ElMessage.success('配置已重置为默认值')
      await loadActivityConfigs()
    } else {
      ElMessage.error(response.error || '重置失败')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const updateBadgeStatus = async (badge: BadgeSystemConfig) => {
  try {
    const response = await systemConfigApi.updateBadgeConfig(badge.badgeId, {
      isActive: badge.isActive,
    })

    if (response.success) {
      ElMessage.success(`徽章"${badge.name}"已${badge.isActive ? '启用' : '禁用'}`)
    } else {
      ElMessage.error(response.error || '操作失败')
      badge.isActive = !badge.isActive // 回滚状态
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    badge.isActive = !badge.isActive // 回滚状态
  }
}

const editBadgeConfig = (badge: BadgeSystemConfig) => {
  ElMessage.info('徽章配置编辑功能开发中')
}

const updateGeneralConfig = async (config: SystemConfig) => {
  try {
    const response = await systemConfigApi.updateSystemConfig(config.configId, {
      value: config.value,
    })

    if (response.success) {
      ElMessage.success('配置更新成功')
    } else {
      ElMessage.error(response.error || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  }
}

const updateArrayConfig = (config: SystemConfig, value: string) => {
  try {
    config.value = JSON.parse(value)
  } catch (error) {
    // 忽略解析错误，等待用户完成输入
  }
}

const updateObjectConfig = (config: SystemConfig, value: string) => {
  try {
    config.value = JSON.parse(value)
  } catch (error) {
    // 忽略解析错误，等待用户完成输入
  }
}

// 辅助方法
const getBadgeCategoryType = (category: string) => {
  const types = {
    Skill: 'success',
    Participation: 'primary',
    Contribution: 'warning',
    Special: 'danger',
  }
  return types[category as keyof typeof types] || 'info'
}

const getBadgeCategoryText = (category: string) => {
  const texts = {
    Skill: '技能类',
    Participation: '参与类',
    Contribution: '贡献类',
    Special: '特殊类',
  }
  return texts[category as keyof typeof texts] || category
}

const getBadgeRarityType = (rarity: string) => {
  const types = {
    common: 'info',
    rare: 'primary',
    epic: 'warning',
    legendary: 'danger',
  }
  return types[rarity as keyof typeof types] || 'info'
}

const getBadgeRarityText = (rarity: string) => {
  const texts = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return texts[rarity as keyof typeof texts] || rarity
}

const getBadgeCriteriaText = (criteria: any) => {
  const typeTexts = {
    activity_count: '活动参与次数',
    streak_days: '连续天数',
    post_count: '发帖数量',
    level_reached: '等级达到',
    xp_earned: '经验值获得',
  }

  let text = `${typeTexts[criteria.type as keyof typeof typeTexts] || criteria.type}: ${criteria.threshold}`

  if (criteria.activityTypes) {
    const activityNames = criteria.activityTypes.map((type: string) => {
      return type === 'EmpathyStation'
        ? '同理心驿站'
        : type === 'ThemeSalon'
          ? '主题沙龙'
          : type === 'LifeGrowth'
            ? '生命成长'
            : type
    })
    text += ` (${activityNames.join('、')})`
  }

  if (criteria.timeframe && criteria.timeframe !== 'all_time') {
    const timeframeTexts = {
      monthly: '月度',
      yearly: '年度',
    }
    text += ` - ${timeframeTexts[criteria.timeframe as keyof typeof timeframeTexts]}`
  }

  return text
}

const getConfigCategoryType = (category: string) => {
  const types = {
    general: 'primary',
    activity: 'success',
    badge: 'warning',
    notification: 'info',
  }
  return types[category as keyof typeof types] || 'info'
}

const getConfigCategoryText = (category: string) => {
  const texts = {
    general: '通用',
    activity: '活动',
    badge: '徽章',
    notification: '通知',
  }
  return texts[category as keyof typeof texts] || category
}

// 初始化
onMounted(() => {
  loadStats()
  loadActivityConfigs() // 默认先加载活动配置
})
</script>

<style scoped>
.system-settings {
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

.settings-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.activity-config-card {
  margin-bottom: 24px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.config-title h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.config-title p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.config-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.config-content {
  padding-top: 16px;
}

.config-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.config-section h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-item label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.config-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.badge-rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge-rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.badge-config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
}

.section-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.badge-config-item {
  margin-bottom: 16px;
}

.badge-config-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.badge-info {
  flex: 1;
  display: flex;
  gap: 20px;
}

.badge-basic {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.badge-icon-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f0f0f0;
}

.badge-details h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}

.badge-details p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.badge-meta {
  display: flex;
  gap: 8px;
}

.badge-criteria h5 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.badge-criteria p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 13px;
}

.badge-rewards {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.badge-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.general-config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.general-config-item {
  margin-bottom: 16px;
}

.config-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.config-info {
  flex: 1;
}

.config-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}

.config-key {
  margin: 0 0 8px 0;
  color: #999;
  font-size: 12px;
  font-family: monospace;
}

.config-value-editor {
  min-width: 200px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-settings {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .config-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .config-actions {
    justify-content: flex-start;
  }

  .badge-config-content,
  .config-item-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .badge-info {
    flex-direction: column;
    gap: 12px;
  }

  .badge-actions {
    flex-direction: row;
    justify-content: center;
  }

  .config-value-editor {
    min-width: auto;
  }
}
</style>
