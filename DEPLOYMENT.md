# 🚀 NVC成长乐园 - 部署指南

## 📋 部署概述

本项目支持多种部署方式，包括 Vercel、Netlify 等现代化静态网站托管平台。

## 🛠️ 构建配置

### 生产环境构建
```bash
npm run build:prod
```

### 本地预览生产构建
```bash
npm run preview:prod
```

## 🌐 支持的部署平台

### 1. Vercel 部署 (推荐)

#### 手动部署
1. 在 Vercel 官网创建账户
2. 连接 GitHub 仓库
3. 配置构建设置：
   - Framework Preset: `Vite`
   - Build Command: `npm run build:prod`
   - Output Directory: `dist`
   - Install Command: `npm ci`

#### 自动部署 (CI/CD)
1. 在 GitHub 仓库设置中添加以下 Secrets：
   - `VERCEL_TOKEN`: Vercel API Token
   - `VERCEL_ORG_ID`: 组织 ID
   - `VERCEL_PROJECT_ID`: 项目 ID

2. 推送代码到 `main` 分支将自动触发部署

### 2. Netlify 部署

#### 手动部署
1. 在 Netlify 官网创建账户
2. 拖拽 `dist` 文件夹到 Netlify 部署区域

#### 自动部署 (CI/CD)
1. 连接 GitHub 仓库
2. 配置构建设置：
   - Build command: `npm run build:prod`
   - Publish directory: `dist`

3. 或在 GitHub Secrets 中添加：
   - `NETLIFY_SITE_ID`: 站点 ID
   - `NETLIFY_AUTH_TOKEN`: 认证令牌

### 3. GitHub Pages 部署

#### 配置 GitHub Pages
1. 在仓库设置中启用 GitHub Pages
2. 选择 GitHub Actions 作为源
3. 推送代码将自动构建和部署

#### 更新 base URL (如需要)
如果部署到子路径，需要在 `vite.config.ts` 中设置：
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... 其他配置
})
```

## 🔧 环境变量配置

### 生产环境变量
复制 `.env.example` 为 `.env` 并配置：

```env
# 应用基础配置
VITE_APP_TITLE=NVC成长乐园
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=NVC中文网年度会员计划 - 成长乐园

# API配置
VITE_API_BASE_URL=/api

# 应用配置
VITE_APP_DEFAULT_LANGUAGE=zh-CN
VITE_APP_ENABLE_DEVTOOLS=false

# 部署配置
VITE_APP_BASE_URL=/
VITE_APP_DEPLOY_ENV=production
```

## 📊 构建优化

### 当前构建配置
- **代码分割**: 自动分离 Vue、Element Plus、图表库等
- **压缩**: 使用 esbuild 进行代码压缩
- **缓存**: 静态资源设置长期缓存
- **安全**: 添加安全头部配置

### 构建大小
```
总计: ~2.2MB (压缩后 ~575KB)
- Vue 相关: ~105KB (压缩后 ~41KB)
- Element Plus: ~1MB (压缩后 ~316KB)
- 工具库: ~463KB (压缩后 ~157KB)
- 应用代码: ~其余部分
```

## 🔒 安全配置

### HTTP 安全头部
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 缓存策略
- 静态资源: 1年缓存 (`max-age=31536000`)
- HTML文件: 不缓存，确保更新及时生效

## 🧪 部署前检查清单

- [ ] 运行 `npm run lint:check` 确保代码规范
- [ ] 运行 `npm run type-check` 确保类型安全
- [ ] 运行 `npm run build:prod` 确保构建成功
- [ ] 运行 `npm run preview:prod` 测试生产构建
- [ ] 检查控制台无严重错误
- [ ] 测试主要功能流程
- [ ] 验证响应式布局
- [ ] 检查加载性能

## 📱 性能监控

### 建议的监控指标
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 性能优化建议
1. 启用 CDN 加速
2. 配置服务端压缩 (gzip/brotli)
3. 监控 Core Web Vitals
4. 定期检查 bundle 大小

## 🐛 常见问题

### 1. 路由 404 错误
确保配置了 SPA 回退规则，所有路径都指向 `index.html`

### 2. 静态资源加载失败
检查 `base` URL 配置是否正确

### 3. 环境变量不生效
确保环境变量以 `VITE_` 前缀开头

### 4. 构建失败
- 检查 Node.js 版本 (推荐 20.x)
- 清理依赖: `npm run clean && npm ci`
- 检查 TypeScript 类型错误

## 📞 技术支持

如遇到部署问题，请检查：
1. 项目 GitHub Issues
2. 构建日志详细信息
3. 浏览器控制台错误
4. 网络连接状态

---

**最后更新**: 2024年12月24日  
**文档版本**: 1.0.0 