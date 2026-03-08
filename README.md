# 极执网 - 部署说明文档

## 项目概述

极执网是一个智能化法律与财务分析工具网站，提供流水智能分析和法律文书生成功能。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Element Plus UI框架
- Vue Router 路由管理
- Axios HTTP客户端
- Vite 构建工具

### 后端
- Node.js + Express
- MySQL 数据库
- Sequelize ORM
- Multer 文件上传
- XLSX Excel解析
- PDF/Word文档处理

## 系统要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 8.0.0

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd jizhi
```

### 2. 数据库配置

#### 2.1 创建数据库

```bash
mysql -u root -p < init_database.sql
```

或手动执行SQL脚本：

```bash
mysql -u root -p
```

```sql
source d:\jizhi\init_database.sql
```

#### 2.2 配置数据库连接

编辑 `api/.env` 文件：

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jizhi_db
DB_USER=root
DB_PASSWORD=your_password
```

### 3. 安装依赖

#### 3.1 安装后端依赖

```bash
cd api
npm install
```

#### 3.2 安装前端依赖

```bash
cd web
npm install
```

### 4. 创建必要目录

```bash
mkdir api\uploads
mkdir api\generated-docs
```

## 运行项目

### 方式一：分别启动（开发环境）

#### 启动后端服务

```bash
cd api
npm start
```

后端服务将在 http://localhost:3001 启动

#### 启动前端服务

```bash
cd web
npm run dev
```

前端服务将在 http://localhost:3002 启动

### 方式二：使用nodemon（开发环境）

#### 启动后端服务（自动重启）

```bash
cd api
npm run dev
```

#### 启动前端服务

```bash
cd web
npm run dev
```

## 生产环境部署

### 1. 构建前端

```bash
cd web
npm run build
```

构建产物将生成在 `web/dist` 目录

### 2. 配置Nginx

创建Nginx配置文件 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/jizhi/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 使用PM2管理后端进程

```bash
cd api
npm install -g pm2
pm2 start src/app.js --name jizhi-api
pm2 save
pm2 startup
```

### 4. 启动Nginx

```bash
nginx -t
nginx
```

## 功能说明

### 1. 流水智能分析

- 支持上传 .xlsx, .xls, .pdf, .doc, .docx, .txt 格式文件
- 文件大小限制：50MB
- 自动分析流水数据，生成多维度报告
- 支持多用户流水分别分析

### 2. 法律文书生成

- 支持生成4种标准法律文书
- 可上传裁判文书自动提取信息
- 支持手动填写案件信息
- 生成Word格式文档

### 3. 历史记录

- 查看所有分析记录
- 按类型筛选记录
- 下载历史报告和文书

## API接口文档

### 流水文件管理

- `POST /api/flow-files/upload` - 上传流水文件
- `GET /api/flow-files` - 获取流水文件列表
- `DELETE /api/flow-files/:id` - 删除流水文件

### 流水分析

- `POST /api/flow-analysis/analyze/:fileId` - 分析流水文件
- `GET /api/flow-analysis/:fileId` - 获取分析结果

### 法律文书

- `POST /api/legal-documents/generate` - 生成法律文书
- `GET /api/legal-documents` - 获取文书列表
- `GET /api/legal-documents/:id` - 获取文书详情
- `GET /api/legal-documents/:id/download` - 下载文书
- `DELETE /api/legal-documents/:id` - 删除文书

## 常见问题

### 1. 数据库连接失败

检查 `api/.env` 文件中的数据库配置是否正确，确保MySQL服务正在运行。

### 2. 文件上传失败

- 检查文件大小是否超过50MB限制
- 检查文件格式是否支持
- 确保上传目录存在且有写入权限

### 3. 端口被占用

修改 `api/.env` 中的 `PORT` 配置，或停止占用端口的进程。

### 4. 前端无法连接后端

检查后端服务是否正常运行，确认API地址配置正确。

## 安全建议

1. 修改默认数据库密码
2. 配置HTTPS
3. 设置文件上传白名单
4. 实现用户认证和授权
5. 定期备份数据库

## 维护

### 数据库备份

```bash
mysqldump -u root -p jizhi_db > backup_$(date +%Y%m%d).sql
```

### 日志查看

后端日志：
```bash
pm2 logs jizhi-api
```

Nginx日志：
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 技术支持

如有问题，请联系技术支持团队。
