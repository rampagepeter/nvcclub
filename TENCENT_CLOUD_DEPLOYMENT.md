# 🌐 腾讯云服务器部署指南

本指南将帮助您在腾讯云服务器上部署NVC成长乐园项目。

## 📋 前提条件

### 1. 腾讯云资源准备
- ✅ 腾讯云服务器（CVM）- 推荐配置：
  - **CPU**: 2核心或以上
  - **内存**: 4GB或以上
  - **系统**: Ubuntu 20.04 LTS 或 CentOS 8
  - **带宽**: 3Mbps或以上
- ✅ 域名（可选，推荐配置）
- ✅ SSL证书（可选，用于HTTPS）

### 2. 本地工具
- SSH客户端（终端或PuTTY）
- Git
- 代码编辑器

## 🚀 部署步骤

### 步骤1：连接服务器并准备环境

#### 1.1 连接到腾讯云服务器
```bash
# 使用SSH连接服务器（替换为您的服务器IP）
ssh root@YOUR_SERVER_IP

# 或使用密钥文件
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

#### 1.2 更新系统
```bash
# Ubuntu系统
sudo apt update && sudo apt upgrade -y

# CentOS系统
sudo yum update -y
```

#### 1.3 安装Node.js和npm
```bash
# 方法1：使用NodeSource官方源（推荐）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 方法2：使用nvm（节点版本管理器）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 验证安装
node --version  # 应该显示 v20.x.x
npm --version   # 应该显示 9.x.x 或更高
```

#### 1.4 安装Nginx
```bash
# Ubuntu
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

#### 1.5 安装PM2（进程管理器）
```bash
sudo npm install -g pm2
```

### 步骤2：部署项目代码

#### 2.1 创建项目目录
```bash
sudo mkdir -p /var/www/nvcclub
sudo chown $USER:$USER /var/www/nvcclub
cd /var/www/nvcclub
```

#### 2.2 克隆项目代码
```bash
git clone https://github.com/rampagepeter/nvcclub.git .

# 或者如果已经有代码，可以使用scp上传
# scp -r ./nvcclub root@YOUR_SERVER_IP:/var/www/
```

#### 2.3 安装依赖并构建
```bash
npm install
npm run build:prod
```

### 步骤3：配置Nginx

#### 3.1 创建Nginx配置文件
```bash
sudo nano /etc/nginx/sites-available/nvcclub
```

#### 3.2 添加配置内容
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/nvcclub/dist;
    index index.html;

    # 启用gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "DENY";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    # API代理（如果有后端API）
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 错误页面
    error_page 404 /index.html;
}
```

#### 3.3 启用站点配置
```bash
sudo ln -s /etc/nginx/sites-available/nvcclub /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl reload nginx
```

### 步骤4：配置HTTPS（可选但推荐）

#### 4.1 安装Certbot
```bash
# Ubuntu
sudo apt install certbot python3-certbot-nginx -y

# CentOS
sudo yum install certbot python3-certbot-nginx -y
```

#### 4.2 获取SSL证书
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 步骤5：设置防火墙

#### 5.1 配置腾讯云安全组
在腾讯云控制台设置安全组规则：
- **入站规则**:
  - HTTP: 端口80，源：0.0.0.0/0
  - HTTPS: 端口443，源：0.0.0.0/0
  - SSH: 端口22，源：您的IP地址

#### 5.2 配置服务器防火墙
```bash
# Ubuntu (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

## 🔄 自动化部署脚本

### 6.1 创建部署脚本
```bash
nano /var/www/nvcclub/deploy.sh
```

### 6.2 脚本内容
```bash
#!/bin/bash

# NVC成长乐园自动部署脚本
echo "🚀 开始部署 NVC成长乐园..."

# 设置变量
PROJECT_DIR="/var/www/nvcclub"
BACKUP_DIR="/var/www/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份当前版本
if [ -d "$PROJECT_DIR/dist" ]; then
    echo "📦 备份当前版本..."
    tar -czf $BACKUP_DIR/nvcclub_backup_$DATE.tar.gz -C $PROJECT_DIR dist
fi

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin master

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build:prod

# 重启Nginx
echo "🔄 重启Nginx..."
sudo systemctl reload nginx

# 清理旧备份（保留最近7个）
find $BACKUP_DIR -name "nvcclub_backup_*.tar.gz" -mtime +7 -delete

echo "✅ 部署完成！"
echo "🌐 网站地址: http://your-domain.com"
```

### 6.3 设置脚本权限
```bash
chmod +x /var/www/nvcclub/deploy.sh
```

## 📊 监控和维护

### 7.1 设置Nginx日志监控
```bash
# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 7.2 设置系统监控
```bash
# 安装htop
sudo apt install htop -y

# 监控系统资源
htop
```

### 7.3 设置自动更新脚本（可选）
```bash
# 添加到crontab，每天凌晨2点自动拉取更新
echo "0 2 * * * /var/www/nvcclub/deploy.sh >> /var/log/nvcclub-deploy.log 2>&1" | crontab -
```

## 🐛 常见问题解决

### 问题1：权限错误
```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /var/www/nvcclub
sudo chmod -R 755 /var/www/nvcclub
```

### 问题2：Nginx配置错误
```bash
# 检查配置语法
sudo nginx -t

# 查看Nginx状态
sudo systemctl status nginx
```

### 问题3：端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 问题4：域名解析问题
```bash
# 检查DNS解析
nslookup your-domain.com
dig your-domain.com
```

## 📈 性能优化建议

### 8.1 启用Brotli压缩（可选）
```bash
# 安装nginx-module-brotli
sudo apt install nginx-module-brotli -y

# 在nginx.conf中添加
load_module modules/ngx_http_brotli_filter_module.so;
load_module modules/ngx_http_brotli_static_module.so;
```

### 8.2 配置Redis缓存（可选）
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
```

### 8.3 设置CDN加速
- 使用腾讯云CDN加速静态资源
- 配置适当的缓存策略

## 🔒 安全建议

1. **定期更新系统**: `sudo apt update && sudo apt upgrade`
2. **使用强密码**: 设置复杂的root密码
3. **配置SSH密钥**: 禁用密码登录，只允许密钥认证
4. **安装fail2ban**: 防止暴力破解
5. **定期备份**: 设置定期备份策略
6. **监控日志**: 定期检查系统和应用日志

## 📞 支持与帮助

如果在部署过程中遇到问题：

1. 检查系统日志: `sudo journalctl -xe`
2. 检查Nginx日志: `sudo tail -f /var/log/nginx/error.log`
3. 验证防火墙设置
4. 确认域名DNS解析
5. 联系腾讯云技术支持

---

**部署完成后，您的NVC成长乐园就可以通过域名访问了！** 🎉

记得定期备份数据和更新系统！ 