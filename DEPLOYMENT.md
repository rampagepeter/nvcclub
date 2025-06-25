# 🚀 NVC成长乐园部署指南

本指南将帮助您在不同平台上部署NVC成长乐园项目。

## 📋 前提条件

- Node.js 20.x 或更高版本
- npm 9.x 或更高版本
- Git

## 🌐 GitHub仓库信息

- **项目地址**: https://github.com/rampagepeter/nvcclub
- **主分支**: master
- **项目状态**: ✅ 生产就绪

## 🎯 平台部署选项

### 1. Vercel (推荐)

#### 一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rampagepeter/nvcclub)

#### 手动部署步骤
1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入GitHub仓库: `https://github.com/rampagepeter/nvcclub`
4. 配置构建设置：
   - Framework Preset: `Vue`
   - Build Command: `npm run build:prod`
   - Output Directory: `dist`
5. 点击 "Deploy"

### 2. Netlify

#### 一键部署
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rampagepeter/nvcclub)

#### 手动部署步骤
1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "New site from Git"
3. 选择GitHub并连接仓库: `rampagepeter/nvcclub`
4. 配置构建设置：
   - Branch: `master`
   - Build command: `npm run build:prod`
   - Publish directory: `dist`
5. 点击 "Deploy site"

### 3. GitHub Pages

项目已配置GitHub Actions自动部署到GitHub Pages。

#### 启用GitHub Pages
1. 进入项目仓库 Settings
2. 滚动到 "Pages" 部分
3. Source 选择 "GitHub Actions"
4. 推送代码到master分支即可自动部署

访问地址: `https://rampagepeter.github.io/nvcclub/`

### 4. 腾讯云服务器

#### Ubuntu/Debian 系统一键部署
```bash
wget https://raw.githubusercontent.com/rampagepeter/nvcclub/master/tencent-deploy.sh
bash tencent-deploy.sh
```

#### CentOS/RHEL 系统一键部署
```bash
wget https://raw.githubusercontent.com/rampagepeter/nvcclub/master/tencent-deploy-centos.sh
bash tencent-deploy-centos.sh
```

详细说明请参考 [腾讯云部署指南](./TENCENT_CLOUD_DEPLOYMENT.md)

## 🔧 本地开发部署

### 快速开始
```bash
# 1. 克隆项目
git clone https://github.com/rampagepeter/nvcclub.git
cd nvcclub

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 在浏览器中打开 http://localhost:5173
```

### 生产环境构建
```bash
# 生产环境构建
npm run build:prod

# 预览生产版本
npm run preview:prod

# 构建分析
npm run build:analyze
```

## ⚙️ 环境变量配置

### 创建环境变量文件
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

### 环境变量说明
```env
# 应用配置
VITE_APP_TITLE=NVC成长乐园
VITE_APP_DESCRIPTION=NVC中文网年度会员计划

# API配置
VITE_API_BASE_URL=https://api.nvcclub.com
VITE_UPLOAD_URL=https://api.nvcclub.com/upload

# 功能开关
VITE_ENABLE_REGISTRATION=true
VITE_ENABLE_MOCK_API=false

# 第三方服务
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ANALYTICS_ID=your_analytics_id
```

## 🔐 安全配置

### HTTPS配置
所有生产环境部署都应启用HTTPS：

- **Vercel**: 自动配置HTTPS
- **Netlify**: 自动配置HTTPS
- **腾讯云**: 脚本支持Let's Encrypt自动申请SSL证书
- **GitHub Pages**: 自动配置HTTPS

### 安全头部
项目已配置必要的安全头部：
- Content Security Policy (CSP)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

## 📊 性能优化

### 构建优化
- ✅ 代码分割和懒加载
- ✅ Tree Shaking去除死代码
- ✅ 资源压缩和缓存
- ✅ 图片优化和懒加载

### CDN配置
推荐使用CDN加速静态资源：
- Vercel: 内置CDN
- Netlify: 内置CDN  
- 腾讯云: 可配置腾讯云CDN

## 🐛 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清除依赖并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本
node --version  # 应为20.x或更高
```

#### 2. 路由404错误
确保部署平台配置了SPA路由重写规则：
- Vercel: 已在 `vercel.json` 中配置
- Netlify: 已在 `netlify.toml` 中配置
- 其他平台: 需手动配置重写规则

#### 3. 环境变量不生效
- 确保环境变量以 `VITE_` 开头
- 重新构建项目
- 检查部署平台的环境变量设置

## 📈 监控和维护

### 性能监控
- 使用浏览器开发者工具监控性能
- 定期运行Lighthouse性能测试
- 监控构建大小变化

### 错误监控
- 配置Sentry等错误监控服务
- 查看浏览器控制台错误
- 监控API响应状态

### 更新维护
```bash
# 拉取最新代码
git pull origin master

# 更新依赖
npm update

# 重新构建和部署
npm run build:prod
```

## 🔄 CI/CD工作流

项目包含GitHub Actions工作流，支持：
- ✅ 自动构建和测试
- ✅ 多平台部署
- ✅ 依赖缓存优化
- ✅ 构建产物分析

工作流文件位置: `.github/workflows/deploy.yml`

## 📞 技术支持

如果在部署过程中遇到问题：

1. 查看相关文档：
   - [腾讯云部署指南](./TENCENT_CLOUD_DEPLOYMENT.md)
   - [快速部署指南](./QUICK_TENCENT_DEPLOY.md)
   - [构建分析报告](./BUILD_ANALYSIS.md)

2. 检查系统要求和环境配置

3. 在GitHub提交Issue: https://github.com/rampagepeter/nvcclub/issues

---

**部署成功后，您的NVC成长乐园就可以为用户提供服务了！** 🎉

记得定期更新代码和监控系统状态！ 