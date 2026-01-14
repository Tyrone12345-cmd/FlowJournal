import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const email = location.state?.email || searchParams.get('email');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await axios.get(`${API_URL}/auth/verify/${token}`);
      
      // Wenn ein Token und User zurückkommen, automatisch einloggen
      if (response.data.token && response.data.user) {
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().setAuth(response.data.user, response.data.token);
      }
      
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Verification failed';
      
      // Wenn bereits verifiziert und Token vorhanden, automatisch einloggen
      if (error.response?.data?.token && error.response?.data?.user) {
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().setAuth(error.response.data.user, error.response.data.token);
        navigate('/app/dashboard');
        return;
      }
      
      // Bei anderen Fehlern zum Login
      if (errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('expired')) {
        navigate('/login');
        return;
      }
      
      setStatus('error');
      setMessage(errorMessage);
      console.error('Verification error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            {message.includes('already verified') && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Your email has already been verified. You can log in now.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
              </button>
              {message.includes('expired') && (
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Request New Link
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
