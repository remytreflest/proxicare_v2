# ==================================
# Stage 1: Build
# ==================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# ==================================
# Stage 2: Production
# ==================================
FROM node:20-alpine AS production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist

# Copier les fichiers de configuration nécessaires
COPY --from=builder /app/config ./config
COPY --from=builder /app/.sequelizerc ./.sequelizerc

# Copier les fichiers Swagger YAML
# COPY --from=builder /app/src/swagger ./dist/swagger

# Copier le script de création de la base de données (référencé dans npm run migrate)
COPY --from=builder /app/src/migrations ./src/migrations

# Copier l'entrypoint (migrations + démarrage)
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Installer netcat pour le health check de PostgreSQL dans entrypoint
RUN apk add --no-cache netcat-openbsd

# Installer sequelize-cli pour les migrations
RUN npm install -g sequelize-cli

# Changer le propriétaire des fichiers
RUN chown -R nodejs:nodejs /app

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthcheck || exit 1

# Utiliser l'entrypoint pour les migrations automatiques
ENTRYPOINT ["./entrypoint.sh"]
