import { query, pool } from '../config/database';

async function checkVerificationToken() {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, email_verified, 
              verification_token, verification_token_expires 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 5`
    );

    console.log('\n📋 VERIFICATION TOKENS IN DB:\n');
    
    if (result.rows.length === 0) {
      console.log('❌ Keine Benutzer gefunden');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email} (${user.first_name} ${user.last_name})`);
        console.log(`   Email verified: ${user.email_verified ? '✅ Ja' : '❌ Nein'}`);
        console.log(`   Token: ${user.verification_token || '(leer)'}`);
        console.log(`   Token expires: ${user.verification_token_expires || '(keine Angabe)'}`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

checkVerificationToken();
