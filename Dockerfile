# Multi-stage Dockerfile for Smart Expense Manager V2

# Stage 1: Build stage with Maven & JDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build executable jar
COPY src ./src
RUN mvn package -DskipTests -B \
  && mv target/smart-expense-manager-*.jar target/app.jar

# Stage 2: Runtime stage with lightweight JRE 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy application jar from builder stage
COPY --from=builder /app/target/app.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD-SHELL wget --quiet --tries=1 --spider "http://localhost:${SERVER_PORT:-${PORT:-8080}}/actuator/health/liveness" || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
