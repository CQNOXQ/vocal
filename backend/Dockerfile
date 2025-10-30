# 构建阶段
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# 复制 Maven wrapper 和 pom.xml
COPY mvnw pom.xml ./
COPY .mvn .mvn

# 下载依赖（利用 Docker 缓存）
RUN ./mvnw dependency:go-offline

# 复制源代码
COPY src ./src

# 构建应用
RUN ./mvnw clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:21-jre

WORKDIR /app

# 从构建阶段复制 JAR 文件
COPY --from=builder /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]

