<template>
  <div class="badge-designer">
    <el-row :gutter="24">
      <!-- 左侧：设计区域 -->
      <el-col :span="12">
        <div class="design-area">
          <h3>徽章设计</h3>

          <!-- 徽章预览 -->
          <div class="badge-preview-container">
            <div class="badge-preview" :class="previewClasses">
              <div class="badge-background" :style="badgeStyle">
                <img
                  v-if="form.iconUrl"
                  :src="form.iconUrl"
                  :alt="form.name"
                  class="badge-icon-preview"
                />
                <div v-else class="badge-icon-placeholder">🏆</div>
              </div>
              <div class="badge-rarity-glow" :class="`rarity-${form.rarity}`"></div>
            </div>
            <div class="preview-info">
              <h4>{{ form.name || '徽章名称' }}</h4>
              <p>{{ form.description || '徽章描述' }}</p>
            </div>
          </div>

          <!-- 图标选择 -->
          <div class="icon-selection">
            <h4>选择图标</h4>
            <div class="icon-grid">
              <div
                v-for="icon in iconPresets"
                :key="icon.iconId"
                class="icon-option"
                :class="{ active: form.iconUrl === icon.iconUrl }"
                @click="selectIcon(icon)"
              >
                <img :src="icon.iconUrl" :alt="icon.name" />
                <span class="icon-name">{{ icon.name }}</span>
              </div>
            </div>

            <!-- 自定义图标上传 -->
            <div class="custom-icon-upload">
              <el-upload :show-file-list="false" :before-upload="handleIconUpload" accept="image/*">
                <el-button size="small" type="primary" plain>
                  <el-icon><Upload /></el-icon>
                  上传自定义图标
                </el-button>
              </el-upload>
            </div>
          </div>

          <!-- 颜色和效果选择 -->
          <div class="style-selection">
            <h4>样式设置</h4>

            <div class="color-selection">
              <label>背景色：</label>
              <div class="color-palette">
                <div
                  v-for="color in backgroundColors"
                  :key="color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: selectedBackgroundColor === color }"
                  @click="selectedBackgroundColor = color"
                ></div>
              </div>
            </div>

            <div class="border-selection">
              <label>边框样式：</label>
              <el-select v-model="selectedBorderStyle" placeholder="选择边框">
                <el-option
                  v-for="border in borderStyles"
                  :key="border.id"
                  :label="border.name"
                  :value="border.id"
                />
              </el-select>
            </div>

            <div class="glow-selection">
              <label>光效：</label>
              <el-select v-model="selectedGlowEffect" placeholder="选择光效">
                <el-option
                  v-for="glow in glowEffects"
                  :key="glow.id"
                  :label="glow.name"
                  :value="glow.id"
                />
              </el-select>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：配置区域 -->
      <el-col :span="12">
        <div class="config-area">
          <h3>徽章配置</h3>

          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <!-- 基础信息 -->
            <div class="form-section">
              <h4>基础信息</h4>

              <el-form-item label="徽章名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入徽章名称" />
              </el-form-item>

              <el-form-item label="徽章描述" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入徽章描述"
                />
              </el-form-item>

              <el-form-item label="徽章分类" prop="category">
                <el-select v-model="form.category" placeholder="选择分类">
                  <el-option label="技能类" value="Skill" />
                  <el-option label="参与类" value="Participation" />
                  <el-option label="贡献类" value="Contribution" />
                  <el-option label="特殊类" value="Special" />
                </el-select>
              </el-form-item>

              <el-form-item label="稀有度" prop="rarity">
                <el-select v-model="form.rarity" placeholder="选择稀有度">
                  <el-option label="普通" value="common" />
                  <el-option label="稀有" value="rare" />
                  <el-option label="史诗" value="epic" />
                  <el-option label="传说" value="legendary" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 获得条件 -->
            <div class="form-section">
              <h4>获得条件</h4>

              <el-form-item label="条件类型" prop="unlockCriteria.type">
                <el-select v-model="form.unlockCriteria.type" placeholder="选择条件类型">
                  <el-option label="活动参与次数" value="activity_count" />
                  <el-option label="连续天数" value="streak_days" />
                  <el-option label="发帖数量" value="post_count" />
                  <el-option label="等级达到" value="level_reached" />
                  <el-option label="经验值获得" value="xp_earned" />
                </el-select>
              </el-form-item>

              <el-form-item label="触发阈值" prop="unlockCriteria.threshold">
                <el-input-number
                  v-model="form.unlockCriteria.threshold"
                  :min="1"
                  :max="10000"
                  placeholder="输入阈值"
                />
              </el-form-item>

              <el-form-item
                v-if="form.unlockCriteria.type === 'activity_count'"
                label="活动类型"
                prop="unlockCriteria.activityTypes"
              >
                <el-select
                  v-model="form.unlockCriteria.activityTypes"
                  multiple
                  placeholder="选择活动类型"
                >
                  <el-option label="同理心驿站" value="EmpathyStation" />
                  <el-option label="主题沙龙" value="ThemeSalon" />
                  <el-option label="生命成长" value="LifeGrowth" />
                </el-select>
              </el-form-item>

              <el-form-item label="时间范围" prop="unlockCriteria.timeframe">
                <el-select v-model="form.unlockCriteria.timeframe" placeholder="选择时间范围">
                  <el-option label="全部时间" value="all_time" />
                  <el-option label="月度" value="monthly" />
                  <el-option label="年度" value="yearly" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 奖励设置 -->
            <div class="form-section">
              <h4>奖励设置</h4>

              <el-form-item label="经验值加成" prop="rewards.xpBonus">
                <el-input-number
                  v-model="form.rewards.xpBonus"
                  :min="0"
                  :max="100"
                  placeholder="百分比加成"
                />
                <span style="margin-left: 8px; color: #666">%</span>
              </el-form-item>

              <el-form-item label="特殊权限" prop="rewards.specialPrivileges">
                <el-select
                  v-model="form.rewards.specialPrivileges"
                  multiple
                  allow-create
                  filterable
                  placeholder="输入或选择特殊权限"
                >
                  <el-option label="优先报名权" value="优先报名权" />
                  <el-option label="导师资格" value="导师资格" />
                  <el-option label="专属头像框" value="专属头像框" />
                  <el-option label="主题建议权" value="主题建议权" />
                  <el-option label="特殊称号" value="特殊称号" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 显示设置 -->
            <div class="form-section">
              <h4>显示设置</h4>

              <el-form-item label="显示顺序" prop="displayOrder">
                <el-input-number
                  v-model="form.displayOrder"
                  :min="1"
                  :max="999"
                  placeholder="输入显示顺序"
                />
              </el-form-item>

              <el-form-item label="启用状态">
                <el-switch v-model="form.isActive" active-text="启用" inactive-text="禁用" />
              </el-form-item>
            </div>
          </el-form>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button @click="$emit('cancel')">取消</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">
              {{ isEditMode ? '更新徽章' : '创建徽章' }}
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { systemConfigApi } from '@/services/systemConfigApi'
import type { BadgeSystemConfig, CreateBadgeRequest, BadgeDesignOptions } from '@/types'

