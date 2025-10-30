# 阿里云快速修复指南

如果你在 `/opt/vocal` 目录下没有看到 `studytracker` 文件夹，请按以下步骤操作：

## 方案 1: 直接进入正确的目录

```bash
cd /opt
ls -la
# 查看是否有 vocal 目录

cd vocal
ls -la
# 查看 vocal 目录下有什么

# 如果看到 studytracker 目录
cd studytracker

# 如果没看到 studytracker，继续方案 2
```

## 方案 2: 使用 SCP 上传（推荐）

### 在本地电脑运行：

```powershell
cd C:\Users\CQ\Desktop\voc
scp -r studytracker root@你的公网IP:/opt/vocal/
```

### 在服务器上：

```bash
cd /opt/vocal/studytracker
ls -la
# 应该看到 docker-compose.yml 等文件
```

## 方案 3: 使用 WinSCP（图形界面）

1. 打开 WinSCP
2. 连接到服务器（root@你的公网IP）
3. 左侧：进入 `C:\Users\CQ\Desktop\voc\studytracker`
4. 右侧：在 `/opt/vocal/` 下
5. 拖拽上传整个 `studytracker` 文件夹

## 上传成功后继续

```bash
cd /opt/vocal/studytracker
cp env.example .env
nano .env
# 编辑环境变量

# 生成随机密码
echo "DB_PASS=$(openssl rand -base64 16)" > .env
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP:80" >> .env
echo "VITE_API_BASE=http://$PUBLIC_IP:8080" >> .env

cat .env

# 启动服务
docker compose up -d --build
```

## 查看日志

```bash
docker compose logs -f
```

## 访问应用

在浏览器打开：`http://你的公网IP`

