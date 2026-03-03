const { Client } = require('pg');
require('dotenv').config();

// Support des deux conventions de nommage
const user = process.env.DB_USER || process.env.POSTGRES_USER || 'proxicare';
const password = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '';
const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432');
const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || 'proxicare';

const client = new Client({
  user: user,
  password: password,
  host: host,
  port: port,
  database: 'postgres', // Connexion à postgres pour pouvoir créer une autre base
});

console.log(`🔍 Tentative de connexion à PostgreSQL sur ${host}:${port}...`);

client.connect()
  .then(() => {
    console.log('✅ Connexion établie');
    return client.query(`CREATE DATABASE ${dbName};`);
  })
  .then(() => console.log(`✅ Base de données "${dbName}" créée avec succès.`))
  .catch(err => {
    if (err.code === '42P04') {
      console.log(`ℹ️  Base de données "${dbName}" existe déjà.`);
    } else {
      console.error('❌ Erreur lors de la création de la base de données:', err.message);
      process.exit(1);
    }
  })
  .finally(() => client.end());