interface Props {
  badge?: BadgeSystemConfig | null
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  badge: null,
  isEditMode: false,
})

const emit = defineEmits<{
  save: [badge: CreateBadgeRequest]
  cancel: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const saving = ref(false)
const designOptions = ref<BadgeDesignOptions | null>(null)

const selectedBackgroundColor = ref('#4caf50')
const selectedBorderStyle = ref('solid')
const selectedGlowEffect = ref('soft')

const form = reactive<CreateBadgeRequest>({
  name: '',
  description: '',
  category: 'Skill',
  iconUrl: '',
  unlockCriteria: {
    type: 'activity_count',
    threshold: 10,
    timeframe: 'all_time',
    activityTypes: [],
  },
  rewards: {
    xpBonus: 0,
    specialPrivileges: [],
  },
  rarity: 'common',
  isActive: true,
  displayOrder: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入徽章名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入徽章描述', trigger: 'blur' }],
  category: [{ required: true, message: '请选择徽章分类', trigger: 'change' }],
  rarity: [{ required: true, message: '请选择稀有度', trigger: 'change' }],
  'unlockCriteria.type': [{ required: true, message: '请选择条件类型', trigger: 'change' }],
  'unlockCriteria.threshold': [{ required: true, message: '请输入触发阈值', trigger: 'blur' }],
}

// 计算属性
const iconPresets = computed(() => designOptions.value?.iconPresets || [])
const backgroundColors = computed(() => designOptions.value?.backgroundColors || [])
const borderStyles = computed(() => designOptions.value?.borderStyles || [])
const glowEffects = computed(() => designOptions.value?.glowEffects || [])

const badgeStyle = computed(() => ({
  backgroundColor: selectedBackgroundColor.value,
  borderStyle: selectedBorderStyle.value === 'none' ? 'none' : selectedBorderStyle.value,
  borderWidth: selectedBorderStyle.value === 'none' ? '0' : '2px',
  borderColor: '#333',
}))

const previewClasses = computed(() => [`glow-${selectedGlowEffect.value}`, `rarity-${form.rarity}`])

// 方法
const loadDesignOptions = async () => {
  try {
    const response = await systemConfigApi.getBadgeDesignOptions()
    if (response.success && response.data) {
      designOptions.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载设计选项失败')
  }
}

const selectIcon = (icon: any) => {
  form.iconUrl = icon.iconUrl
}

const handleIconUpload = (file: File) => {
  // 这里模拟图片上传
  const reader = new FileReader()
  reader.onload = (e) => {
    form.iconUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false // 阻止自动上传
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    // 包含设计选项的完整徽章数据
    const badgeData: CreateBadgeRequest = {
      ...form,
      iconUrl: form.iconUrl || `/badges/default_${form.category.toLowerCase()}.png`,
    }

    emit('save', badgeData)
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    saving.value = false
  }
}

// 监听徽章变化（编辑模式）
watch(
  () => props.badge,
  (newBadge) => {
    if (newBadge && props.isEditMode) {
      Object.assign(form, {
        name: newBadge.name,
        description: newBadge.description,
        category: newBadge.category,
        iconUrl: newBadge.iconUrl,
        unlockCriteria: { ...newBadge.unlockCriteria },
        rewards: { ...newBadge.rewards },
        rarity: newBadge.rarity,
        isActive: newBadge.isActive,
        displayOrder: newBadge.displayOrder,
      })
    }
  },
  { immediate: true },
)

// 初始化
onMounted(() => {
  loadDesignOptions()
})
</script>

<style scoped>
.badge-designer {
  padding: 20px;
}

.design-area,
.config-area {
  height: 600px;
  overflow-y: auto;
}

.design-area h3,
.config-area h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #2e7d32;
  padding-bottom: 8px;
}

.badge-preview-container {
  text-align: center;
  margin-bottom: 24px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.badge-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.badge-background {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.badge-icon-preview {
  width: 60px;
  height: 60px;
  border-radius: 12px;
}

.badge-icon-placeholder {
  font-size: 40px;
}

.badge-rarity-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 88px;
  height: 88px;
  border-radius: 20px;
  z-index: 0;
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

.preview-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.preview-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.icon-selection {
  margin-bottom: 24px;
}

.icon-selection h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-option:hover {
  border-color: #2e7d32;
}

.icon-option.active {
  border-color: #2e7d32;
  background: #e8f5e8;
}

.icon-option img {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.icon-name {
  font-size: 10px;
  color: #666;
  text-align: center;
}

.custom-icon-upload {
  text-align: center;
}

.style-selection {
  margin-bottom: 24px;
}

.style-selection h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.color-selection {
  margin-bottom: 16px;
}

.color-selection label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.color-option:hover,
.color-option.active {
  border-color: #333;
  transform: scale(1.1);
}

.border-selection,
.glow-selection {
  margin-bottom: 12px;
}

.border-selection label,
.glow-selection label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  background: #f0f0f0;
  padding: 8px 12px;
  border-radius: 6px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 滚动条样式 */
.design-area::-webkit-scrollbar,
.config-area::-webkit-scrollbar {
  width: 6px;
}

.design-area::-webkit-scrollbar-track,
.config-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.design-area::-webkit-scrollbar-thumb,
.config-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.design-area::-webkit-scrollbar-thumb:hover,
.config-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
