# 配置 Docker 镜像加速（阿里云服务器）

## 在服务器上执行

```bash
# 创建或编辑 Docker 配置文件
mkdir -p /etc/docker
nano /etc/docker/daemon.json
```

## 添加内容

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

## 重启 Docker

```bash
systemctl daemon-reload
systemctl restart docker
```

## 验证

```bash
docker info | grep "Registry Mirrors"
```

## 然后重新构建

```bash
cd /opt/vocal
docker compose up -d --build
```

## 或者使用阿里云镜像加速

访问：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors

获取你的专属加速地址，添加到上面。

