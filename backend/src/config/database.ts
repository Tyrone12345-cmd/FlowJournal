import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('DB Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'NOT SET'
});

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'flowjournal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD?.replace(/['"]/g, ''),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
