import { useAuthStore } from './store/authStore';

function TestAuth() {
  const { user, token, isAuthenticated } = useAuthStore();
  
  console.log('=== AUTH DEBUG ===');
  console.log('User:', user);
  console.log('Token:', token);
  console.log('IsAuthenticated:', isAuthenticated());
  console.log('LocalStorage token:', localStorage.getItem('token'));
  console.log('LocalStorage auth-storage:', localStorage.getItem('auth-storage'));
  
  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h1>Auth Debug</h1>
      <pre>{JSON.stringify({ user, token, isAuth: isAuthenticated() }, null, 2)}</pre>
    </div>
  );
}

export default TestAuth;
