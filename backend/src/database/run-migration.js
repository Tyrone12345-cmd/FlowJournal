const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'flowjournal',
    user: 'postgres',
    password: 'Borisov2805',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sqlPath = path.join(__dirname, 'add-emotions-mistakes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration: add-emotions-mistakes.sql');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
