# 如果 git pull 卡住了

## 快速处理

### 1. 按 Ctrl+C 中断

如果 git pull 没反应，先按 `Ctrl+C` 中断。

### 2. 配置 Git

```bash
# 关闭 SSL 验证
git config --global http.sslVerify false

# 增加超时时间
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 300

# 再次尝试
git pull
```

### 3. 如果还是不行，直接下载并覆盖

```bash
# 备份当前代码
cd /opt
mv vocal vocal.backup

# 重新克隆
git -c http.sslVerify=false clone https://github.com/CQNOXQ/vocal.git

# 复制环境变量
cd vocal
cp ../vocal.backup/.env .env 2>/dev/null || true

# 启动
docker compose up -d --build
```

### 4. 或者用 SCP 上传（最可靠）

**在你的本地电脑**（Windows PowerShell）：

```powershell
cd C:\Users\CQ\Desktop\voc
scp -r studytracker root@你的公网IP:/opt/vocal/
```

**在服务器上**：

```bash
cd /opt/vocal
# 确认文件已上传
ls -la
```

## 推荐方案

如果 Git 连接有问题，直接用 SCP 上传，最快最可靠。

## 上传后继续部署

```bash
cd /opt/vocal

# 配置环境变量（如果还没有）
cp env.example .env
echo "DB_PASS=$(openssl rand -base64 16)" > .env
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
PUBLIC_IP=$(curl -s ifconfig.me)
echo "CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP:80" >> .env
echo "VITE_API_BASE=http://$PUBLIC_IP:8080" >> .env

# 启动
docker compose up -d --build
```

