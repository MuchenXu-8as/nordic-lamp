# Render.com 部署指南 - 方案一

本指南将指导您如何将 Nordic Lamp 网站部署到 Render.com，实现全球访问。

---

## 前置条件

1. **GitHub 账号** - 需要将代码推送到 GitHub
2. **Render 账号** - 在 https://render.com 免费注册
3. **已安装 Git** - 用于推送代码

---

## 步骤 1：安装 Git（如未安装）

### Windows
1. 访问 https://git-scm.com/download/win 下载安装
2. 安装时使用默认选项即可

### 验证安装
```bash
git --version
```

---

## 步骤 2：初始化 Git 仓库并推送到 GitHub

```bash
# 在项目根目录执行
cd "d:\Trae CN\export website"

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: Nordic Lamp website"

# 重命名主分支为 main
git branch -M main

# 添加远程仓库（请替换为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/nordic-lamp.git

# 推送到 GitHub
git push -u origin main
```

### 在 GitHub 创建仓库
1. 访问 https://github.com/new
2. Repository name: `nordic-lamp`
3. 选择 "Private" 或 "Public"
4. **不要** 勾选 "Initialize this repository"
5. 点击 "Create repository"

---

## 步骤 3：在 Render 创建服务

### 3.1 登录 Render
1. 访问 https://render.com
2. 使用 GitHub 账号登录

### 3.2 自动部署（推荐）
项目已包含 `render.yaml` 配置文件，支持一键部署：

1. 在 Render 控制台点击 **"New +"** → **"YAML"**
2. 选择您的 GitHub 仓库
3. 点击 **"Connect"** 开始部署

Render 会自动：
- 创建 PostgreSQL 数据库
- 配置后端服务
- 设置环境变量

### 3.3 手动部署

#### 3.3.1 创建 PostgreSQL 数据库
1. 点击 **"New +"** → **"Database"**
2. 选择 **"PostgreSQL"**
3. 配置：
   - **Name**: `nordic-lamp-db`
   - **Database**: `nordic_lamp`
   - **User**: `nordic_user`
   - **Region**: 选择靠近您的区域
   - **Instance**: Free
4. 创建后复制连接信息

#### 3.3.2 创建后端服务
1. 点击 **"New +"** → **"Web Service"**
2. 选择您的 GitHub 仓库
3. 配置服务：
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance**: Free 或 Starter ($7/月)
4. 点击 **"Create Web Service"**

#### 3.3.3 配置环境变量
在服务的 **"Environment"** 选项卡添加：

```
NODE_ENV=production
DB_TYPE=postgres
DB_HOST=<从 PostgreSQL 服务获取的 Internal URL>
DB_PORT=5432
DB_NAME=nordic_lamp
DB_USER=<从 PostgreSQL 服务获取的用户名>
DB_PASSWORD=<从 PostgreSQL 服务获取的密码>
JWT_SECRET=cc7564061a05b777505ff94fb4e7f23b03d2ff2734c86cd49da78143f4a9371f
```

---

## 步骤 4：等待部署完成

1. Render 会自动部署
2. 部署完成后，您将获得一个 HTTPS 域名：
   - 格式：`https://nordic-lamp.onrender.com`
3. 访问该域名测试网站

---

## 步骤 5：验证部署

### 测试 API
```bash
# 健康检查
curl https://your-service.onrender.com/api/health

# 获取产品列表
curl https://your-service.onrender.com/api/products
```

### 测试登录
1. 访问 `https://your-service.onrender.com/admin/`
2. 默认账号：`admin`
3. 默认密码：`admin123`
4. **登录后请立即修改密码！**

---

## 步骤 6：绑定自定义域名（可选）

1. 在 Render 服务设置 → **"Custom Domain"**
2. 添加您的域名，如 `your-domain.com`
3. 在域名注册商配置 DNS 记录：
   | 主机记录 | 记录类型 | 记录值 |
   |---------|---------|--------|
   | @ | CNAME | your-service.onrender.com |
   | www | CNAME | your-service.onrender.com |
4. 等待 DNS 生效（通常 24-48 小时）
5. Render 自动配置 HTTPS

---

## 常见问题

### Q: 部署失败显示 "build failed"
**A**: 检查服务器日志，确保 `package.json` 中的依赖都正确安装。

### Q: 数据库连接失败
**A**: 检查环境变量是否正确配置，特别是 DB_HOST 应使用 PostgreSQL 服务的 Internal URL。

### Q: 页面显示空白
**A**: 检查前端文件是否正确部署，Root Directory 设置是否正确。

### Q: 图片上传失败
**A**: Render 免费层文件系统有限制，建议生产环境使用云存储（如 AWS S3）。

---

## 生产环境安全检查清单

- [x] 修改默认管理员密码
- [x] 设置安全的 JWT_SECRET（已预生成）
- [x] 配置 PostgreSQL 强密码
- [x] 启用 HTTPS（Render 自动配置）
- [ ] 定期备份数据库
- [ ] 监控服务状态

---

## 下一步

- 查看 [DEPLOYMENT.md](file:///d:/Trae%20CN/export%20website/DEPLOYMENT.md) 了解更多部署方案
- 配置自定义域名
- 设置数据库自动备份

---

**文档版本**: 2026-06-29
**适用版本**: Nordic Lamp v1.0.0
