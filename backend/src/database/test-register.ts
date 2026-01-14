import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

async function testRegister() {
  try {
    console.log('Testing registration...');
    
    const testUser = {
      email: 'test@example.com',
      password: 'Test1234!',
      firstName: 'Test',
      lastName: 'User',
      role: 'trader'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    console.log('Password hashed successfully');

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [testUser.email, hashedPassword, testUser.firstName, testUser.lastName, testUser.role]
    );

    console.log('✅ User created successfully:', result.rows[0]);
    
    // Create default settings
    await pool.query(
      `INSERT INTO user_settings (user_id) VALUES ($1)`,
      [result.rows[0].id]
    );
    
    console.log('✅ User settings created');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRegister();
