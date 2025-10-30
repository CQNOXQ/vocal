# 阿里云快速部署 - 5分钟上手

## 🎯 目标

在阿里云服务器上快速部署 StudyTracker。

## 📝 前置条件

- 已购买阿里云服务器（Ubuntu 22.04）
- 已有服务器公网 IP
- 已配置 SSH 登录

## 🚀 快速部署（5步）

### 第 1 步：连接服务器

```bash
ssh root@你的公网IP
```

### 第 2 步：一键安装脚本

复制并运行以下脚本：

```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | sh

# 安装 Git
apt update && apt install -y git

# 克隆项目
cd /opt
git clone https://github.com/CQNOXQ/vocal.git
cd vocal/studytracker
```

### 第 3 步：配置环境变量

```bash
# 复制配置文件
cp env.example .env

# 生成随机密码和密钥
echo "DB_PASS=$(openssl rand -base64 16)" > .env
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "CORS_ALLOWED_ORIGINS=http://$(curl -s ifconfig.me):80" >> .env
echo "VITE_API_BASE=http://$(curl -s ifconfig.me):8080" >> .env

# 查看配置
cat .env
```

### 第 4 步：启动服务

```bash
# 构建并启动
docker compose up -d --build

# 等待几分钟，然后查看状态
docker compose ps
```

### 第 5 步：访问应用

在浏览器打开：
```
http://你的公网IP
```

## ✅ 验证部署

```bash
# 查看所有服务日志
docker compose logs -f

# 如果看到 "Started BackendApplication" 说明成功
```

## 🔧 首次使用

1. 访问 http://你的公网IP
2. 使用测试账号登录（或注册新账号）
3. 在"设置"生成邀请码
4. 开始使用！

## 🆘 遇到问题？

### 检查防火墙

```bash
# 临时关闭（仅测试）
ufw disable

# 正确做法：开放端口
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

### 检查容器状态

```bash
docker compose ps
docker compose logs
```

### 查看详细教程

查看 [ALIYUN_DEPLOY.md](./ALIYUN_DEPLOY.md) 获取完整指南。

## 📚 更多资源

- [完整部署指南](./ALIYUN_DEPLOY.md)
- [项目文档](./DEPLOYMENT.md)
- [快速开始](./QUICK_START.md)

---

**提示**：生产环境请修改默认密码并配置 HTTPS！

