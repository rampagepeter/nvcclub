import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      // 只在开发环境启用devTools
      ...(command === 'serve' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 生产环境优化
    build: {
      // 输出目录
      outDir: 'dist',
      // 启用压缩
      minify: 'esbuild',
      // 代码分割
      rollupOptions: {
        output: {
          // 手动分包
          manualChunks: {
            // Vue相关
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // Element Plus
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            // 图表相关
            'charts': ['chart.js', 'vue-chartjs'],
            // 工具库
            'utils': ['axios', '@vueuse/core', 'file-saver', 'xlsx'],
          },
        },
      },
      // 启用源码映射（生产环境可选）
      sourcemap: mode === 'development',
      // 警告大小限制
      chunkSizeWarningLimit: 1000,
    },
    // 服务器配置
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: true,
    },
    // 预览配置
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    // 环境变量前缀
    envPrefix: 'VITE_',
  }
})
