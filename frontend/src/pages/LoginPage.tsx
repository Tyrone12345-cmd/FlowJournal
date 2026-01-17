import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Moon, Sun, BarChart3, Target, ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(1, 'Passwort erforderlich'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme, toggleTheme } = useThemeStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      
      // Set token first in localStorage before calling setAuth
      localStorage.setItem('token', response.token);
      
      // Then update the auth store
      setAuth(response.user, response.token);
      
      // Navigate after everything is set
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login fehlgeschlagen';
      
      if (error.response) {
        // Server hat mit Fehler geantwortet
        if (error.response.status === 429) {
          errorMessage = 'Zu viele Anfragen. Bitte warte kurz und versuche es erneut.';
        } else if (error.response.status === 401) {
          errorMessage = error.response.data?.error || 'E-Mail oder Passwort ungültig';
        } else {
          errorMessage = error.response.data?.error || errorMessage;
        }
      } else if (error.request) {
        // Request wurde gesendet, aber keine Antwort erhalten
        errorMessage = 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.';
      }
      
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300"
    >
      {/* Back to Home Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 p-2 rounded-lg bg-white/80 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-red-500 hover:text-white dark:hover:bg-red-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 backdrop-blur-lg flex items-center gap-2 px-4"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline text-sm font-medium">Zurück</span>
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-2 rounded-lg bg-white/80 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 backdrop-blur-lg"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun size={20} className="animate-spin" style={{animationDuration: '0.5s', animationIterationCount: '1'}} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-400 dark:to-accent-dark-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 hover:rotate-3">
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FlowJournal</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Willkommen zurück!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Melde dich an, um fortzufahren
            </p>
          </div>

          {/* Login Form */}
          <div>
            {/* Social Login Buttons */}
            <div className="mb-6">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                type="button"
                onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200 group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">Mit Google anmelden</span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Oder mit E-Mail
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-Mail
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-accent-dark-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full pl-11 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-dark-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="deine@email.com"
                    autoComplete="email"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passwort
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-accent-dark-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full pl-11 pr-11 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-dark-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary mt-6 relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Lädt...
                    </>
                  ) : (
                    <>
                      Anmelden
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Register Link */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Noch nicht registriert?{' '}
                <Link 
                  to="/register" 
                  className="text-primary-600 dark:text-accent-dark-400 hover:text-primary-700 dark:hover:text-accent-dark-300 font-semibold transition-colors duration-200 inline-flex items-center gap-1 group"
                >
                  Account erstellen
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-accent-dark-700 dark:via-accent-dark-800 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Animated Shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16 text-white">
          <div className="max-w-md text-center">
            {/* Icon/Illustration */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 animate-float hover:scale-110 transition-transform duration-300">
                <TrendingUp size={40} className="text-white" />
              </div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 animate-float hover:scale-110 transition-transform duration-300" style={{animationDelay: '0.2s'}}>
                <BarChart3 size={32} className="text-white" />
              </div>
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 animate-float hover:scale-110 transition-transform duration-300" style={{animationDelay: '0.4s'}}>
                <Target size={36} className="text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Verfolge deine Trading-Performance
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Detaillierte Analytics, Psychologie-Tracking und Performance-Insights für erfolgreiches Trading.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-sm text-white/70">Trades</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm text-white/70">Trader</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold mb-1">95%</div>
                <div className="text-sm text-white/70">Zufrieden</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}