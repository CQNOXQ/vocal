# 阿里云部署 - 正确步骤

## ✅ 当前状态

你已经成功克隆了仓库到 `/opt/vocal`，现在目录结构是：

```
/opt/vocal/  ← 这就是项目根目录！
├── README.md
├── docker-compose.yml
├── env.example
├── backend/
├── frontend/
└── ...
```

**注意**：没有外层的 `studytracker` 目录，直接在 `vocal` 目录下操作！

## 部署步骤

### 1. 进入项目目录

```bash
cd /opt/vocal
ls -la  # 应该看到 docker-compose.yml
```

### 2. 配置环境变量

```bash
# 生成随机密码
echo "DB_PASS=$(openssl rand -base64 16)" > .env
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP:80" >> .env
echo "VITE_API_BASE=http://$PUBLIC_IP:8080" >> .env

# 查看配置
cat .env
```

### 3. 启动服务

```bash
# 确保在 /opt/vocal 目录
docker compose up -d --build
```

### 4. 查看状态

```bash
docker compose ps
docker compose logs -f
```

### 5. 访问应用

在浏览器打开：`http://你的公网IP`

## 常见问题

### 如果提示找不到 docker-compose

```bash
# 安装 Docker Compose
apt update
apt install -y docker-compose-plugin

# 验证安装
docker compose version
```

### 如果端口被占用

```bash
# 检查端口
netstat -tulpn | grep -E '80|8080|3306'

# 或修改 docker-compose.yml 中的端口
nano docker-compose.yml
```

### 查看日志

```bash
# 所有服务
docker compose logs -f

# 特定服务
docker compose logs mysql
docker compose logs backend
docker compose logs frontend
```

## 管理命令

```bash
# 停止服务
docker compose down

# 重启服务
docker compose restart

# 重新构建
docker compose down
docker compose up -d --build
```

## 下一步

访问应用后：
1. 登录账号
2. 在"设置"生成邀请码
3. 分享给朋友使用

---

**记住**：所有操作都在 `/opt/vocal` 目录下，不需要 `cd studytracker`！

