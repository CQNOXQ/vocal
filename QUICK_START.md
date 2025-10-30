# StudyTracker 快速启动指南

## 使用 Docker Compose（推荐）

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存

### 步骤

1. **复制环境变量文件**

   ```bash
   cp env.example .env
   ```

2. **编辑 `.env` 文件**

   修改以下关键配置：
   - `DB_PASS`: 数据库密码
   - `JWT_SECRET`: 强密钥（至少32字符）
   - `CORS_ALLOWED_ORIGINS`: 前端域名
   - `VITE_API_BASE`: 后端 API 地址

3. **启动所有服务**

   ```bash
   docker-compose up -d
   ```

4. **查看服务状态**

   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

5. **访问应用**

   - 前端: http://localhost（已包含 API 代理）
   - 后端 API: http://localhost:8080（直接访问）
   - 数据库: localhost:3306

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 重建服务

```bash
docker-compose down
docker-compose up -d --build
```

## 手动部署（不使用 Docker）

### 后端

1. **安装 Java 21**

   ```bash
   # Ubuntu
   sudo apt install openjdk-21-jdk
   ```

2. **安装 Maven**（如果未安装）

   ```bash
   sudo apt install maven
   ```

3. **编译**

   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

4. **运行**

   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

### 前端

1. **安装 Node.js 18+**

   ```bash
   # 使用 nvm
   nvm install 18
   nvm use 18
   ```

2. **安装依赖**

   ```bash
   cd frontend
   npm install
   ```

3. **构建**

   ```bash
   npm run build
   ```

4. **预览**

   ```bash
   npm run preview
   ```

## 首次配置

1. **访问应用**: http://localhost
2. **注册账号**: 需要使用邀请码
3. **生成邀请码**:
   - 登录后在"设置"页面
   - 点击"生成邀请码"按钮
   - 分享给新用户使用

## 常见问题

### Docker 端口冲突

如果 80、3306、8080 端口被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 将 8080 改为其他端口
```

### 数据库连接失败

1. 检查 MySQL 是否正常启动
2. 验证 `.env` 中的数据库密码
3. 查看后端日志: `docker-compose logs backend`

### 前端无法访问后端

1. 检查 `VITE_API_BASE` 环境变量
2. 重新构建前端: `docker-compose up -d --build frontend`
3. 清除浏览器缓存

## 下一步

- 阅读 [DEPLOYMENT.md](../DEPLOYMENT.md) 了解生产环境部署
- 配置 HTTPS 和安全设置
- 设置数据库备份
- 配置监控和日志

