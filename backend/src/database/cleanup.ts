import { pool } from '../config/database';

async function cleanup() {
  try {
    console.log('🗑️  Lösche ALLE Accounts...');
    
    const result = await pool.query('DELETE FROM users');
    
    console.log('✅ Gelöscht:', result.rowCount, 'Accounts');
    console.log('📋 Datenbank ist jetzt leer');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

cleanup();
