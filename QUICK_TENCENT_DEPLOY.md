# 🚀 腾讯云服务器快速部署指南

## 📋 准备工作

### 1. 腾讯云服务器要求
- **配置推荐**: 2核4GB内存（最低1核2GB）
- **系统**: Ubuntu 20.04 LTS 或 22.04 LTS
- **带宽**: 1Mbps以上
- **存储**: 20GB以上

### 2. 购买服务器
1. 登录 [腾讯云控制台](https://cloud.tencent.com/)
2. 选择"云服务器CVM" -> "新建实例"
3. 推荐配置：
   - 地域：选择离用户最近的地区
   - 镜像：Ubuntu Server 20.04 LTS 64位
   - 实例类型：标准型S5.MEDIUM2 (1核2GB) 或更高
   - 公网IP：勾选"免费分配独立公网IP"
   - 安全组：选择"放通全部端口"或自定义开放22,80,443端口

## 🌟 一键部署

### 步骤1：连接服务器
```bash
# 使用SSH连接（替换为您的服务器IP）
ssh ubuntu@YOUR_SERVER_IP

# 或者使用root用户
ssh root@YOUR_SERVER_IP
```

### 步骤2：创建用户（推荐，如果使用root请跳过）
```bash
# 如果是root用户，建议创建普通用户
sudo adduser nvc
sudo usermod -aG sudo nvc
su - nvc
```

### 步骤3：下载并运行部署脚本
```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/rampagepeter/nvcclub/master/tencent-deploy.sh

# 或者使用curl
curl -O https://raw.githubusercontent.com/rampagepeter/nvcclub/master/tencent-deploy.sh

# 运行部署脚本
bash tencent-deploy.sh
```

### 步骤4：填写配置信息
脚本会询问：
1. **域名**: 如果有域名就填写（如：nvcclub.com），没有就回车跳过
2. **安装目录**: 默认 `/var/www/nvcclub`，直接回车使用默认值

### 步骤5：等待自动安装
脚本会自动完成：
- ✅ 系统更新
- ✅ 安装Node.js 20
- ✅ 安装Nginx
- ✅ 克隆项目代码
- ✅ 安装依赖并构建
- ✅ 配置Nginx
- ✅ 设置防火墙
- ✅ 创建更新脚本
- ✅ 可选配置SSL证书

## 🔧 腾讯云控制台设置

### 安全组配置
1. 进入腾讯云控制台 -> 云服务器 -> 安全组
2. 创建或编辑安全组规则：

| 方向 | 类型   | 端口范围 | 源IP       | 备注     |
|------|--------|----------|------------|----------|
| 入站 | TCP    | 22       | 0.0.0.0/0  | SSH      |
| 入站 | TCP    | 80       | 0.0.0.0/0  | HTTP     |
| 入站 | TCP    | 443      | 0.0.0.0/0  | HTTPS    |

### 域名解析（如果有域名）
1. 在您的域名提供商处添加DNS记录：
   ```
   类型: A
   主机记录: @
   记录值: 您的服务器IP
   TTL: 600
   
   类型: A
   主机记录: www
   记录值: 您的服务器IP
   TTL: 600
   ```

## 🎯 部署完成

部署成功后，您会看到类似输出：
```
🎉 部署完成！
==================================================
访问信息:
  🌐 网站地址: http://您的IP或域名
  🔒 HTTPS地址: https://您的域名 (如果配置了SSL)

管理命令:
  📦 更新项目: /var/www/nvcclub/update.sh
  🔄 重启Nginx: sudo systemctl restart nginx
  📊 查看日志: sudo tail -f /var/log/nginx/access.log
```

## 🔄 日常维护

### 更新项目
```bash
# 运行更新脚本
/var/www/nvcclub/update.sh
```

### 查看状态
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 重启服务
```bash
# 重启Nginx
sudo systemctl restart nginx

# 重新加载Nginx配置
sudo systemctl reload nginx
```

## 🐛 常见问题

### 1. 无法访问网站
- 检查安全组是否开放80、443端口
- 检查服务器防火墙：`sudo ufw status`
- 检查Nginx状态：`sudo systemctl status nginx`

### 2. 域名无法访问
- 检查域名DNS解析是否生效：`nslookup 您的域名`
- 等待DNS传播完成（通常5-30分钟）

### 3. SSL证书问题
```bash
# 重新申请SSL证书
sudo certbot --nginx -d 您的域名 -d www.您的域名
```

### 4. 构建失败
```bash
# 手动重新构建
cd /var/www/nvcclub
npm install
npm run build:prod
sudo systemctl reload nginx
```

## 💡 性能优化建议

### 1. 启用腾讯云CDN
- 在腾讯云控制台配置CDN加速
- 绑定您的域名
- 配置静态资源缓存策略

### 2. 服务器优化
```bash
# 启用Nginx状态监控
sudo apt install nginx-extras -y

# 优化系统参数
echo 'net.core.somaxconn = 65535' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 3. 定期备份
```bash
# 创建备份脚本
cat > /home/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/nvcclub_backup_$DATE.tar.gz -C /var/www nvcclub
# 保留最近7个备份
find /home -name "nvcclub_backup_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/backup.sh

# 添加到定时任务（每天凌晨3点备份）
echo "0 3 * * * /home/backup.sh" | crontab -
```

## 📞 技术支持

如需帮助，请：
1. 查看详细部署文档：`cat /var/www/nvcclub/TENCENT_CLOUD_DEPLOYMENT.md`
2. 检查系统日志：`sudo journalctl -xe`
3. 联系腾讯云技术支持
4. 在GitHub提交issue：https://github.com/rampagepeter/nvcclub/issues

---

**祝您部署成功！NVC成长乐园欢迎您！** 🌱✨ 