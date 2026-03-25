#!/bin/sh
set -e

CERT_PATH="/etc/letsencrypt/live/proxicare.ovh/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo "[nginx] SSL certificate found — starting with HTTPS configuration"
    cp /etc/nginx/ssl-nginx.conf /etc/nginx/nginx.conf
else
    echo "[nginx] No SSL certificate found — starting with HTTP-only configuration"
    cp /etc/nginx/init-nginx.conf /etc/nginx/nginx.conf
fi

exec nginx -g "daemon off;"
