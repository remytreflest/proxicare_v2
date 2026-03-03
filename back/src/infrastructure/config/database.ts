import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.DB_NAME || process.env.POSTGRES_DB || '';
const user = process.env.DB_USER || process.env.POSTGRES_USER || '';
const password = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '';
const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432');

const sequelize = new Sequelize(db, user, password, {
  host: host,
  port: port,
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
