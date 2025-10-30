# Docker 重启失败修复

## 查看错误详情

```bash
systemctl status docker.service
```

或者查看日志：

```bash
journalctl -xeu docker.service
```

## 常见原因和修复

### 1. daemon.json 配置语法错误

```bash
# 检查配置文件
cat /etc/docker/daemon.json

# 如果有语法错误，重新写入
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com",
    "https://reg-mirror.qiniu.com"
  ]
}
EOF
```

### 2. 停止所有容器

```bash
# 停止所有容器
docker stop $(docker ps -a -q) 2>/dev/null || true

# 删除所有容器
docker rm $(docker ps -a -q) 2>/dev/null || true

# 重启 Docker
systemctl restart docker
```

### 3. 重置 Docker 配置

```bash
# 备份配置
cp /etc/docker/daemon.json /etc/docker/daemon.json.bak

# 删除配置
rm /etc/docker/daemon.json

# 重启 Docker（使用默认配置）
systemctl restart docker

# 如果成功，重新添加配置
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com",
    "https://reg-mirror.qiniu.com"
  ]
}
EOF

systemctl restart docker
```

## 验证

```bash
# 检查 Docker 状态
systemctl status docker

# 检查镜像源
docker info | grep "Registry Mirrors"
```

## 然后继续部署

```bash
cd /opt/vocal
docker compose up -d --build
```
