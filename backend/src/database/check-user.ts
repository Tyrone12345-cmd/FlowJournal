import { query } from '../config/database';

async function checkUser() {
  try {
    const result = await query(
      'SELECT email, email_verified, verification_token, verification_token_expires FROM users WHERE email = $1',
      ['borisovalbert722@gmail.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
    } else {
      const user = result.rows[0];
      console.log('\n📋 USER STATUS:');
      console.log('Email:', user.email);
      console.log('Email verifiziert:', user.email_verified ? '✅ JA' : '❌ NEIN');
      console.log('Verification Token:', user.verification_token || '(keiner)');
      console.log('Token gültig bis:', user.verification_token_expires || '(kein Ablaufdatum)');
      console.log('');
      
      if (!user.email_verified) {
        console.log('⚠️  Dieser User sollte sich NICHT einloggen können!');
      } else {
        console.log('✅ Dieser User kann sich einloggen');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
