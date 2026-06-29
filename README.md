# Nordic Lamp — 北欧灯具外贸网站

北欧简约风格的专业外贸灯具网站，支持英文/俄语双语，中文管理后台。

---

## 功能特性

### 前台（英文/俄语）
- 🏠 首页：品牌展示、精选产品、公司介绍、联系方式
- 🛍️ 产品列表：分类筛选、产品卡片展示
- 📄 产品详情：产品图片、规格参数、询盘表单
- 🏢 关于我们：公司介绍、品牌故事
- 📧 联系我们：联系方式、询盘入口
- 🌐 语言切换：EN/RU 双语支持

### 后台（中文）
- 📊 仪表盘：数据统计、最近询盘
- 🛠️ 产品管理：新增/编辑/删除/排序、多图上传
- 📁 分类管理：产品分类 CRUD
- ✉️ 询盘管理：客户询盘列表、状态跟进
- ⚙️ 站点设置：品牌/Logo/首页/关于/联系信息
- 🔐 账号设置：修改密码、更换账号

### 技术特性
- ✅ Node.js + Express 后端
- ✅ SQLite / PostgreSQL 双数据库支持
- ✅ JWT 安全认证
- ✅ 文件上传（支持多图）
- ✅ 响应式设计（移动端自适应）
- ✅ RESTful API 接口

---

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件
# 生产环境请修改 JWT_SECRET
```

### 3. 启动服务

```bash
# 开发模式
cd server
npm run dev

# 或使用 start.bat (Windows)
# 双击 start.bat
```

### 4. 访问网站

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login.html
- 默认账号：`admin`
- 默认密码：`admin123`

⚠️ **首次登录后请立即修改密码！**

---

## 项目结构

```
nordic-lamp/
├── index.html              # 前台首页
├── products.html           # 产品列表
├── product.html            # 产品详情
├── about.html              # 关于我们
├── contact.html            # 联系我们
├── admin/                  # 后台管理
│   ├── login.html          # 登录页
│   ├── index.html          # 仪表盘
│   ├── products.html       # 产品管理
│   ├── categories.html     # 分类管理
│   ├── inquiries.html      # 询盘管理
│   ├── settings.html       # 站点设置
│   └── account.html        # 账号设置
├── assets/                 # 静态资源
│   ├── css/                # 样式文件
│   ├── js/                 # JavaScript
│   └── img/                # 图片资源
└── server/                 # 后端服务
    ├── server.js           # 后端入口
    ├── db.js               # 数据库入口
    ├── db-pg.js            # PostgreSQL 驱动
    ├── schema.js           # 数据库表结构
    ├── seed.js             # 初始数据
    ├── migrate.js          # 数据迁移
    ├── .env                # 环境变量
    ├── package.json        # 依赖配置
    └── uploads/            # 上传文件
```

---

## API 接口

### 认证相关
- `POST /api/auth/login` — 用户登录
- `GET /api/auth/me` — 获取当前用户信息
- `POST /api/auth/change-password` — 修改密码

### 产品管理
- `GET /api/products` — 获取产品列表
- `GET /api/products/:id` — 获取产品详情
- `POST /api/products` — 创建产品（需认证）
- `PUT /api/products/:id` — 更新产品（需认证）
- `DELETE /api/products/:id` — 删除产品（需认证）

### 分类管理
- `GET /api/categories` — 获取分类列表
- `POST /api/categories` — 创建分类（需认证）
- `PUT /api/categories/:id` — 更新分类（需认证）
- `DELETE /api/categories/:id` — 删除分类（需认证）

### 询盘管理
- `GET /api/inquiries` — 获取询盘列表（需认证）
- `POST /api/inquiries` — 提交询盘（公开）
- `PUT /api/inquiries/:id` — 更新询盘状态（需认证）
- `DELETE /api/inquiries/:id` — 删除询盘（需认证）

### 站点设置
- `GET /api/site/settings` — 获取站点设置
- `PUT /api/site/settings` — 更新站点设置（需认证）

### 文件上传
- `POST /api/upload` — 上传文件（需认证）

---

## 数据库支持

### SQLite（默认）
- 适合开发和小型部署
- 无需额外配置
- 数据文件：`server/data/nordic-lamp.db`

### PostgreSQL（生产推荐）
- 适合高并发场景
- 支持更多用户和数据量
- 配置方法见 `DEPLOYMENT.md`

### 切换数据库
编辑 `server/.env`：
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nordic_lamp
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## 部署指南

详细部署说明请查看：
👉 [DEPLOYMENT.md](DEPLOYMENT.md)

支持部署平台：
- **Render.com**（最推荐，零配置）
- **Railway.app**（开发者友好）
- **VPS + Nginx**（完全控制）

---

## 常见问题

### Q: 忘记后台密码怎么办？
A: 可以删除 `server/data/nordic-lamp.db` 数据库文件并重启服务，系统会重新创建默认账号（admin/admin123）。

### Q: 如何修改默认端口？
A: 编辑 `server/.env` 中的 `PORT` 变量。

### Q: 如何禁用调试模式？
A: 修改 `server/.env` 中的 `NODE_ENV=production`。

### Q: 图片上传到哪里了？
A: 所有上传文件保存在 `server/uploads/` 目录。

---

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **数据库**: SQLite, PostgreSQL
- **认证**: JWT (JSON Web Token)
- **上传**: Multer

---

## 许可

© 2026 Nordic Lamp AB. All rights reserved.

---

## 联系方式

如有问题，请联系开发团队。
