# 修复 JWT 密钥长度问题

## 问题
JWT 密钥必须是至少 256 位（32 字节），当前密钥只有 192 位。

## 解决方案

在服务器上执行：

```bash
cd /opt/vocal

# 检查当前 .env 文件
cat .env

# 生成新的 JWT 密钥（至少 32 字符）
openssl rand -base64 32

# 编辑 .env 文件，将生成的密钥替换 JWT_SECRET
nano .env
```

在 `.env` 文件中，将 `JWT_SECRET` 替换为生成的密钥（至少 32 字符）。

如果没有 `openssl`，可以用 Python 生成：

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 示例

```bash
JWT_SECRET=aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeee
```

这个密钥是 50 个字符，足够安全。

## 重新启动

```bash
docker compose down
docker compose up -d
```

## 检查日志

```bash
docker logs studytracker-backend
```

应该可以看到启动成功的日志。
