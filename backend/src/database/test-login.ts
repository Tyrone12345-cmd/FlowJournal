import { query, pool } from '../config/database';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    const email = 'borisovalbert722@gmail.com';
    
    const result = await query(
      'SELECT id, email, password, first_name, last_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Benutzer nicht gefunden');
      await pool.end();
      return;
    }

    const user = result.rows[0];
    
    console.log('\n📋 BENUTZER-DETAILS:\n');
    console.log('Email:', user.email);
    console.log('Name:', user.first_name, user.last_name);
    console.log('Email verifiziert:', user.email_verified ? '✅ Ja' : '❌ Nein');
    console.log('Passwort Hash:', user.password ? '✅ Vorhanden' : '❌ Fehlt');
    console.log('Hash Länge:', user.password ? user.password.length : 0);
    
    // Test mit verschiedenen Passwörtern
    const testPasswords = ['password', '12345678', 'Password123', 'Test1234'];
    
    console.log('\n🔐 PASSWORT TESTS:');
    for (const testPw of testPasswords) {
      const isValid = await bcrypt.compare(testPw, user.password);
      console.log(`  "${testPw}": ${isValid ? '✅ MATCH' : '❌ Kein Match'}`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

testLogin();
