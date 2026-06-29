# Nordic Lamp 部署指南

本文档提供将北欧灯具外贸网站部署到全球可访问环境的完整指南。

---

## 目录

1. [Netlify 适用性说明](#netlify-适用性说明)
2. [方案对比](#方案对比)
3. [方案一：Render.com（最推荐）](#方案一rendercom最推荐)
4. [方案二：Railway.app](#方案二railwayapp)
5. [方案三：VPS + Nginx + PostgreSQL](#方案三vps--nginx--postgresql)
6. [环境变量配置](#环境变量配置)
7. [SQLite 迁移到 PostgreSQL](#sqlite-迁移到-postgresql)
8. [域名配置](#域名配置)
9. [常见问题排查](#常见问题排查)

---

## Netlify 适用性说明

### ❌ Netlify 无法直接部署本项目

本项目是一个 **完整的 Node.js + Express 动态后端**，具备以下特性：
- 持久化数据库存储（产品、分类、询盘、管理员账号）
- JWT 用户认证系统
- 文件上传功能（产品图片）
- 长驻运行的 Node.js 进程

**Netlify 的限制：**
1. 仅支持纯静态网站（HTML/CSS/JS）和 Serverless Functions
2. Serverless Functions 最长执行时间仅 10 秒
3. 没有持久化文件系统（SQLite 不可用）
4. 不支持长驻 Node.js 进程
5. 容器重启后文件上传会丢失

### ✅ 结论
**请勿选择 Netlify 部署本项目**，请参考下方推荐的平台。

---

## 方案对比

| 特性 | Render.com | Railway.app | VPS + Nginx |
|------|-----------|-------------|-------------|
| **部署复杂度** | ⭐ 低 | ⭐ 低 | ⭐⭐⭐ 高 |
| **费用** | 免费层可用 | 免费层有限 | $5+/月 |
| **Node.js 支持** | ✅ 原生 | ✅ 原生 | ✅ 完全控制 |
| **PostgreSQL** | ✅ 一键集成 | ✅ 一键集成 | ✅ 自行安装 |
| **全球 CDN** | ✅ 自动 | ✅ 自动 | ❌ 需配置 |
| **HTTPS** | ✅ 自动 | ✅ 自动 | ❌ 需配置 |
| **自定义域名** | ✅ 免费 | ✅ 免费 | 需 DNS 配置 |
| **适合场景** | 个人/小型项目 | 个人/小型项目 | 生产级网站 |

---

## 方案一：Render.com（最推荐）

**优势：零配置部署，原生支持 Node.js + PostgreSQL**

### 步骤 1：准备 GitHub 仓库

1. 将整个项目推送到 GitHub
2. 确保目录结构如下：
   ```
   your-repo/
   ├── index.html          # 前台首页
   ├── products.html      # 产品列表
   ├── product.html        # 产品详情
   ├── about.html
   ├── contact.html
   ├── admin/              # 后台管理
   ├── assets/
   └── server/
       ├── server.js       # 后端入口
       ├── package.json
       └── ...
   ```

### 步骤 2：在 Render 创建后端服务

1. 访问 [render.com](https://render.com) 并注册账号
2. 点击 "New +" → "Web Service"
3. 选择您的 GitHub 仓库
4. **配置服务：**
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance**: Free 或 Starter ($7/月)
5. 点击 "Create Web Service"

### 步骤 3：创建 PostgreSQL 数据库

1. 在 Render 控制台点击 "New +" → "Database"
2. 选择 "PostgreSQL"
3. **配置：**
   - **Name**: `nordic-lamp-db`
   - **Database**: `nordic_lamp`
   - **User**: Render 自动创建
   - **Instance**: Free（限制 1GB 存储）
4. 创建后，Render 会自动提供连接字符串

### 步骤 4：配置环境变量

在后端服务的 "Environment" 选项卡中添加：

```
DB_TYPE=postgres
DB_HOST=<从 PostgreSQL 服务获取的 Internal URL>
DB_PORT=5432
DB_NAME=nordic_lamp
DB_USER=<从 PostgreSQL 服务获取的用户名>
DB_PASSWORD=<从 PostgreSQL 服务获取的密码>
JWT_SECRET=<生成 32+ 位随机字符串>
```

**生成 JWT_SECRET：**
```bash
# 在本地终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 5：部署

1. Render 会自动部署并提供 HTTPS 域名
2. 格式：`https://nordic-lamp.onrender.com`

### 步骤 6：配置前台静态文件

**方案 A：将前端合并到后端服务**
- 修改 `server.js` 中的 `ROOT_DIR` 指向项目根目录
- 让 Express 同时托管前台和后端

**方案 B：创建独立的静态站点**
1. 在 Render 点击 "New +" → "Static Site"
2. 选择同一仓库
3. **Root Directory**: 项目根目录
4. **Publish Directory**: `.`

---

## 方案二：Railway.app

**与 Render 类似，开发者友好**

### 步骤 1：注册并创建项目

1. 访问 [railway.app](https://railway.app) 注册
2. 创建 "New Project"

### 步骤 2：添加服务

1. **Backend 服务：**
   - "Add Service" → "New from GitHub repo"
   - 选择仓库，Root Directory 设为 `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`

2. **PostgreSQL 数据库：**
   - "Add Service" → "Database" → "Add PostgreSQL"
   - Railway 会自动创建并提供连接变量

### 步骤 3：配置环境变量

在后端服务的 "Variables" 选项卡添加：

```
DB_TYPE=postgres
DB_HOST=${{PostgreSQL.PUBLIC_HOSTNAME}}
DB_PORT=${{PostgreSQL.PORT}}
DB_NAME=railway
DB_USER=${{PostgreSQL.USER}}
DB_PASSWORD=${{PostgreSQL.PASSWORD}}
JWT_SECRET=<随机字符串>
```

### 步骤 4：部署

1. Railway 自动部署并提供域名
2. 格式：`https://nordic-lamp.up.railway.app`

---

## 方案三：VPS + Nginx + PostgreSQL

**适合生产环境，完全控制**

### 步骤 1：购买 VPS

推荐提供商：
- **DigitalOcean**: https://www.digitalocean.com（起步 $6/月）
- **Vultr**: https://www.vultr.com（起步 $3.5/月）
- **阿里云国际版**: https://www.alibabacloud.com

**系统选择：** Ubuntu 22.04 LTS

### 步骤 2：服务器初始化

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装必要软件
apt install -y nginx postgresql postgresql-contrib

# 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 步骤 3：配置 PostgreSQL

```bash
# 进入 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE nordic_lamp;
CREATE USER nordic_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE nordic_lamp TO nordic_user;
\c nordic_lamp
GRANT ALL ON SCHEMA public TO nordic_user;
\q
```

### 步骤 4：部署应用

```bash
# 创建应用目录
mkdir -p /var/www/nordic-lamp
cd /var/www/nordic-lamp

# 上传项目文件（使用 scp 或 git clone）
# scp -r ./ your-user@server-ip:/var/www/nordic-lamp/

# 安装依赖
cd server
npm install

# 创建环境变量文件
cat > .env << 'EOF'
PORT=3000
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nordic_lamp
DB_USER=nordic_user
DB_PASSWORD=your-strong-password
JWT_SECRET=your-random-32-char-secret
EOF
```

### 步骤 5：使用 PM2 守护进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd /var/www/nordic-lamp/server
pm2 start server.js --name nordic-lamp

# 设置开机自启
pm2 startup systemd
pm2 save

# 查看状态
pm2 status
pm2 logs nordic-lamp
```

### 步骤 6：配置 Nginx 反向代理

```bash
# 创建配置文件
cat > /etc/nginx/sites-available/nordic-lamp << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    client_max_body_size 20M;

    # 前台静态文件
    location / {
        root /var/www/nordic-lamp;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后台管理
    location /admin {
        alias /var/www/nordic-lamp/admin;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 反向代理
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

    # 上传文件
    location /uploads/ {
        proxy_pass http://localhost:3000;
        alias /var/www/nordic-lamp/server/uploads/;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/nordic-lamp /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 步骤 7：配置 HTTPS（免费）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请 SSL 证书
certbot --nginx -d your-domain.com

# 自动续期测试
certbot renew --dry-run
```

---

## 环境变量配置

### 完整变量列表

在 `server/.env` 文件或 Render/Railway/VPS 的环境变量中配置：

```env
# ===== 服务配置 =====
PORT=3000

# ===== 数据库选择 =====
# 开发: sqlite
# 生产: postgres
DB_TYPE=postgres

# ===== PostgreSQL 连接 =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nordic_lamp
DB_USER=nordic_user
DB_PASSWORD=your-password

# ===== JWT 安全 =====
# ⚠️ 生产环境必须修改！使用随机 32+ 位字符串
# 生成: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-here

# ===== 上传配置 =====
# 上传目录路径
UPLOAD_DIR=./uploads
```

### JWT_SECRET 安全提示

1. **不要使用默认值**：`nordic-lamp-dev-secret-change-me`
2. **长度要求**：至少 32 个字符
3. **存储位置**：环境变量，不要提交到 Git
4. **泄露处理**：立刻重新生成并重启服务

---

## SQLite 迁移到 PostgreSQL

### 迁移时机
- 生产部署前：建议直接使用 PostgreSQL
- 已有 SQLite 数据：使用迁移脚本

### 迁移步骤

```bash
# 1. 确保 PostgreSQL 已安装并配置
# 2. 在 .env 中设置 DB_TYPE=postgres 及连接信息

# 3. 运行迁移脚本
cd server
node migrate.js

# 4. 重启服务
# Render/Railway: 自动重启
# VPS: pm2 restart nordic-lamp
```

### 迁移脚本功能
- 读取 SQLite 数据库所有数据
- 清空 PostgreSQL 现有数据
- 按表顺序导入（外键安全）
- 数据完整性校验

---

## 域名配置

### 步骤 1：购买域名

推荐注册商：
- **Cloudflare**: https://www.cloudflare.com（隐私保护免费）
- **Namecheap**: https://www.namecheap.com
- **阿里云**: https://wanwang.aliyun.com

### 步骤 2：配置 DNS 记录

在域名注册商添加以下记录：

**A 记录（VPS）：**
| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | A | 你的服务器 IP | 600 |
| www | CNAME | your-domain.com | 600 |

**CNAME 记录（Render/Railway）：**
| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | ALIAS/ANAME | your-project.onrender.com | 自动 |
| www | CNAME | your-project.onrender.com | 自动 |

### 步骤 3：绑定域名

**Render：**
1. 进入服务设置 → "Custom Domain"
2. 添加 `your-domain.com` 和 `www.your-domain.com`
3. Render 会自动配置 HTTPS

**Railway：**
1. 进入服务设置 → "Custom Domains"
2. 添加域名
3. 按照提示配置 DNS

**VPS：**
1. Nginx 配置已包含 `server_name`
2. Certbot 自动配置 HTTPS
3. 等待 DNS 生效（通常 24-48 小时）

---

## 常见问题排查

### 问题 1：登录失败 "Invalid credentials"

**原因：** 数据库中没有 admin 用户

**解决：**
```bash
# 首次启动会自动创建
# 默认账号：admin
# 默认密码：admin123
# 登录后请立即修改！
```

### 问题 2：数据库连接失败

**原因：** PostgreSQL 服务未启动或配置错误

**排查：**
```bash
# 检查 PostgreSQL 状态
# VPS: systemctl status postgresql
# Render/Railway: 查看服务日志

# 测试连接
psql -h localhost -U nordic_user -d nordic_lamp
```

### 问题 3：上传图片失败

**原因：** 上传目录权限或配置问题

**解决：**
```bash
# VPS: 设置目录权限
chmod 755 /var/www/nordic-lamp/server/uploads
chown -R www-data:www-data /var/www/nordic-lamp/server/uploads

# Render/Railway: 使用云存储（S3 等）
```

### 问题 4：API 返回 500 错误

**排查：**
```bash
# 查看后端日志
# VPS: pm2 logs nordic-lamp
# Render/Railway: Logs 选项卡
```

### 问题 5：静态资源 404

**原因：** Nginx 配置或目录结构问题

**解决：**
```bash
# VPS: 检查配置
nginx -t

# 检查目录
ls -la /var/www/nordic-lamp/
ls -la /var/www/nordic-lamp/server/
```

### 问题 6：HTTPS 重定向循环

**原因：** Nginx 未正确配置 SSL

**解决：**
```bash
# VPS: 使用 Certbot 自动配置
certbot --nginx -d your-domain.com

# 手动测试
curl -I https://your-domain.com
```

---

## 安全清单

部署前请完成以下检查：

- [ ] 修改默认管理员密码（admin123）
- [ ] 设置安全的 JWT_SECRET（32+ 位随机字符串）
- [ ] 配置 PostgreSQL 强密码
- [ ] 启用 HTTPS
- [ ] 配置防火墙（仅开放 80/443）
- [ ] 禁用 PostgreSQL 远程访问（VPS）
- [ ] 定期备份数据库
- [ ] 监控服务器资源使用

---

## 备份与恢复

### VPS 备份

```bash
# 备份 PostgreSQL
pg_dump -U nordic_user nordic_lamp > backup_$(date +%Y%m%d).sql

# 恢复
psql -U nordic_user nordic_lamp < backup_20260629.sql
```

### Render/Railway 备份

- Render: 数据库自动快照（付费层）
- Railway: 手动导出/导入

---

## 性能优化

### VPS

1. **启用 Nginx 缓存：**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

2. **启用 Gzip 压缩：**
```bash
# 编辑 /etc/nginx/nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 256;
```

3. **PM2 集群模式：**
```bash
# 多核服务器
pm2 start server.js -i 4 --name nordic-lamp
```

### Render/Railway

- 自动 CDN 缓存
- 自动负载均衡
- 无需额外配置

---

## 联系支持

部署遇到问题？查看：
- Render 文档：https://render.com/docs
- Railway 文档：https://docs.railway.app
- Nginx 文档：https://nginx.org/docs

---

**文档版本：** 2026-06-29  
**适用版本：** Nordic Lamp v1.0.0  
**维护者：** 开发团队
