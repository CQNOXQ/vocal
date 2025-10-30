# 配置阿里云 Docker 镜像加速

## 在服务器上执行

```bash
# 创建配置文件
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF

# 重启 Docker
systemctl daemon-reload
systemctl restart docker

# 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

## 或者使用阿里云专属加速地址

1. 访问：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors
2. 登录后获取你的专属加速地址
3. 替换上面的配置

## 配置完成后

```bash
# 重新构建
cd /opt/vocal
docker compose up -d --build
```

## 如果阿里云加速地址不可用

可以尝试：

```bash
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com",
    "https://reg-mirror.qiniu.com"
  ]
}
EOF

systemctl daemon-reload
systemctl restart docker
```
