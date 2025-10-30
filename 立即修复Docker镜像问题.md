# 立即修复 Docker 镜像问题

## 在服务器上执行

### 1. 配置镜像加速

```bash
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF
```

### 2. 重启 Docker

```bash
systemctl daemon-reload
systemctl restart docker
```

### 3. 验证配置

```bash
docker info | grep -A 10 "Registry Mirrors"
```

### 4. 重新构建

```bash
cd /opt/vocal
docker compose down
docker compose up -d --build
```

## 如果还是失败

使用本地编译的方式（不用 Docker）：

### 直接在服务器编译

```bash
cd /opt/vocal

# 安装 JDK 21
apt update
apt install -y openjdk-21-jdk

# 编译后端
cd backend
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar &

# 编译前端
cd ../frontend
npm install
npm run build

# 用 Nginx 服务前端
apt install -y nginx
cp -r dist/* /var/www/html/
```

## 最简单方法

配置镜像加速后重试一次，应该就可以成功了！

