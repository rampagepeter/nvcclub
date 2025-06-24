# 🌱 NVC成长乐园

**NVC中文网年度会员计划** - 一个为NVC学习者提供持续成长、练习和社群互动的游戏化Web应用

[![Build Status](https://github.com/your-username/nvcclub/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/your-username/nvcclub/actions)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 项目概述

NVC成长乐园是一个专为[非暴力沟通(NVC)](https://zh.wikipedia.org/wiki/%E9%9D%9E%E6%9A%B4%E5%8A%9B%E6%B2%9F%E9%80%9A)学习者设计的互动平台，通过游戏化的学习体验、社群互动和个人成长追踪，帮助用户深化NVC技能，建立更和谐的人际关系。

### ✨ 核心功能

- 🏠 **同理心驿站** - 每日NVC练习和场景模拟
- 💬 **主题沙龙** - 月度深度主题讨论
- 🎤 **刘轶说生命成长** - 季度生命成长分享
- 🏆 **多维度徽章系统** - 技能、参与、贡献、趣味四大类徽章
- 📱 **社群信息流** - 微博式学习分享和互动
- 👨‍💼 **管理员后台** - 完整的用户和内容管理系统
- 🌳 **成长可视化** - 生命之树和探险地图

## 🛠️ 技术栈

### 前端技术
- **框架**: Vue 3.5 + TypeScript 5.8
- **构建工具**: Vite 6.3
- **状态管理**: Pinia 3.0
- **路由**: Vue Router 4.5
- **UI组件**: Element Plus 2.10
- **图表**: Chart.js + Vue-ChartJS
- **工具库**: VueUse, Axios, XLSX

### 开发工具
- **代码检查**: ESLint + Prettier
- **类型检查**: TypeScript
- **包管理**: npm
- **版本控制**: Git
- **CI/CD**: GitHub Actions

### 部署和运维
- **部署平台**: Vercel / Netlify / GitHub Pages
- **性能监控**: 内置性能监控系统
- **错误处理**: 全局错误捕获和恢复
- **缓存策略**: HTTP缓存 + 静态资源优化

## 🚀 快速开始

### 环境要求
- Node.js 20.x 或更高版本
- npm 9.x 或更高版本

### 安装依赖
```bash
git clone https://github.com/your-username/nvcclub.git
cd nvcclub
npm install
```

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:5173 启动
```

### 生产构建
```bash
# 构建生产版本
npm run build:prod

# 预览生产构建
npm run preview:prod

# 构建分析
npm run build:analyze
```

### 代码质量检查
```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 格式化
npm run format
```

## 📁 项目结构

```
nvcclub/
├── src/
│   ├── components/          # 通用组件
│   │   ├── admin/          # 管理员组件
│   │   └── common/         # 公共组件
│   ├── views/              # 页面组件
│   │   ├── admin/          # 管理员页面
│   │   ├── auth/           # 认证页面
│   │   └── user/           # 用户页面
│   ├── stores/             # Pinia状态管理
│   ├── services/           # API服务层
│   ├── composables/        # 组合式函数
│   ├── types/              # TypeScript类型定义
│   └── router/             # 路由配置
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── .github/                # GitHub配置
│   └── workflows/          # CI/CD工作流
├── docs/                   # 项目文档
│   ├── DEPLOYMENT.md       # 部署指南
│   ├── BUILD_ANALYSIS.md   # 构建分析
│   └── TODO.md             # 开发计划
└── README.md               # 项目说明
```

## 🌐 部署

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/nvcclub)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/nvcclub)

### 自定义部署
详细的部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 📊 性能指标

| 指标 | 目标值 | 当前状态 |
|------|--------|----------|
| FCP | < 1.5s | ✅ ~1.2s |
| LCP | < 2.5s | ✅ ~2.1s |
| FID | < 100ms | ✅ < 100ms |
| CLS | < 0.1 | ✅ < 0.1 |

构建大小: ~575KB (gzip压缩)

## 🎨 设计理念

### NVC核心价值
- **观察而非评判** - 界面设计注重事实呈现
- **表达感受** - 温暖的色彩和友好的交互
- **识别需要** - 直观的导航和功能组织
- **提出请求** - 清晰的行动指引

### 视觉设计
- **主色调**: 绿色系 (#2e7d32, #4caf50) - 代表成长和生命力
- **辅助色**: 橙色 (#ff9800) - 代表温暖和活力
- **设计语言**: 圆润、温和、包容
- **响应式**: 移动优先，全设备适配

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发贡献
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 问题反馈
- 使用 [Issues](https://github.com/your-username/nvcclub/issues) 报告bug
- 提出功能建议
- 改进文档

## 📖 相关文档

- [开发计划](TODO.md) - 详细的功能规划和进度
- [部署指南](DEPLOYMENT.md) - 完整的部署说明
- [构建分析](BUILD_ANALYSIS.md) - 性能优化报告
- [响应式设计](RESPONSIVE_DESIGN_GUIDE.md) - 设计规范

## 📞 联系我们

- **项目维护者**: [Your Name](mailto:your.email@example.com)
- **官方网站**: [NVC中文网](https://nvcchina.org)
- **学习资源**: [NVC学习资料](https://nvcchina.org/resources)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Marshall Rosenberg](https://en.wikipedia.org/wiki/Marshall_Rosenberg) - NVC创始人
- [NVC中文网](https://nvcnet.cn) - 项目支持
- [Vue.js](https://vuejs.org/) - 卓越的前端框架
- [Element Plus](https://element-plus.org/) - 优秀的UI组件库

---

**Built with ❤️ for the NVC community**

*让我们一起用非暴力沟通创造更美好的世界* 🌍✨ 