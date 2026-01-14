import { query, pool } from '../config/database';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetPassword() {
  try {
    const email = 'borisovalbert722@gmail.com';
    
    // Check if user exists
    const userCheck = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ Benutzer nicht gefunden');
      await pool.end();
      rl.close();
      return;
    }

    const user = userCheck.rows[0];
    console.log(`\n🔑 PASSWORT ZURÜCKSETZEN für: ${user.email}\n`);

    rl.question('Neues Passwort eingeben (mindestens 8 Zeichen): ', async (newPassword) => {
      if (newPassword.length < 8) {
        console.log('❌ Passwort muss mindestens 8 Zeichen lang sein');
        await pool.end();
        rl.close();
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, user.id]
      );

      console.log('\n✅ Passwort erfolgreich aktualisiert!');
      console.log('📧 Email:', email);
      console.log('🔐 Du kannst dich jetzt mit dem neuen Passwort anmelden.\n');

      await pool.end();
      rl.close();
    });
  } catch (error) {
    console.error('❌ Fehler:', error);
    await pool.end();
    rl.close();
    process.exit(1);
  }
}

resetPassword();
