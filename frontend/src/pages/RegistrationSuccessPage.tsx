import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      console.error('E-Mail-Adresse nicht gefunden');
      return;
    }

    setIsResending(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      console.log('Bestätigungs-E-Mail erneut gesendet!');
    } catch (error: any) {
      console.error(error.response?.data?.error || 'Fehler beim Senden der E-Mail');
    } finally {
      setIsResending(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Registrierung erfolgreich!
          </h2>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Wir haben dir eine Bestätigungs-E-Mail gesendet.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Bitte überprüfe dein E-Mail-Postfach und klicke auf den Bestätigungslink, um dein Konto zu aktivieren.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Zum Login
            <ArrowRight size={20} />
          </Link>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Keine E-Mail erhalten?{' '}
            <button 
              onClick={handleResendEmail}
              disabled={isResending || !email}
              className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Wird gesendet...' : 'Erneut senden'}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            💡 Tipp: Überprüfe auch deinen Spam-Ordner, falls du die E-Mail nicht finden kannst.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccessPage;
