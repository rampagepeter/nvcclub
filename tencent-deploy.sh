#!/bin/bash

# NVC成长乐园 - 腾讯云服务器一键部署脚本
# 作者: NVC中文网团队
# 用法: bash tencent-deploy.sh

set -e

echo "🌟 欢迎使用NVC成长乐园腾讯云部署脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}错误: 请不要使用root用户运行此脚本！${NC}"
   echo "创建一个普通用户并授予sudo权限："
   echo "  sudo adduser nvc"
   echo "  sudo usermod -aG sudo nvc"
   echo "  su - nvc"
   exit 1
fi

# 获取用户输入
echo -e "${YELLOW}⚠️  系统更新提醒:${NC}"
echo "系统更新可能会影响服务器上运行的其他应用"
read -p "🔄 是否更新系统？(y/N，默认不更新): " UPDATE_SYSTEM
UPDATE_SYSTEM=${UPDATE_SYSTEM:-n}

read -p "🌐 请输入您的域名 (例如: nvcclub.com，留空则使用IP访问): " DOMAIN
read -p "📁 项目安装目录 [/var/www/nvcclub]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-/var/www/nvcclub}

echo -e "${BLUE}开始部署，配置信息：${NC}"
echo "  更新系统: ${UPDATE_SYSTEM}"
echo "  域名: ${DOMAIN:-"IP访问"}"
echo "  安装目录: $INSTALL_DIR"
echo

# 1. 可选系统更新
if [ "$UPDATE_SYSTEM" = "y" ] || [ "$UPDATE_SYSTEM" = "Y" ]; then
    echo -e "${YELLOW}📦 正在更新系统...${NC}"
    sudo apt update && sudo apt upgrade -y
else
    echo -e "${BLUE}📦 跳过系统更新（保护其他应用）${NC}"
    echo -e "${BLUE}仅更新软件包列表...${NC}"
    sudo apt update
fi

# 2. 安装Node.js
echo -e "${YELLOW}🔧 正在安装Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js 已安装，版本: $(node --version)"
fi

# 3. 安装Nginx
echo -e "${YELLOW}🌐 正在安装Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo "Nginx 已安装"
fi

# 4. 安装Git（如果未安装）
echo -e "${YELLOW}📥 检查Git安装...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt install git -y
fi

# 5. 创建项目目录
echo -e "${YELLOW}📁 创建项目目录...${NC}"
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR

# 6. 克隆项目
echo -e "${YELLOW}📥 克隆项目代码...${NC}"
cd $INSTALL_DIR
if [ -d ".git" ]; then
    echo "项目已存在，正在更新..."
    git pull origin master
else
    git clone https://github.com/rampagepeter/nvcclub.git .
fi

# 7. 安装依赖并构建
echo -e "${YELLOW}🔨 安装依赖并构建项目...${NC}"
npm install
npm run build:prod

# 8. 配置Nginx
echo -e "${YELLOW}⚙️ 配置Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/nvcclub"

sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN:-_} ${DOMAIN:+www.$DOMAIN};
    root $INSTALL_DIR/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # 安全头部
        add_header X-Frame-Options "DENY";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
    }

    # 错误页面
    error_page 404 /index.html;
    
    # 安全：隐藏Nginx版本
    server_tokens off;
}
EOF

# 启用站点配置
sudo ln -sf /etc/nginx/sites-available/nvcclub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 9. 配置防火墙
echo -e "${YELLOW}🔒 配置防火墙...${NC}"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable

# 10. 创建部署脚本
echo -e "${YELLOW}📜 创建更新脚本...${NC}"
cat > $INSTALL_DIR/update.sh << 'EOF'
#!/bin/bash
echo "🔄 正在更新NVC成长乐园..."
cd $(dirname "$0")
git pull origin master
npm ci
npm run build:prod
sudo systemctl reload nginx
echo "✅ 更新完成！"
EOF

chmod +x $INSTALL_DIR/update.sh

# 11. 设置SSL证书（如果有域名）
if [ ! -z "$DOMAIN" ]; then
    echo -e "${YELLOW}🔐 是否配置SSL证书？ (y/n)${NC}"
    read -p "输入 y 安装免费SSL证书，n 跳过: " SSL_CHOICE
    
    if [ "$SSL_CHOICE" = "y" ] || [ "$SSL_CHOICE" = "Y" ]; then
        echo -e "${YELLOW}📜 安装Certbot...${NC}"
        sudo apt install certbot python3-certbot-nginx -y
        
        echo -e "${YELLOW}🔐 获取SSL证书...${NC}"
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    fi
fi

# 12. 显示部署结果
echo
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "=================================================="
echo -e "${BLUE}访问信息:${NC}"

if [ ! -z "$DOMAIN" ]; then
    echo "  🌐 网站地址: http://$DOMAIN"
    if [ "$SSL_CHOICE" = "y" ] || [ "$SSL_CHOICE" = "Y" ]; then
        echo "  🔒 HTTPS地址: https://$DOMAIN"
    fi
else
    SERVER_IP=$(curl -s ifconfig.me)
    echo "  🌐 网站地址: http://$SERVER_IP"
fi

echo
echo -e "${BLUE}管理命令:${NC}"
echo "  📦 更新项目: $INSTALL_DIR/update.sh"
echo "  🔄 重启Nginx: sudo systemctl restart nginx"
echo "  📊 查看日志: sudo tail -f /var/log/nginx/access.log"
echo "  🐛 错误日志: sudo tail -f /var/log/nginx/error.log"

echo
echo -e "${BLUE}项目信息:${NC}"
echo "  📁 项目目录: $INSTALL_DIR"
echo "  ⚙️ Nginx配置: /etc/nginx/sites-available/nvcclub"
echo "  🌟 GitHub: https://github.com/rampagepeter/nvcclub"

echo
echo -e "${GREEN}🎯 接下来的步骤:${NC}"
echo "1. 在腾讯云控制台设置安全组规则（开放80、443端口）"
echo "2. 如果使用域名，请将域名解析到服务器IP: $SERVER_IP"
echo "3. 访问网站测试功能"
echo "4. 定期运行更新脚本保持最新版本"
if [ "$UPDATE_SYSTEM" != "y" ] && [ "$UPDATE_SYSTEM" != "Y" ]; then
    echo "5. ⚠️  系统未更新，建议在维护窗口期手动更新: sudo apt update && sudo apt upgrade"
fi

echo
echo -e "${YELLOW}💡 提示: 如果遇到问题，请查看详细部署文档:${NC}"
echo "   cat $INSTALL_DIR/TENCENT_CLOUD_DEPLOYMENT.md"

echo
echo -e "${GREEN}感谢使用NVC成长乐园！🌱${NC}" 