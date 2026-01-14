import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'add-emotions-mistakes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration: add-emotions-mistakes.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
