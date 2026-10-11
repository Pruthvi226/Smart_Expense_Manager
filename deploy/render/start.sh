#!/bin/sh
set -eu
export PORT="${PORT:-10000}"
case "$PORT" in ''|*[!0-9]*) echo "PORT must be numeric" >&2; exit 1;; esac
# The Java API is private to this container; Render routes to Nginx.
export SERVER_PORT=8080
export APP_PUBLIC_BASE_URL="${APP_PUBLIC_BASE_URL:-${RENDER_EXTERNAL_URL:-}}"
if [ -z "$APP_PUBLIC_BASE_URL" ]; then
    echo "Set APP_PUBLIC_BASE_URL or provide RENDER_EXTERNAL_URL" >&2
    exit 1
fi
if [ -f /etc/secrets/aiven-ca.pem ]; then
    # This contains a public CA certificate only, not a private credential.
    rm -f /tmp/mysql-truststore.p12
    keytool -importcert -noprompt -alias aiven-ca -file /etc/secrets/aiven-ca.pem \
        -keystore /tmp/mysql-truststore.p12 -storetype PKCS12 -storepass changeit >/dev/null
fi
envsubst '${PORT}' < /app/nginx.conf.template > /tmp/nginx.conf
nginx -t -c /tmp/nginx.conf
exec supervisord -c /app/supervisord.conf
