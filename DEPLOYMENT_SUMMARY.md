# StudyTracker 部署配置总结

## 📦 已创建的部署文件

### 1. Docker 容器化文件
- `docker-compose.yml` - 完整的 Docker Compose 配置
- `backend/Dockerfile` - 后端多阶段构建
- `frontend/Dockerfile` - 前端多阶段构建
- `frontend/nginx.conf` - 前端 Nginx 配置（代理 API）

### 2. 配置示例文件
- `env.example` - 环境变量模板
- `backend/src/main/resources/application-local.yml.example` - 本地开发配置示例

### 3. 文档文件
- `README.md` - 项目主文档
- `QUICK_START.md` - 快速开始指南
- `DEPLOYMENT.md` - 详细部署指南
- `CHECKLIST.md` - 上线检查清单

## 🚀 快速部署步骤

### 使用 Docker Compose（最简单）

1. 克隆项目
   ```bash
   git clone <repository-url>
   cd studytracker
   ```

2. 配置环境变量
   ```bash
   cp env.example .env
   # 编辑 .env 文件，设置密码和密钥
   ```

3. 启动所有服务
   ```bash
   docker-compose up -d
   ```

4. 访问应用
   - 前端: http://localhost
   - API: http://localhost:8080

### 手动部署

参见 `DEPLOYMENT.md` 的详细步骤

## 🔧 服务架构

```
┌─────────────────┐
│   Nginx :80     │  ← 前端 + API 代理
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Frontend│ │Backend│
│ :80    │ │ :8080 │
└───────┘ └───┬───┘
              │
         ┌────▼────┐
         │  MySQL  │
         │  :3306  │
         └─────────┘
```

## 🔐 必需的环境变量

### 数据库
- `DB_PASS` - MySQL 用户密码
- `MYSQL_ROOT_PASSWORD` - MySQL root 密码

### 安全
- `JWT_SECRET` - JWT 签名密钥（至少32字符）

### 网络
- `CORS_ALLOWED_ORIGINS` - 允许的前端域名
- `VITE_API_BASE` - 前端使用的 API 地址

## 📊 服务清单

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend (Nginx) | 80 | 前端应用 + API 反向代理 |
| Backend (Spring Boot) | 8080 | REST API 服务 |
| MySQL | 3306 | 数据库 |

## 🔒 安全配置

### 生产环境必须配置

1. **强密码**
   - 数据库密码：16+ 字符
   - JWT 密钥：32+ 随机字符

2. **HTTPS**
   - 获取 SSL 证书
   - 配置 Nginx HTTPS
   - 强制 HTTP → HTTPS 重定向

3. **防火墙**
   - 只开放 22, 80, 443
   - 限制 SSH 访问

4. **数据库**
   - 限制 root 远程访问
   - 创建专用数据库用户

## 📝 迁移路径

### 开发 → 测试 → 生产

1. **开发环境**
   - 使用 Docker Compose
   - 本地数据库
   - HTTP 协议

2. **测试环境**
   - 模拟生产配置
   - 测试所有功能
   - 性能测试

3. **生产环境**
   - HTTPS
   - 强密码
   - 监控和备份

## 🛠️ 维护任务

### 日常
- 监控错误日志
- 检查资源使用
- 验证备份

### 定期
- 每周：检查安全更新
- 每月：数据库备份恢复测试
- 每季：性能优化评估

## 📚 参考文档

- [快速开始](./QUICK_START.md) - 5分钟上手指南
- [部署指南](./DEPLOYMENT.md) - 详细部署说明
- [检查清单](./CHECKLIST.md) - 上线前检查

## 🆘 故障排除

### 常见问题

**1. 数据库连接失败**
- 检查 MySQL 是否运行
- 验证环境变量
- 查看后端日志

**2. CORS 错误**
- 检查 `CORS_ALLOWED_ORIGINS`
- 验证前端域名

**3. 前端无法加载**
- 检查 Nginx 配置
- 验证文件权限
- 清除浏览器缓存

**4. JWT 验证失败**
- 检查 `JWT_SECRET` 配置
- 验证 token 是否过期

详细问题参见各文档的"常见问题"部分

## 📞 获取帮助

1. 查看日志：`docker-compose logs`
2. 检查状态：`docker-compose ps`
3. 查看文档：README.md, DEPLOYMENT.md
4. 联系支持：[联系信息]

## ✅ 成功标准

部署成功的标志：
- ✅ 所有容器正常运行
- ✅ 前端页面正常加载
- ✅ 用户可以注册和登录
- ✅ 数据库连接正常
- ✅ 日志无严重错误
- ✅ HTTPS 正常工作（生产环境）

---

**版本**: 1.0.0  
**最后更新**: 2025-10-30  
**维护者**: StudyTracker Team

