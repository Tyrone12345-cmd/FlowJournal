import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Support both DATABASE_URL and individual DB_ variables
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL for database connection');
    // Check if we need SSL (only for external databases like DigitalOcean Managed DB)
    const needsSSL = process.env.DB_SSL === 'true' || process.env.DATABASE_URL.includes('sslmode=require');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: needsSSL ? { rejectUnauthorized: false } : false
    };
  }
  
  console.log('DB Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***' : 'NOT SET'
  });
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'flowjournal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD?.replace(/['"]/g, ''),
    ssl: false
  };
};

export const pool = new Pool(getDatabaseConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
