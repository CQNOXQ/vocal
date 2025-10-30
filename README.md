# StudyTracker - 学习与背词追踪系统

一个功能完整的学习时间追踪和单词学习记录应用，帮助用户管理学习进度和目标。

## ✨ 主要功能

- 📚 **科目管理**: 创建和管理学习科目，支持自定义颜色和目标
- ⏱️ **时间追踪**: 记录学习时长，支持定时器和手动输入
- 📖 **单词学习**: 记录单词学习进度，包含书籍和数量统计
- 📊 **可视化统计**: 日历视图、历史记录、数据分析
- 🎨 **个性化主题**: 支持多种主题风格，包括可爱的"一二布布"主题
- 🔐 **安全认证**: JWT 身份验证，邀请码注册机制

## 🚀 快速开始

### 使用 Docker Compose（推荐）

```bash
# 1. 复制环境变量文件
cp env.example .env

# 2. 编辑 .env 文件，设置密码和密钥
nano .env

# 3. 启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost
# 后端: http://localhost:8080
```

详细步骤请查看 [QUICK_START.md](./QUICK_START.md)

### 手动安装

#### 后端

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ 技术栈

### 前端

- **React 19**: UI 框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架
- **Zustand**: 状态管理
- **React Router**: 路由管理

### 后端

- **Spring Boot 3.5.7**: Java 框架
- **Spring Security**: 安全框架
- **JPA/Hibernate**: ORM
- **MySQL**: 数据库
- **Flyway**: 数据库迁移
- **JWT**: 身份验证

## 📁 项目结构

```
studytracker/
├── backend/          # Spring Boot 后端
│   ├── src/
│   │   └── main/
│   │       ├── java/com/studytracker/
│   │       │   ├── auth/         # 认证相关
│   │       │   ├── config/       # 配置类
│   │       │   ├── study/        # 学习记录
│   │       │   ├── words/        # 单词学习
│   │       │   ├── subject/      # 科目管理
│   │       │   └── security/     # 安全配置
│   │       └── resources/
│   │           └── db/migration/ # 数据库迁移脚本
│   ├── Dockerfile
│   └── pom.xml
├── frontend/         # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── stores/       # 状态管理
│   │   └── lib/          # 工具库
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Docker 编排
├── DEPLOYMENT.md        # 部署指南
└── QUICK_START.md       # 快速开始
```

## 📖 使用指南

### 首次使用

1. **注册账号**: 需要一个有效的邀请码
2. **生成邀请码**: 在"设置"页面可以生成新的邀请码
3. **创建科目**: 添加你正在学习的科目
4. **设置目标**: 为每个科目设置每日学习目标

### 记录学习

#### 计时学习

1. 在"记录学习"页面
2. 选择科目
3. 点击"开始学习"开始计时
4. 完成后点击"停止学习"保存

#### 手动记录

1. 选择科目
2. 输入学习时长（分钟）
3. 添加备注（可选）
4. 提交记录

### 单词学习

1. 选择"单词"类型的科目
2. 输入背词数量
3. 选择书籍（可选）
4. 添加备注（可选）

### 查看统计

- **日历**: 查看每日学习记录
- **历史**: 查看所有学习记录列表
- **仪表板**: 查看今日统计和目标进度

## 🔒 安全特性

- JWT 身份验证
- 密码加密存储（BCrypt）
- 邀请码注册机制
- CORS 保护
- SQL 注入防护

## 🎨 主题系统

- **默认主题**: 现代蓝色渐变
- **一二布布主题**: 可爱的橙粉色调，包含特殊动画效果
- **翻牌时钟主题**: 5 种颜色风格可选
- **渐变主题**: 7 种预设渐变背景

## 📝 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
# 数据库密码
DB_PASS=your_password

# JWT 密钥（至少32字符）
JWT_SECRET=your_secret_key

# CORS 允许的源
CORS_ALLOWED_ORIGINS=http://localhost

# 前端 API 地址
VITE_API_BASE=http://localhost:8080
```

### 数据库配置

使用 Flyway 进行数据库迁移，自动创建表结构和索引。

## 🚢 部署

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 生产环境建议

- 使用 HTTPS
- 配置强 JWT 密钥
- 定期备份数据库
- 启用日志监控
- 配置防火墙规则

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 📞 支持

如有问题，请查看：
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南

## 🔄 更新日志

### v1.0.0
- ✅ 基础学习追踪功能
- ✅ 科目管理和目标设置
- ✅ 计时器和手动记录
- ✅ 单词学习记录
- ✅ 日历视图和历史记录
- ✅ 多主题支持
- ✅ 邀请码注册系统

