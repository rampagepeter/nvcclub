import { ref, onMounted, onUnmounted, readonly } from 'vue'

export interface PerformanceMetrics {
  pageLoadTime: number
  renderTime: number
  networkLatency: number
  memoryUsage: number
  fps: number
  timestamp: Date
}

export interface ComponentPerformance {
  componentName: string
  mountTime: number
  updateTime: number
  unmountTime: number
}

// 全局性能状态
const performanceData = ref<PerformanceMetrics[]>([])
const componentPerformance = ref<ComponentPerformance[]>([])
const isMonitoring = ref(false)

// FPS监控
let fpsCounter = 0
let fpsLastTime = performance.now()
let fpsAnimationId: number

const countFPS = () => {
  fpsCounter++
  const now = performance.now()

  if (now - fpsLastTime >= 1000) {
    const currentFPS = Math.round((fpsCounter * 1000) / (now - fpsLastTime))

    // 如果FPS低于30，记录性能问题
    if (currentFPS < 30 && isMonitoring.value) {
      console.warn('Performance Warning: Low FPS detected:', currentFPS)
    }

    fpsCounter = 0
    fpsLastTime = now
  }

  if (isMonitoring.value) {
    fpsAnimationId = requestAnimationFrame(countFPS)
  }
}

export function usePerformance() {
  // 开始性能监控
  const startMonitoring = () => {
    isMonitoring.value = true
    fpsAnimationId = requestAnimationFrame(countFPS)
    console.log('Performance monitoring started')
  }

  // 停止性能监控
  const stopMonitoring = () => {
    isMonitoring.value = false
    if (fpsAnimationId) {
      cancelAnimationFrame(fpsAnimationId)
    }
    console.log('Performance monitoring stopped')
  }

  // 记录页面性能
  const recordPagePerformance = (pageName: string) => {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      renderTime: paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
      networkLatency: navigation.responseStart - navigation.requestStart,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      fps: 60, // 默认值，实际FPS需要单独监控
      timestamp: new Date(),
    }

    performanceData.value.unshift(metrics)

    // 保持最近50条记录
    if (performanceData.value.length > 50) {
      performanceData.value = performanceData.value.slice(0, 50)
    }

    // 性能警告
    if (metrics.pageLoadTime > 3000) {
      console.warn(
        `Performance Warning: Slow page load for ${pageName}:`,
        metrics.pageLoadTime + 'ms',
      )
    }

    console.log(`Page Performance for ${pageName}:`, metrics)
  }

  // 记录组件性能
  const recordComponentPerformance = (
    componentName: string,
    phase: 'mount' | 'update' | 'unmount',
    duration: number,
  ) => {
    const existing = componentPerformance.value.find((c) => c.componentName === componentName)

    if (existing) {
      if (phase === 'mount') existing.mountTime = duration
      else if (phase === 'update') existing.updateTime = duration
      else if (phase === 'unmount') existing.unmountTime = duration
    } else {
      const newRecord: ComponentPerformance = {
        componentName,
        mountTime: phase === 'mount' ? duration : 0,
        updateTime: phase === 'update' ? duration : 0,
        unmountTime: phase === 'unmount' ? duration : 0,
      }
      componentPerformance.value.push(newRecord)
    }

    // 组件性能警告
    if (duration > 100) {
      console.warn(
        `Performance Warning: Slow component ${phase} for ${componentName}:`,
        duration + 'ms',
      )
    }
  }

  // 测量异步操作性能
  const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime

      console.log(`Async Operation "${name}" completed in ${duration.toFixed(2)}ms`)

      if (duration > 2000) {
        console.warn(`Performance Warning: Slow async operation "${name}":`, duration + 'ms')
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`Async Operation "${name}" failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }

  // 测量渲染性能
  const measureRender = (name: string, fn: () => void) => {
    const startTime = performance.now()
    fn()
    const duration = performance.now() - startTime

    console.log(`Render Operation "${name}" completed in ${duration.toFixed(2)}ms`)

    if (duration > 16.67) {
      // 60fps = 16.67ms per frame
      console.warn(`Performance Warning: Slow render operation "${name}":`, duration + 'ms')
    }
  }

  // 内存使用监控
  const checkMemoryUsage = () => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)

      console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`)

      // 内存使用警告
      if (usedMB > limitMB * 0.8) {
        console.warn('Performance Warning: High memory usage detected:', `${usedMB}MB`)
      }

      return { usedMB, totalMB, limitMB }
    }
    return null
  }

  // 网络性能监控
  const monitorNetworkPerformance = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      console.log('Network Performance:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      })

      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      }
    }
    return null
  }

  // 获取性能统计
  const getPerformanceStats = () => {
    const recentMetrics = performanceData.value.slice(0, 10)

    if (recentMetrics.length === 0) {
      return null
    }

    const avgLoadTime =
      recentMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / recentMetrics.length
    const avgRenderTime =
      recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length
    const avgNetworkLatency =
      recentMetrics.reduce((sum, m) => sum + m.networkLatency, 0) / recentMetrics.length

    return {
      avgLoadTime: Math.round(avgLoadTime),
      avgRenderTime: Math.round(avgRenderTime),
      avgNetworkLatency: Math.round(avgNetworkLatency),
      totalMeasurements: recentMetrics.length,
    }
  }

  // 导出性能报告
  const exportPerformanceReport = () => {
    const report = {
      performanceData: performanceData.value,
      componentPerformance: componentPerformance.value,
      stats: getPerformanceStats(),
      memoryUsage: checkMemoryUsage(),
      networkInfo: monitorNetworkPerformance(),
      timestamp: new Date(),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    // 状态
    performanceData: readonly(performanceData),
    componentPerformance: readonly(componentPerformance),
    isMonitoring: readonly(isMonitoring),

    // 方法
    startMonitoring,
    stopMonitoring,
    recordPagePerformance,
    recordComponentPerformance,
    measureAsync,
    measureRender,
    checkMemoryUsage,
    monitorNetworkPerformance,
    getPerformanceStats,
    exportPerformanceReport,
  }
}

// 组件性能监控装饰器
export function withPerformanceMonitoring(componentName: string) {
  return {
    setup() {
      const { recordComponentPerformance } = usePerformance()
      let mountStartTime = 0

      onMounted(() => {
        const mountEndTime = performance.now()
        recordComponentPerformance(componentName, 'mount', mountEndTime - mountStartTime)
      })

      onUnmounted(() => {
        const unmountStartTime = performance.now()
        recordComponentPerformance(componentName, 'unmount', performance.now() - unmountStartTime)
      })

      // 记录mount开始时间
      mountStartTime = performance.now()
    },
  }
}

// 全局性能监控器
export const globalPerformanceMonitor = usePerformance()

// 自动开始监控
// @ts-ignore
if (import.meta.env?.DEV) {
  globalPerformanceMonitor.startMonitoring()
}
