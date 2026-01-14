import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Google OAuth Configuration Check\n');
console.log('='.repeat(60));
console.log('\n📋 Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || '❌ NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback');

console.log('\n✨ Expected Configuration in Google Console:');
console.log('='.repeat(60));
console.log('\n📍 Authorized JavaScript origins:');
console.log('   - http://localhost:3001');
console.log('   - http://localhost:5173');
console.log('\n📍 Authorized redirect URIs:');
console.log('   - http://localhost:3001/api/auth/google/callback');

console.log('\n⚠️  Common Issues:');
console.log('='.repeat(60));
console.log('1. Client Secret is invalid or expired');
console.log('2. Redirect URI doesn\'t match exactly');
console.log('3. Google changes can take 5-10 minutes to propagate');
console.log('4. Make sure to click "SAVE" in Google Console');

console.log('\n💡 Next Steps:');
console.log('='.repeat(60));
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Find your OAuth 2.0 Client');
console.log('3. Copy the Client Secret again');
console.log('4. Update backend/.env with the correct secret');
console.log('5. Restart the server\n');
