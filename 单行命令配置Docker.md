# 单行命令配置 Docker 镜像

## 在服务器上依次执行

### 1. 创建配置文件

```bash
echo '{"registry-mirrors":["https://docker.m.daocloud.io","https://hub-mirror.c.163.com"]}' > /etc/docker/daemon.json
```

### 2. 查看配置

```bash
cat /etc/docker/daemon.json
```

### 3. 重启 Docker

```bash
systemctl daemon-reload
systemctl restart docker
```

### 4. 验证

```bash
docker info | grep "Registry Mirrors"
```

### 5. 重新构建

```bash
cd /opt/vocal
docker compose up -d --build
```

## 备用方案：手动拉取镜像

如果还是失败，先手动拉取：

```bash
docker pull openjdk:21-jre-slim
docker pull openjdk:21-jdk
docker pull mysql:8.0
docker pull nginx:alpine
docker pull node:18-alpine

# 然后构建
cd /opt/vocal
docker compose up -d --build
```

