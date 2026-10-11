# One free web service: React/Nginx and the existing Java API, external MySQL.
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --include=dev
COPY frontend/ ./
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-21 AS backend
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -ntp package -Dmaven.test.skip=true

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache nginx supervisor curl gettext \
    && addgroup -g 1000 -S appgroup && adduser -u 1000 -S appuser -G appgroup \
    && mkdir -p /app /app/html /tmp/nginx-client /tmp/nginx-proxy /tmp/nginx-fastcgi /tmp/nginx-uwsgi /tmp/nginx-scgi \
    && chown -R appuser:appgroup /app /tmp/nginx-client /tmp/nginx-proxy /tmp/nginx-fastcgi /tmp/nginx-uwsgi /tmp/nginx-scgi
COPY --from=backend --chown=appuser:appgroup /app/target/smart-expense-manager-*.jar /app/app.jar
COPY --from=frontend --chown=appuser:appgroup /frontend/dist /app/html
COPY deploy/render/nginx.conf.template /app/nginx.conf.template
COPY deploy/render/supervisord.conf /app/supervisord.conf
COPY deploy/render/start.sh /app/start.sh
RUN chmod +x /app/start.sh
USER appuser
ENV PORT=10000 SERVER_PORT=8080 SPRING_PROFILES_ACTIVE=prod,cloud-free
EXPOSE 10000
HEALTHCHECK --interval=20s --timeout=5s --start-period=90s --retries=8 \
    CMD curl -fsS http://127.0.0.1:${PORT}/actuator/health/readiness || exit 1
ENTRYPOINT ["/app/start.sh"]
