import { query, pool } from '../config/database';

async function checkOnboarding() {
  try {
    const result = await query(
      `SELECT email, first_name, last_name, email_verified, 
              password, google_id, onboarding_completed 
       FROM users 
       WHERE email = 'borisovalbert722@gmail.com'`
    );

    if (result.rows.length === 0) {
      console.log('❌ Benutzer nicht gefunden');
    } else {
      const user = result.rows[0];
      console.log('\n📋 ACCOUNT STATUS:\n');
      console.log('Email:', user.email);
      console.log('Name:', user.first_name, user.last_name);
      console.log('Email verifiziert:', user.email_verified ? '✅ Ja' : '❌ Nein');
      console.log('Google ID:', user.google_id || '(nicht vorhanden)');
      console.log('Passwort gesetzt:', user.password && user.password.length > 0 ? '✅ Ja' : '❌ Nein');
      console.log('Onboarding abgeschlossen:', user.onboarding_completed ? '✅ Ja' : '❌ Nein');
      
      console.log('\n💡 LÖSUNGEN:\n');
      if (user.google_id && (!user.password || user.password.length === 0)) {
        console.log('⚠️  Du hast dich mit Google angemeldet, aber kein Passwort gesetzt.');
        console.log('   Optionen:');
        console.log('   1. Verwende "Sign in with Google" zum Einloggen');
        console.log('   2. Setze ein Passwort über das Onboarding');
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

checkOnboarding();
