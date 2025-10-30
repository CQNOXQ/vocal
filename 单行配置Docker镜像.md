# 单行配置 Docker 镜像加速

## 在服务器上执行（单行命令）

```bash
echo '{"registry-mirrors":["https://registry.cn-hangzhou.aliyuncs.com","https://hub-mirror.c.163.com","https://mirror.ccs.tencentyun.com"]}' > /etc/docker/daemon.json

# 重启 Docker
systemctl daemon-reload
systemctl restart docker

# 验证配置
cat /etc/docker/daemon.json
docker info | grep -A 10 "Registry Mirrors"

# 重新构建
docker compose up -d --build
```

## 如果阿里云镜像不可用，使用网易镜像

```bash
echo '{"registry-mirrors":["https://hub-mirror.c.163.com","https://mirror.ccs.tencentyun.com","https://reg-mirror.qiniu.com"]}' > /etc/docker/daemon.json

systemctl daemon-reload
systemctl restart docker
```
