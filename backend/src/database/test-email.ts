import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testEmail() {
  console.log('📧 Teste Email-Konfiguration...\n');
  
  console.log('Konfiguration:');
  console.log('- Host:', process.env.EMAIL_HOST);
  console.log('- Port:', process.env.EMAIL_PORT);
  console.log('- User:', process.env.EMAIL_USER);
  console.log('- Pass:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
  console.log();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    console.log('🔍 Überprüfe SMTP-Verbindung...');
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich!\n');

    console.log('📨 Sende Test-Email...');
    const info = await transporter.sendMail({
      from: `"FlowJournal Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Test Email - FlowJournal',
      text: 'Wenn du diese Email erhältst, funktioniert der Email-Versand!',
      html: '<h1>✅ Test erfolgreich!</h1><p>Email-Versand funktioniert.</p>',
    });

    console.log('✅ Email gesendet!');
    console.log('Message ID:', info.messageId);
    console.log('\n📬 Überprüfe dein Postfach:', process.env.EMAIL_USER);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Fehler:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    process.exit(1);
  }
}

testEmail();
