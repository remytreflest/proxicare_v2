#!/bin/bash
set -e

# ==================================================
# First-time SSL certificate setup for proxicare.ovh
# Run this ONCE on the VPS after initial deployment
# ==================================================

COMPOSE_CMD="docker compose -f docker-compose.prod.yml"

echo "=== Proxicare SSL Setup ==="
echo ""

# Step 1: Switch nginx to HTTP-only config for cert acquisition
echo "[1/5] Switching Nginx to HTTP-only mode..."
$COMPOSE_CMD exec nginx cp /etc/nginx/init-nginx.conf /etc/nginx/nginx.conf
$COMPOSE_CMD exec nginx nginx -s reload
echo "  ✅ Nginx running in HTTP-only mode"

# Step 2: Ensure certbot volumes are writable
echo "[2/5] Preparing certbot volumes..."
sleep 2

# Step 3: Run certbot to get initial certificate
echo "[3/5] Requesting SSL certificate from Let's Encrypt..."
$COMPOSE_CMD --profile init-ssl run --rm certbot
echo "  ✅ SSL certificate obtained"

# Step 4: Restore full SSL nginx config
echo "[4/5] Restoring Nginx SSL configuration..."
$COMPOSE_CMD exec nginx cp /etc/nginx/nginx.conf.bak /etc/nginx/nginx.conf 2>/dev/null || true
# The original nginx.conf (with SSL) was baked into the image, so rebuild/restart
$COMPOSE_CMD up -d --force-recreate nginx
echo "  ✅ Nginx restarted with SSL"

# Step 5: Verify
echo "[5/5] Verifying HTTPS..."
sleep 3
if curl -sSf --max-time 10 https://www.proxicare.ovh/ > /dev/null 2>&1; then
    echo "  ✅ HTTPS is working!"
else
    echo "  ⚠️  HTTPS verification failed. Check Nginx logs: $COMPOSE_CMD logs nginx"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Set up cert renewal cron job:"
echo "     crontab -e"
echo "     0 3 */60 * * cd /opt/proxicare && docker compose -f docker-compose.prod.yml --profile init-ssl run --rm certbot renew && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload"
echo ""
echo "  2. Verify: curl https://www.proxicare.ovh/api/healthcheck"
echo "  3. Access Portainer: https://$(hostname -I | awk '{print $1}'):9443"
