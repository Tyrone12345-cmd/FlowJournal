import { pool } from '../config/database';

async function deleteAllAccounts() {
  try {
    console.log('Starte das Löschen aller Accounts...');
    
    // Zeige zuerst die Anzahl der vorhandenen Accounts
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const accountCount = countResult.rows[0].count;
    console.log(`Gefundene Accounts: ${accountCount}`);
    
    if (accountCount === '0') {
      console.log('Keine Accounts zum Löschen vorhanden.');
      process.exit(0);
    }
    
    // Lösche alle Accounts (CASCADE löscht automatisch alle zugehörigen Daten)
    const deleteResult = await pool.query('DELETE FROM users');
    console.log(`✓ ${deleteResult.rowCount} Accounts erfolgreich gelöscht`);
    
    // Bestätige, dass keine Accounts mehr vorhanden sind
    const verifyResult = await pool.query('SELECT COUNT(*) FROM users');
    const remainingCount = verifyResult.rows[0].count;
    console.log(`Verbleibende Accounts: ${remainingCount}`);
    
    if (remainingCount === '0') {
      console.log('✓ Alle Accounts wurden erfolgreich aus der Datenbank entfernt.');
    } else {
      console.error('⚠ Warnung: Es sind noch Accounts in der Datenbank vorhanden.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Löschen der Accounts:', error);
    process.exit(1);
  }
}

deleteAllAccounts();
