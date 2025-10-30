# Git Clone TLS 错误解决方案

在阿里云服务器上克隆 GitHub 仓库时如果遇到 TLS 错误，可以尝试以下方法：

## 方法 1: 临时关闭 SSL 验证（最快）

```bash
cd /opt
git -c http.sslVerify=false clone https://github.com/CQNOXQ/vocal.git
cd vocal/studytracker
```

**注意**：这只是临时解决方案，不适合生产环境。

## 方法 2: 使用 SCP 上传（推荐）

如果 Git 始终无法连接，直接从本地电脑上传文件。

### Windows 使用 WinSCP：

1. 下载 WinSCP: https://winscp.net/
2. 连接到服务器（root@你的公网IP）
3. 在左侧选择本地 `C:\Users\CQ\Desktop\voc\studytracker` 目录
4. 在右侧创建目录 `/opt/vocal/studytracker`
5. 上传整个 `studytracker` 文件夹

### Windows 使用命令行：

```powershell
# 在本地电脑运行
cd C:\Users\CQ\Desktop\voc
scp -r studytracker root@你的公网IP:/opt/vocal/
```

然后在服务器上：
```bash
cd /opt/vocal/studytracker
```

## 方法 3: 更新 Git 和 CA 证书

```bash
# 更新系统
apt update && apt upgrade -y

# 更新 CA 证书
apt install -y ca-certificates
update-ca-certificates

# 重新尝试克隆
git clone https://github.com/CQNOXQ/vocal.git
```

## 方法 4: 配置 Git 使用不同的 SSL

```bash
# 安装最新版本
apt install -y git-core

# 配置 Git
git config --global http.sslVersion tlsv1.2
git config --global http.postBuffer 1048576000

# 重新尝试
git clone https://github.com/CQNOXQ/vocal.git
```

## 方法 5: 使用 GitHub 镜像（如果可用）

```bash
# 某些地区可能需要使用镜像
git clone https://ghproxy.com/https://github.com/CQNOXQ/vocal.git
```

## 推荐方案

**最快方案**：使用方法 2（SCP 上传），直接上传文件，避免 Git 连接问题。

**标准方案**：使用方法 3 更新证书后重试 Git clone。

---

文件上传成功后，继续按照部署指南操作即可。

