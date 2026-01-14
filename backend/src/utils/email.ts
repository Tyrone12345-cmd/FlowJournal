import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email-Transporter konfigurieren
const createTransporter = async () => {
  // Für Development: Verwende Ethereal Email (Test-Account)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Verwende Ethereal Test-Email Account');
    console.log('📬 Emails ansehen: https://ethereal.email');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Production/Gmail
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

let transporter: any = null;

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

// Verification Token generieren
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Verification Email senden
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"FlowJournal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Bestätige deine Email-Adresse - FlowJournal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #667eea; margin-top: 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { opacity: 0.9; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 FlowJournal</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Dein Trading Journal</p>
          </div>
          <div class="content">
            <h2>Willkommen, ${firstName}!</h2>
            <p>Vielen Dank für deine Registrierung bei FlowJournal! Um dein Konto zu aktivieren, bestätige bitte deine Email-Adresse.</p>
            
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Email bestätigen</a>
            </p>
            
            <p style="font-size: 14px; color: #666;">Oder kopiere diesen Link in deinen Browser:</p>
            <p style="background: #f8f9fa; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Hinweis:</strong> Dieser Link ist 24 Stunden gültig. Solltest du diese Email nicht angefordert haben, ignoriere sie einfach.
            </div>
          </div>
          <div class="footer">
            <p>© 2026 FlowJournal. Alle Rechte vorbehalten.</p>
            <p>Diese Email wurde automatisch generiert. Bitte antworte nicht auf diese Email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Willkommen bei FlowJournal, ${firstName}!

Um dein Konto zu aktivieren, bestätige bitte deine Email-Adresse:
${verificationUrl}

Dieser Link ist 24 Stunden gültig.

Solltest du diese Email nicht angefordert haben, ignoriere sie einfach.

© 2026 FlowJournal
    `,
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    
    // Im Development-Modus: Zeige Ethereal-Link
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('📧 Email Preview:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

// Passwort-Reset Email senden
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  token: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"FlowJournal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Passwort zurücksetzen - FlowJournal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Passwort zurücksetzen</h1>
          </div>
          <div class="content">
            <p>Hallo ${firstName},</p>
            <p>Du hast angefragt, dein Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu setzen:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Neues Passwort setzen</a>
            </p>
            
            <p style="font-size: 12px; color: #999;">Dieser Link ist 1 Stunde gültig.</p>
            <p style="font-size: 12px; color: #999;">Falls du diese Anfrage nicht gestellt hast, ignoriere diese Email.</p>
          </div>
          <div class="footer">
            <p>© 2026 FlowJournal</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
