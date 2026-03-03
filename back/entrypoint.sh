#!/bin/sh

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL sur $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "✅ PostgreSQL est prêt, on lance les migrations..."
npm run migrate

echo "🚀 Lancement du serveur Node.js..."
exec npm start