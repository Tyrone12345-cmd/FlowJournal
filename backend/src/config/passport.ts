import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from '../config/database';

export const initializePassport = () => {
  // Only initialize Google OAuth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Initializing Google OAuth with:');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback');
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);
          try {
            // Check if user exists
            const existingUser = await pool.query(
              'SELECT * FROM users WHERE email = $1',
              [profile.emails?.[0]?.value]
            );

            if (existingUser.rows.length > 0) {
              // User exists, return user
              return done(null, existingUser.rows[0]);
            }

            // Create new user
            const newUser = await pool.query(
              `INSERT INTO users (email, password, first_name, last_name, role, email_verified, google_id, onboarding_completed)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               RETURNING *`,
              [
                profile.emails?.[0]?.value,
                '', // No password for OAuth users - they'll set it during onboarding
                profile.name?.givenName || 'User',
                profile.name?.familyName || '',
                'trader',
                true, // Email already verified by Google
                profile.id, // Store Google ID
                false // Onboarding not completed yet
              ]
            );

            // Create default settings
            await pool.query(
              'INSERT INTO user_settings (user_id) VALUES ($1)',
              [newUser.rows[0].id]
            );

            return done(null, newUser.rows[0]);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
      } catch (error) {
        done(error, null);
      }
    });
  } else {
    console.log('Google OAuth not configured - skipping');
  }
};
