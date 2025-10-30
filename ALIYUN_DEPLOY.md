# 阿里云 Docker 部署 StudyTracker - 完整教程

本文档提供从零开始在阿里云上使用 Docker 部署 StudyTracker 的详细步骤。

## 📋 目录

1. [准备工作](#准备工作)
2. [创建阿里云服务器](#创建阿里云服务器)
3. [连接到服务器](#连接到服务器)
4. [安装 Docker 和 Docker Compose](#安装-docker-和-docker-compose)
5. [上传项目文件](#上传项目文件)
6. [配置环境变量](#配置环境变量)
7. [启动服务](#启动服务)
8. [配置域名和 SSL](#配置域名和-ssl)
9. [防火墙和安全设置](#防火墙和安全设置)
10. [验证和测试](#验证和测试)

---

## 准备工作

### 1. 购买阿里云服务器

1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 登录账号（没有账号需要注册）
3. 进入**云服务器 ECS** 产品页面
4. 点击**立即购买**

### 2. 选择配置（推荐）

**新手推荐配置**：
- **实例规格**: ecs.t6-c1m2.small（1 核 2GB）
- **操作系统**: Ubuntu 22.04 64位
- **系统盘**: 40GB SSD云盘
- **网络**: 专有网络 VPC
- **带宽**: 1Mbps（够用）或 3Mbps（更好）
- **时长**: 1个月（可续费）

**购买费用**：约 24元/月起

### 3. 重要：设置安全组

在购买页面：
1. 找到**安全组**选项
2. 点击**创建安全组**
3. 添加以下规则：

| 规则方向 | 授权策略 | 协议类型 | 端口范围 | 授权对象 |
|---------|---------|---------|---------|---------|
| 入方向 | 允许 | TCP | 22 | 0.0.0.0/0 (SSH) |
| 入方向 | 允许 | TCP | 80 | 0.0.0.0/0 (HTTP) |
| 入方向 | 允许 | TCP | 443 | 0.0.0.0/0 (HTTPS) |
| 入方向 | 允许 | TCP | 8080 | 0.0.0.0/0 (后端API，可选) |

保存并继续购买。

---

## 连接到服务器

### Windows 用户

#### 方法 1: 使用 PuTTY（推荐）

1. 下载 PuTTY
   - 访问 https://www.putty.org/
   - 下载并安装

2. 打开 PuTTY
3. 填写连接信息：
   - **Host Name**: 你的公网 IP 地址（阿里云控制台可以查看）
   - **Port**: 22
   - **Connection type**: SSH
4. 点击 **Open**
5. 首次连接会弹出安全警告，点击 **是(Y)**
6. 登录：
   - 用户名：`root`
   - 密码：你的实例密码（购买时设置的）

#### 方法 2: 使用 VS Code Remote SSH

1. 在 VS Code 安装 **Remote - SSH** 插件
2. 按 `Ctrl+Shift+P`，输入 "Remote-SSH: Connect to Host"
3. 添加主机：
   ```
   ssh root@你的公网IP
   ```
4. 连接，输入密码

### macOS/Linux 用户

打开终端，输入：

```bash
ssh root@你的公网IP
```

输入密码后即可连接。

---

## 安装 Docker 和 Docker Compose

### 1. 更新系统

```bash
apt update
apt upgrade -y
```

### 2. 安装 Docker

```bash
# 安装必要的工具
apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新并安装 Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
docker --version
```

如果看到版本号（如 `Docker version 24.x.x`），说明安装成功。

### 3. 配置 Docker 镜像加速（阿里云）

```bash
# 创建配置目录
mkdir -p /etc/docker

# 配置镜像加速器（使用阿里云镜像）
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://your-mirror.mirror.aliyuncs.com"]
}
EOF

# 重启 Docker
systemctl daemon-reload
systemctl restart docker

# 验证
docker info | grep "Registry Mirrors"
```

**注意**：将 `your-mirror` 替换为你在阿里云控制台找到的实际地址：
1. 访问 https://cr.console.aliyun.com/
2. 选择**镜像加速器**
3. 复制加速器地址

### 4. 安装 Docker Compose

```bash
# Docker Compose 2.x 已包含在上面安装的 docker-compose-plugin 中
docker compose version
```

如果看到版本号，说明已安装。

---

## 上传项目文件

### 方法 1: 使用 Git（推荐）

```bash
# 安装 Git
apt install -y git

# 克隆项目
cd /opt
git clone https://github.com/CQNOXQ/vocal.git

cd vocal/studytracker
```

**如果遇到 Git 连接错误**（如 TLS 错误）：
```bash
# 方法 A: 使用 SSH 方式（推荐）
git clone git@github.com:CQNOXQ/vocal.git

# 方法 B: 关闭 SSL 验证（临时）
git -c http.sslVerify=false clone https://github.com/CQNOXQ/vocal.git

# 方法 C: 使用 SCP 直接上传（见方法 2）
```

**如果没有 Git 仓库**：
- 可以先在本地创建一个 Git 仓库
- 或者使用方法 2（直接上传）

### 方法 2: 使用 SCP 上传

在**本地电脑**上（Windows）：

```powershell
# 进入项目目录
cd C:\Users\CQ\Desktop\voc

# 使用 SCP 上传（需要先安装 Git for Windows 或者使用 WinSCP）
scp -r studytracker root@你的公网IP:/opt/vocal/
```

在**本地电脑**上（macOS/Linux）：

```bash
cd ~/Desktop/voc
scp -r studytracker root@你的公网IP:/opt/vocal/
```

### 方法 3: 使用 WinSCP（Windows 图形界面）

1. 下载安装 WinSCP: https://winscp.net/
2. 连接到服务器（用户名：root，密码：你的密码）
3. 在服务器创建目录：`mkdir -p /opt/vocal`
4. 拖拽上传 `studytracker` 文件夹到 `/opt/vocal/` 目录

---

## 配置环境变量

### 1. 进入项目目录

```bash
cd /opt/vocal/studytracker
ls -la
```

应该能看到：
- `docker-compose.yml`
- `env.example`
- `backend/`
- `frontend/`
- 等文件

### 2. 复制环境变量文件

```bash
cp env.example .env
```

### 3. 编辑环境变量

```bash
nano .env
```

**重要配置**：

```bash
# 数据库密码（设置一个强密码，至少16字符）
DB_PASS=YourStrongPassword123!@#

# MySQL Root 密码
MYSQL_ROOT_PASSWORD=YourRootPassword123!@#

# JWT 密钥（必须至少32字符，建议使用随机字符串）
JWT_SECRET=MySuperSecretJWTKeyAtLeast32CharactersLong123456789

# CORS 允许的源（你的域名）
CORS_ALLOWED_ORIGINS=http://你的公网IP:80

# 前端 API 地址（使用公网IP）
VITE_API_BASE=http://你的公网IP:8080
```

**生成强密码的方法**：

```bash
# 在服务器上生成随机密码
openssl rand -base64 32
```

**编辑完成后**：
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

### 4. 验证配置

```bash
cat .env
```

确保没有遗留的示例值（如 `changeme`、`your_password_here`）。

---

## 启动服务

### 1. 构建并启动所有服务

```bash
cd /opt/vocal/studytracker
docker compose up -d --build
```

**说明**：
- `up`：启动服务
- `-d`：后台运行（detached）
- `--build`：重新构建镜像

**首次启动需要时间**（5-10分钟），因为要：
- 下载基础镜像
- 构建应用
- 下载依赖
- 运行数据库迁移

### 2. 查看启动状态

```bash
# 查看所有容器状态
docker compose ps

# 查看日志
docker compose logs -f
```

按 `Ctrl+C` 退出日志查看。

### 3. 检查各个服务

```bash
# 检查 MySQL
docker compose logs mysql

# 检查后端
docker compose logs backend

# 检查前端
docker compose logs frontend
```

**如果看到错误**，常见解决方案：

**问题 1**: 端口被占用
```bash
# 检查端口占用
netstat -tulpn | grep -E '80|8080|3306'

# 如果有冲突，可以修改 docker-compose.yml 的端口映射
nano docker-compose.yml
```

**问题 2**: 数据库连接失败
```bash
# 检查 MySQL 是否正常启动
docker compose logs mysql | grep -i error

# 重启 MySQL
docker compose restart mysql
```

**问题 3**: 构建失败
```bash
# 清理并重新构建
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 配置域名和 SSL

### 1. 获取域名（可选）

如果不使用域名，可以跳过这一步，直接用 IP 访问。

**购买域名**：
1. 在阿里云搜索**域名**
2. 选择并购买一个 `.com` 或 `.cn` 域名
3. 等待审核（一般几分钟）

**域名解析**：
1. 进入**域名控制台**
2. 找到你的域名，点击**解析**
3. 添加解析记录：
   - **记录类型**: A
   - **主机记录**: @（或 www）
   - **记录值**: 你的公网 IP
   - **TTL**: 10 分钟
4. 保存

等待 DNS 生效（约10分钟）。

### 2. 配置 HTTP（临时）

先用 IP 访问，验证服务正常：

```bash
# 在浏览器访问
http://你的公网IP
```

如果看到登录页面，说明前端部署成功！

### 3. 配置 HTTPS（生产环境必需）

使用 Certbot 自动获取 SSL 证书：

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 如果有域名，获取证书（替换为你的域名和邮箱）
certbot certonly --standalone -d yourdomain.com -m your@email.com

# 证书会保存在：
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

然后在 `docker-compose.yml` 中添加 HTTPS 配置（如果需要）。

**注意**：如果没有域名，可以暂时使用 HTTP。生产环境强烈建议使用 HTTPS。

---

## 防火墙和安全设置

### 1. 配置防火墙

```bash
# 安装 UFW
apt install -y ufw

# 允许 SSH（重要！）
ufw allow 22/tcp

# 允许 HTTP
ufw allow 80/tcp

# 允许 HTTPS
ufw allow 443/tcp

# 启动防火墙
ufw --force enable

# 查看状态
ufw status
```

### 2. 配置 SSH 安全

```bash
# 禁用 root 密码登录，改用密钥（推荐）
# 1. 在本地生成密钥对
ssh-keygen -t rsa -b 4096

# 2. 复制公钥到服务器
ssh-copy-id root@你的公网IP

# 3. 编辑 SSH 配置
nano /etc/ssh/sshd_config

# 找到并修改：
# PermitRootLogin yes 改为 PermitRootLogin no
# PasswordAuthentication yes 改为 PasswordAuthentication no

# 4. 重启 SSH
systemctl restart sshd
```

**⚠️ 警告**：在禁用密码登录前，确保密钥登录已经成功！

### 3. 定期更新系统

```bash
# 设置自动更新
apt install -y unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

---

## 验证和测试

### 1. 访问应用

在浏览器打开：
- **前端**: http://你的公网IP
- **API**: http://你的公网IP:8080

### 2. 测试功能

1. **注册账号**
   - 先登录到设置页面生成邀请码
   - 使用邀请码注册新账号

2. **创建科目**
   - 添加学习科目
   - 设置目标

3. **记录学习**
   - 使用计时器或手动输入
   - 查看统计

4. **单词学习**
   - 选择单词类型科目
   - 记录背词数量

### 3. 查看日志

```bash
# 实时查看所有日志
docker compose logs -f

# 查看后端日志
docker compose logs -f backend | grep ERROR

# 查看数据库连接
docker compose logs mysql | grep -i connection
```

---

## 日常维护

### 备份数据库

创建一个备份脚本：

```bash
nano /opt/vocal/studytracker/backup.sh
```

内容：

```bash
#!/bin/bash
BACKUP_DIR="/opt/vocal/studytracker/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
docker compose exec -T mysql mysqldump -u studytracker_user -p$DB_PASS studytracker > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

设置可执行：

```bash
chmod +x /opt/vocal/studytracker/backup.sh
```

添加到定时任务：

```bash
crontab -e
```

添加：

```bash
# 每天凌晨2点备份
0 2 * * * /opt/vocal/studytracker/backup.sh
```

### 更新应用

```bash
cd /opt/vocal/studytracker

# 拉取最新代码
git pull

# 重新构建并启动
docker compose down
docker compose up -d --build
```

### 监控服务

```bash
# 查看容器状态
docker compose ps

# 查看资源使用
docker stats

# 查看磁盘使用
df -h
```

---

## 故障排除

### 问题 1: 无法访问网站

**检查步骤**：
```bash
# 1. 检查容器是否运行
docker compose ps

# 2. 检查防火墙
ufw status

# 3. 检查阿里云安全组（网页控制台）

# 4. 查看日志
docker compose logs frontend
```

### 问题 2: 数据库连接失败

```bash
# 检查 MySQL 日志
docker compose logs mysql | grep ERROR

# 检查数据库是否可连接
docker compose exec mysql mysql -u studytracker_user -p$DB_PASS -e "SHOW DATABASES;"

# 重启服务
docker compose restart backend
```

### 问题 3: 内存不足

```bash
# 查看内存使用
free -h

# 如果内存不足，可以：
# 1. 增加服务器配置
# 2. 优化 Docker 资源限制
# 3. 清理未使用的镜像
docker system prune -a
```

### 问题 4: 端口冲突

```bash
# 查看端口占用
netstat -tulpn | grep LISTEN

# 修改 docker-compose.yml 中的端口映射
nano docker-compose.yml
```

---

## 常见命令速查

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 查看日志
docker compose logs -f

# 进入容器
docker compose exec backend sh

# 重新构建
docker compose build --no-cache

# 清理未使用的资源
docker system prune -a
```

---

## 下一步建议

1. **配置 SSL 证书**（使用域名）
2. **设置域名**（替代 IP 访问）
3. **配置监控告警**（如阿里云监控）
4. **定期备份数据库**
5. **查看性能报告**（优化配置）
6. **添加 CDN**（加速静态资源）

---

## 帮助和支持

- 查看项目文档：`README.md`、`DEPLOYMENT.md`
- 查看容器日志：`docker compose logs`
- 阿里云工单支持：[工单系统](https://workorder.console.aliyun.com/)

---

**恭喜！** 🎉 你的 StudyTracker 应用已经成功部署到阿里云！

现在可以：
- 邀请朋友使用
- 开始记录学习进度
- 享受你的学习管理工具

