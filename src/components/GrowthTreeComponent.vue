<template>
  <div class="growth-tree">
    <svg width="100%" height="100%" viewBox="0 0 300 200" class="tree-svg">
      <!-- 树干 -->
      <rect x="140" y="120" width="20" height="60" rx="10" fill="#8D6E63" class="tree-trunk" />

      <!-- 树根 -->
      <path
        d="M130 180 Q120 190 110 185 M170 180 Q180 190 190 185 M140 180 Q130 195 125 190 M160 180 Q170 195 175 190"
        stroke="#8D6E63"
        stroke-width="3"
        fill="none"
        class="tree-roots"
      />

      <!-- 树冠基础 -->
      <circle
        cx="150"
        cy="100"
        :r="treeSize"
        :fill="treeColor"
        class="tree-crown"
        :class="{ 'animate-pulse': isGrowing }"
      />

      <!-- 叶子装饰 -->
      <g v-for="(leaf, index) in displayLeaves" :key="`leaf-${index}`">
        <text
          :x="leaf.x"
          :y="leaf.y"
          font-size="12"
          text-anchor="middle"
          class="tree-element leaf"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          🍃
        </text>
      </g>

      <!-- 花朵装饰 -->
      <g v-for="(flower, index) in displayFlowers" :key="`flower-${index}`">
        <text
          :x="flower.x"
          :y="flower.y"
          font-size="14"
          text-anchor="middle"
          class="tree-element flower"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          🌸
        </text>
      </g>

      <!-- 果实装饰 -->
      <g v-for="(fruit, index) in displayFruits" :key="`fruit-${index}`">
        <text
          :x="fruit.x"
          :y="fruit.y"
          font-size="16"
          text-anchor="middle"
          class="tree-element fruit"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          🍎
        </text>
      </g>

      <!-- 等级指示器 -->
      <g class="level-indicator">
        <circle cx="50" cy="30" r="20" fill="#FFB74D" stroke="#FF9800" stroke-width="2" />
        <text x="50" y="26" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">
          等级
        </text>
        <text x="50" y="38" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">
          {{ treeLevel }}
        </text>
      </g>

      <!-- 成长提示 -->
      <text
        v-if="showGrowthTip"
        x="150"
        y="30"
        text-anchor="middle"
        font-size="12"
        fill="#4CAF50"
        font-weight="bold"
        class="growth-tip"
      >
        {{ growthTipText }}
      </text>
    </svg>

    <!-- 树木状态说明 -->
    <div class="tree-legend">
      <div class="legend-item">
        <span class="legend-icon">🍃</span>
        <span class="legend-text">{{ treeData?.elements?.leaves || 0 }} 片叶子</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon">🌸</span>
        <span class="legend-text">{{ treeData?.elements?.flowers || 0 }} 朵花</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon">🍎</span>
        <span class="legend-text">{{ treeData?.elements?.fruits || 0 }} 个果实</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface TreeData {
  level: number
  elements: {
    leaves: number
    flowers: number
    fruits: number
  }
}

interface TreeElement {
  x: number
  y: number
}

const props = defineProps<{
  treeData?: TreeData
}>()

// 响应式状态
const isGrowing = ref(false)
const showGrowthTip = ref(false)
const growthTipText = ref('')

// 计算属性
const treeLevel = computed(() => props.treeData?.level || 1)

const treeSize = computed(() => {
  const baseSize = 30
  const level = treeLevel.value
  return Math.min(baseSize + level * 5, 60) // 最大半径60
})

const treeColor = computed(() => {
  const level = treeLevel.value
  if (level >= 10) return '#2E7D32' // 深绿色
  if (level >= 5) return '#4CAF50' // 绿色
  if (level >= 2) return '#66BB6A' // 浅绿色
  return '#81C784' // 嫩绿色
})

// 生成随机位置的树木元素
const generateTreeElements = (count: number, radius: number): TreeElement[] => {
  const elements: TreeElement[] = []
  const centerX = 150
  const centerY = 100

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5
    const distance = radius * 0.6 + Math.random() * radius * 0.4
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance

    elements.push({ x, y })
  }

  return elements
}

const displayLeaves = computed(() => {
  const count = Math.min(props.treeData?.elements?.leaves || 0, 12)
  return generateTreeElements(count, treeSize.value)
})

const displayFlowers = computed(() => {
  const count = Math.min(props.treeData?.elements?.flowers || 0, 8)
  return generateTreeElements(count, treeSize.value * 0.8)
})

const displayFruits = computed(() => {
  const count = Math.min(props.treeData?.elements?.fruits || 0, 5)
  return generateTreeElements(count, treeSize.value * 0.6)
})

// 显示成长动画
const showGrowthAnimation = (message: string) => {
  isGrowing.value = true
  showGrowthTip.value = true
  growthTipText.value = message

  setTimeout(() => {
    isGrowing.value = false
    showGrowthTip.value = false
  }, 2000)
}

// 监听数据变化
watch(
  () => props.treeData,
  (newData, oldData) => {
    if (!oldData || !newData) return

    // 检查是否有新的成长
    if (newData.level > oldData.level) {
      showGrowthAnimation('恭喜升级！🎉')
    } else if (
      newData.elements.leaves > oldData.elements.leaves ||
      newData.elements.flowers > oldData.elements.flowers ||
      newData.elements.fruits > oldData.elements.fruits
    ) {
      showGrowthAnimation('生命之树正在成长！🌱')
    }
  },
  { deep: true },
)

onMounted(() => {
  // 初始化时播放欢迎动画
  setTimeout(() => {
    showGrowthAnimation('欢迎来到你的生命之树！')
  }, 500)
})
</script>

<style scoped>
.growth-tree {
  width: 100%;
  height: 100%;
  position: relative;
}

.tree-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.tree-trunk {
  transition: all 0.3s ease;
}

.tree-roots {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.tree-crown {
  transition: all 0.5s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.tree-crown.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

.tree-element {
  opacity: 0;
  animation: elementFadeIn 0.8s ease-out forwards;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.tree-element:hover {
  transform: scale(1.2);
}

.leaf {
  animation-delay: 0.5s;
}

.flower {
  animation-delay: 1s;
}

.fruit {
  animation-delay: 1.5s;
}

.level-indicator {
  opacity: 0;
  animation: fadeIn 1s ease-out 0.2s forwards;
}

.growth-tip {
  opacity: 0;
  animation: tipFadeInOut 2s ease-in-out forwards;
}

.tree-legend {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-icon {
  font-size: 14px;
}

.legend-text {
  color: #666;
  font-weight: 500;
}

/* 动画定义 */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes elementFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tipFadeInOut {
  0%,
  100% {
    opacity: 0;
    transform: translateY(-5px);
  }
  20%,
  80% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .tree-legend {
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
  }
}
</style>
