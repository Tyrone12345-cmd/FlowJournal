import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'flowjournal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD?.replace(/['"]/g, ''),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - teams');
    console.log('   - users');
    console.log('   - strategies');
    console.log('   - trades');
    console.log('   - user_settings');
    console.log('   - team_settings');
    console.log('   - app_settings');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
