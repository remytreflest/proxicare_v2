# Proxicare — VPS Deployment Guide

## Prerequisites

- **VPS**: OVH VPS — Debian 12 (Docker already installed)
- **IP**: `37.59.102.153`
- **Domain**: `proxicare.ovh`
- **DNS**: A record `proxicare.ovh` → `37.59.102.153` (set this first!)

---

## 1. Verify Docker installation

```bash
# Confirm Docker and Docker Compose are available
docker --version
docker compose version

# Ensure Docker is running
sudo systemctl status docker

# If not running:
sudo systemctl enable docker
sudo systemctl start docker
```

## 2. Create deploy user

```bash
# Create user with Docker access
sudo useradd -m -s /bin/bash -G docker deploy

# Set up SSH key auth
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/ # or add a dedicated key
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

## 3. Set up the project directory

```bash
sudo mkdir -p /opt/proxicare
sudo chown deploy:deploy /opt/proxicare
```

As the `deploy` user, clone the repository:

```bash
su - deploy
git clone https://github.com/remytreflest/proxicare_v2.git /opt/proxicare
cd /opt/proxicare
```

## 4. Configure environment

On the VPS:

```bash
cd /opt/proxicare
cp .env.example .env
nano .env
```

Fill in all values:
- `AUTH0_SECRET` — generate with `openssl rand -hex 32`
- `AUTH0_BASE_URL=https://www.proxicare.ovh`
- `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` — from Auth0 dashboard
- `AUTH0_AUDIENCE` — your Auth0 API audience
- `AUTH0_DOMAIN` — your Auth0 domain
- `DB_PASSWORD` — a strong random password
- `API_CORS=https://www.proxicare.ovh`
- `DOMAIN=proxicare.ovh`
- `CERTBOT_EMAIL=your-email@example.com`

## 5. First deployment

```bash
cd /opt/proxicare

# Pull images
docker compose -f docker-compose.prod.yml pull

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Verify services are running
docker compose -f docker-compose.prod.yml ps
```

## 6. SSL certificate setup

First time only — get the initial Let's Encrypt certificate:

```bash
cd /opt/proxicare
bash deploy/init-ssl.sh
```

Or manually:

```bash
COMPOSE="docker compose -f docker-compose.prod.yml"

# Switch nginx to HTTP-only mode
$COMPOSE exec nginx cp /etc/nginx/init-nginx.conf /etc/nginx/nginx.conf
$COMPOSE exec nginx nginx -s reload

# Get SSL certificate
$COMPOSE --profile init-ssl run --rm certbot

# Restart nginx with SSL config (recreate to restore original image config)
$COMPOSE up -d --force-recreate nginx

# Verify HTTPS
curl -I https://www.proxicare.ovh/
```

## 7. Set up certificate auto-renewal

```bash
crontab -e
```

Add this line:

```
0 3 1,15 * * cd /opt/proxicare && docker compose -f docker-compose.prod.yml --profile init-ssl run --rm certbot renew && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 8. Configure Auth0

In the Auth0 dashboard, update your application settings:

- **Allowed Callback URLs**: `https://www.proxicare.ovh/auth/callback`
- **Allowed Logout URLs**: `https://www.proxicare.ovh`
- **Allowed Web Origins**: `https://www.proxicare.ovh`

## 9. Access Portainer

Open `https://37.59.102.153:9443` in your browser and create an admin account on first visit.

From Portainer you can:
- View all running containers
- Read container logs
- Restart/stop services
- Monitor resource usage

## 10. Firewall (recommended)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 9443/tcp  # Portainer
sudo ufw enable
```

---

## GitHub Secrets

Set these in your repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | IP address of the VPS |
| `VPS_PORT` | SSH port of the VPS |
| `VPS_USER` | User for SSH access |
| `VPS_PASSWORD` | Password for SSH access |

---

## Useful commands

```bash
cd /opt/proxicare
COMPOSE="docker compose -f docker-compose.prod.yml"

# View logs
$COMPOSE logs -f              # All services
$COMPOSE logs -f api          # Backend only
$COMPOSE logs -f front        # Frontend only
$COMPOSE logs -f nginx        # Nginx only

# Restart a service
$COMPOSE restart api

# Check service health
$COMPOSE ps

# Manual deploy (pull latest images)
$COMPOSE pull && $COMPOSE up -d

# Database access
$COMPOSE exec postgres psql -U proxicare -d proxicare

# Run migrations manually
$COMPOSE exec api npm run migrate
```
