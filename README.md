# 🌱 NVC成长乐园 (NVC Growth Paradise)

> 一个为NVC中文网年度会员设计的专属游戏化成长平台

[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-orange.svg)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.10-blue.svg)](https://element-plus.org/)
[![GitHub](https://img.shields.io/badge/GitHub-rampagepeter/nvcclub-black.svg)](https://github.com/rampagepeter/nvcclub)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 📋 项目概述

NVC成长乐园是专为[NVC中文网](https://nvcnet.cn)年度会员打造的数字化成长平台，融合了非暴力沟通(NVC)理念与现代游戏化设计，为用户提供系统性的同理心练习、社群互动和个人成长追踪体验。

### 🌟 项目愿景

通过技术赋能，让每一位NVC学习者都能在温暖的数字社区中持续成长，培养深度的同理心连接能力，共同创造一个更加理解与包容的世界。

## ✨ 核心功能

### 🏠 同理心驿站
- **场景化练习**: 真实生活场景的NVC四步练习
- **角色扮演**: 多角度体验不同立场的感受和需要
- **智能反馈**: 个性化的练习建议和成长指导
- **进度追踪**: 详细的练习记录和能力提升轨迹

### 💬 主题沙龙
- **每月深度**: 围绕特定主题的深入探讨
- **专家引导**: NVC认证培训师的专业分享
- **互动交流**: 小组讨论和经验分享
- **资源整理**: 相关资料和延伸阅读推荐

### 🎤 刘轶说生命成长
- **季度分享**: 创始人刘轶的深度生命洞察
- **成长故事**: 真实的转化经历和感悟分享
- **答疑互动**: 现场问答和个人指导
- **录像回放**: 错过直播也能随时学习

### 🏆 多维度徽章系统
- **技能徽章**: 聆听之耳、感受色彩家、同理心大师等
- **参与徽章**: 驿站常客、沙龙探索家、社群活跃者等
- **贡献徽章**: 笔记分享家、同理心伙伴、智慧导师等
- **趣味徽章**: '啊哈！'时刻捕获者、百日筑基、夜猫子学习者等

### 📱 社群信息流
- **动态分享**: 文字、图片的学习心得分享
- **标签系统**: 便于分类和搜索的话题标签
- **活动关联**: @活动功能，连接具体的学习活动
- **互动功能**: 点赞、评论、转发、收藏的完整社交体验

### 🌳 成长可视化
- **成长之树**: SVG动态树状图展示个人成长轨迹
- **数据统计**: 详细的学习数据和参与分析
- **里程碑**: 重要成长节点的标记和庆祝

## 🛠️ 技术架构

### 前端技术栈
```
Vue 3.5          - 现代前端框架，组合式API
TypeScript 5.8   - 静态类型检查，代码更可靠
Vite 6.3         - 快速的构建工具和开发服务器
Element Plus 2.10- 企业级UI组件库
Pinia 3.0        - 新一代状态管理
Vue Router 4.5   - 单页面应用路由
ESLint + Prettier- 代码质量和风格统一
```

### 开发特色
- **📱 响应式设计**: 移动端优先，多设备完美适配
- **🎨 NVC主题**: 温暖的绿色系配色，自然元素设计
- **⚡ 性能优化**: 懒加载、代码分割、资源压缩
- **🔒 类型安全**: 完整TypeScript覆盖，减少运行时错误
- **🧩 组件化**: 高度复用的模块化组件设计

## 🚀 快速开始

### 环境要求
- Node.js 20.x 或更高版本
- npm 9.x 或更高版本
- Git

### 本地开发

#### 1. 克隆项目
```bash
git clone https://github.com/rampagepeter/nvcclub.git
cd nvcclub
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 启动开发服务器
```bash
npm run dev
```

#### 4. 访问应用
打开浏览器访问 `http://localhost:5173`

### 生产环境构建
```bash
# 生产环境构建
npm run build:prod

# 预览生产版本
npm run preview:prod

# 构建分析
npm run build:analyze
```

## 🌐 部署方式

### 1. Vercel (推荐)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rampagepeter/nvcclub)

### 2. Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rampagepeter/nvcclub)

### 3. 腾讯云服务器

#### Ubuntu/Debian 系统
```bash
wget https://raw.githubusercontent.com/rampagepeter/nvcclub/master/tencent-deploy.sh
bash tencent-deploy.sh
```

#### CentOS/RHEL 系统
```bash
wget https://raw.githubusercontent.com/rampagepeter/nvcclub/master/tencent-deploy-centos.sh
bash tencent-deploy-centos.sh
```

### 4. GitHub Pages
项目已配置GitHub Actions自动部署到GitHub Pages。

## 📁 项目结构

```
nvcclub/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── admin/          # 管理员组件
│   │   ├── common/         # 通用组件
│   │   └── user/           # 用户组件
│   ├── views/              # 页面组件
│   │   ├── admin/          # 管理员页面
│   │   ├── auth/           # 认证页面
│   │   └── user/           # 用户页面
│   ├── stores/             # Pinia状态管理
│   ├── api/                # API服务层
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   └── assets/             # 静态资源
├── public/                 # 公共静态文件
├── docs/                   # 项目文档
│   ├── DEPLOYMENT.md       # 部署指南
│   ├── TENCENT_CLOUD_DEPLOYMENT.md  # 腾讯云部署
│   └── BUILD_ANALYSIS.md   # 构建分析
└── scripts/               # 构建和部署脚本
```

## 🎯 功能亮点

### 用户端功能
- **🔐 用户认证**: 安全的登录注册系统
- **🏠 个人主页**: 成长数据和推荐活动
- **🎯 同理心练习**: 场景化的NVC练习
- **💬 主题沙龙**: 月度深度主题讨论
- **🎤 生命成长**: 季度创始人分享
- **🏆 徽章系统**: 多维度成就激励
- **📱 社群互动**: 动态分享和交流
- **👤 个人中心**: 资料管理和设置
- **🌳 成长可视化**: 个人成长轨迹展示

### 管理员功能
- **📊 数据仪表板**: 全面的运营数据展示
- **👥 用户管理**: 用户信息和权限管理
- **📝 内容管理**: 活动发布和参与者管理
- **🛡️ 内容审核**: 动态内容的审核和管理
- **🏆 徽章管理**: 徽章系统的配置和奖励
- **🏷️ 标签管理**: 话题标签的维护和优化
- **⚙️ 系统设置**: 平台配置和功能开关

## 🔧 开发指南

### 代码规范
项目采用严格的代码规范，确保代码质量：

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 类型检查
npm run type-check
```

### 提交规范
使用语义化提交信息：
- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建或工具变动

### 开发流程
1. 从`master`分支创建功能分支
2. 开发功能并提交代码
3. 创建Pull Request
4. 代码审查通过后合并

## 📄 文档资源

- **[部署指南](./DEPLOYMENT.md)** - 详细的部署说明
- **[腾讯云部署](./TENCENT_CLOUD_DEPLOYMENT.md)** - 腾讯云服务器部署
- **[快速部署](./QUICK_TENCENT_DEPLOY.md)** - 一键部署指南
- **[构建分析](./BUILD_ANALYSIS.md)** - 性能和优化分析
- **[响应式设计](./RESPONSIVE_DESIGN_GUIDE.md)** - 响应式设计指南
- **[开发记录](./TODO.md)** - 完整的开发进度记录

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 问题反馈
如果发现问题或有改进建议，请[创建Issue](https://github.com/rampagepeter/nvcclub/issues)。

## 📞 联系方式

- **NVC中文网**: [https://nvcnet.cn](https://nvcnet.cn)
- **GitHub**: [https://github.com/rampagepeter/nvcclub](https://github.com/rampagepeter/nvcclub)
- **项目维护**: NVC中文网技术团队

## 📝 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

## 🎉 致谢

感谢所有为NVC理念传播和项目开发贡献力量的朋友们！

特别感谢：
- **马歇尔·卢森堡博士** - 非暴力沟通创始人
- **刘轶老师** - NVC中文网创始人
- **NVC中文网社群** - 活跃的学习伙伴们
- **开源社区** - 优秀的技术生态

---

**让我们一起在数字世界中播撒同理心的种子，培育理解与连接的美好！** 🌱💚 