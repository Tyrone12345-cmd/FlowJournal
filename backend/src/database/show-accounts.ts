import { pool } from '../config/database';

async function showAccounts() {
  try {
    console.log('\n📋 ALLE ACCOUNTS IN DER DATENBANK:\n');
    
    const result = await pool.query(`
      SELECT 
        id,
        email,
        first_name || ' ' || last_name as name,
        role,
        email_verified,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ Keine Accounts vorhanden\n');
    } else {
      console.table(result.rows.map(row => ({
        Email: row.email,
        Name: row.name,
        Rolle: row.role,
        'Email bestätigt': row.email_verified ? '✅' : '❌',
        'Erstellt am': new Date(row.created_at).toLocaleString('de-DE')
      })));
      console.log(`\n✅ Total: ${result.rows.length} Account(s)\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

showAccounts();
