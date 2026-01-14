import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowRight, ArrowLeft, Sparkles, Moon, Sun, User, Mail, Lock, Eye, EyeOff, Zap, Clock, Activity, Star, DollarSign, Target, GraduationCap, Rocket } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

const step1Schema = z.object({
  firstName: z.string().min(2, 'Mindestens 2 Zeichen').optional(),
  lastName: z.string().min(2, 'Mindestens 2 Zeichen').optional(),
  email: z.string().email('Ungültige E-Mail').optional(),
  password: z.string().min(8, 'Mindestens 8 Zeichen').optional(),
});

type Step1Form = z.infer<typeof step1Schema>;

interface OnboardingData {
  tradingStyle: string[];
  assets: string[];
  experience: string;
  goals: string[];
  riskTolerance: string;
  timeCommitment: string;
}

const tradingStyles = [
  { id: 'day', label: 'Day Trading', desc: 'Intraday Trades, hohe Frequenz', icon: Zap, color: 'text-yellow-500' },
  { id: 'swing', label: 'Swing Trading', desc: 'Tage bis Wochen', icon: Activity, color: 'text-blue-500' },
  { id: 'position', label: 'Position Trading', desc: 'Wochen bis Monate', icon: TrendingUp, color: 'text-green-500' },
  { id: 'scalping', label: 'Scalping', desc: 'Sekunden bis Minuten', icon: Clock, color: 'text-red-500' },
];

const assetTypes = [
  { id: 'stocks', label: '📈 Aktien', emoji: '📈' },
  { id: 'crypto', label: '₿ Crypto', emoji: '₿' },
  { id: 'forex', label: '💱 Forex', emoji: '💱' },
  { id: 'options', label: '📊 Optionen', emoji: '📊' },
  { id: 'futures', label: '📉 Futures', emoji: '📉' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Anfänger', desc: '< 6 Monate', icon: Star, color: 'text-gray-500' },
  { id: 'intermediate', label: 'Fortgeschritten', desc: '6-24 Monate', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'advanced', label: 'Erfahren', desc: '2-5 Jahre', icon: Target, color: 'text-purple-500' },
  { id: 'expert', label: 'Experte', desc: '> 5 Jahre', icon: Rocket, color: 'text-green-500' },
];

const goals = [
  { id: 'income', label: 'Regelmäßiges Einkommen', icon: DollarSign, color: 'text-green-500' },
  { id: 'wealth', label: 'Vermögensaufbau', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'learn', label: 'Lernen & Verbessern', icon: GraduationCap, color: 'text-purple-500' },
  { id: 'freedom', label: 'Finanzielle Freiheit', icon: Rocket, color: 'text-yellow-500' },
];

export default function OnboardingPage() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const google = searchParams.get('google');
  const restart = searchParams.get('restart');
  const isGoogleUserInitial = !!(token && google === 'true');
  const isRestartMode = restart === 'true';
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleUser] = useState(isGoogleUserInitial);
  const [googleToken] = useState<string>(token || '');
  const [userData, setUserData] = useState<any>(null);
  const [loadingUserData, setLoadingUserData] = useState(isGoogleUserInitial);

  // Initialize onboarding data - load saved data if available
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    // Check if there's saved data in localStorage
    const saved = localStorage.getItem('userProfile');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('[OnboardingPage] Found saved data - loading preferences');
        console.log('  tradingStyle:', parsed.tradingStyle);
        console.log('  assets:', parsed.assets);
        console.log('  experience:', parsed.experience);
        console.log('  goals:', parsed.goals);
        
        const initialData = {
          tradingStyle: Array.isArray(parsed.tradingStyle) ? parsed.tradingStyle : [],
          assets: Array.isArray(parsed.assets) ? parsed.assets : [],
          experience: parsed.experience || '',
          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          riskTolerance: parsed.riskTolerance || 'medium',
          timeCommitment: parsed.timeCommitment || '1-2h',
        };
        
        console.log('[OnboardingPage] Loaded initial data:', initialData);
        return initialData;
      } catch (e) {
        console.error('[OnboardingPage] Failed to parse saved data:', e);
      }
    }
    
    console.log('[OnboardingPage] No saved data - initializing with empty state');
    return {
      tradingStyle: [],
      assets: [],
      experience: '',
      goals: [],
      riskTolerance: 'medium',
      timeCommitment: '1-2h',
    };
  });

  // Log onboardingData whenever it changes (for debugging)
  useEffect(() => {
    console.log('[OnboardingPage] Current state:');
    console.log('  tradingStyle:', JSON.stringify(onboardingData.tradingStyle));
    console.log('  assets:', JSON.stringify(onboardingData.assets));
    console.log('  experience:', onboardingData.experience);
    console.log('  goals:', JSON.stringify(onboardingData.goals));
  }, [onboardingData]);

  // Set initial step after component mounts
  useEffect(() => {
    if (isRestartMode && isAuthenticated()) {
      console.log('[OnboardingPage] Restart mode - starting at step 2');
      setStep(2);
    } else if (isGoogleUserInitial) {
      console.log('[OnboardingPage] Google user - starting at step 2');
      setStep(2);
    }
  }, [isRestartMode, isGoogleUserInitial, isAuthenticated]);

  // Check if user is coming from Google OAuth
  useEffect(() => {
    if (isGoogleUser && googleToken) {
      console.log('Google user detected, loading user data...');
      
      // Fetch user data
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${googleToken}`
        }
      })
      .then(res => {
        console.log('API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('User data loaded:', data);
        setUserData(data);
        setLoadingUserData(false);
      })
      .catch(err => {
        console.error('Failed to fetch user data:', err);
        setLoadingUserData(false);
      });
    }
  }, [isGoogleUser, googleToken]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
  });

  const toggleSelection = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter((item) => item !== value);
    }
    return [...array, value];
  };

  const analyzeProfile = () => {
    setAnalyzing(true);
    // Simuliere KI-Analyse
    setTimeout(() => {
      setAnalyzing(false);
      setStep(7);
    }, 2000);
  };

  const onSubmit = async (data: Step1Form) => {
    setIsLoading(true);
    try {
      // Restart mode - user is already logged in, just update preferences
      if (isRestartMode && isAuthenticated()) {
        const token = localStorage.getItem('token');
        
        // Update user preferences (onboarding data)
        const response = await fetch(`${API_URL}/settings/update-preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            onboardingData
          })
        });

        if (!response.ok) {
          // If API endpoint doesn't exist, just save to localStorage
          localStorage.setItem('userProfile', JSON.stringify(onboardingData));
        } else {
          localStorage.setItem('userProfile', JSON.stringify(onboardingData));
        }
        
        navigate('/app/dashboard');
        return;
      }

      // Google User - complete onboarding
      if (isGoogleUser && googleToken) {
        // Validate password
        if (!data.password || data.password.length < 8) {
          console.error('Bitte setze ein Passwort (mindestens 8 Zeichen)');
          setIsLoading(false);
          return;
        }

        // Complete onboarding with password
        const response = await fetch(`${API_URL}/auth/complete-onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${googleToken}`
          },
          body: JSON.stringify({
            password: data.password,
            firstName: data.firstName || userData?.firstName,
            lastName: data.lastName || userData?.lastName,
            onboardingData
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Onboarding fehlgeschlagen');
        }

        const result = await response.json();
        setAuth(result.user, googleToken);
        localStorage.setItem('userProfile', JSON.stringify(onboardingData));
        navigate('/app/dashboard');
        return;
      }

      // Demo Mode
      if (data.email === 'demo@flow.com' || data.email === 'test@test.com') {
        const demoUser = {
          id: 'demo-user-id',
          email: data.email,
          firstName: data.firstName || 'Demo',
          lastName: data.lastName || 'User',
          role: 'trader' as any,
          createdAt: new Date().toISOString(),
        };
        setAuth(demoUser, 'demo-token');
        
        // Speichere Onboarding-Daten
        localStorage.setItem('userProfile', JSON.stringify(onboardingData));
        
        navigate('/app/dashboard');
        return;
      }

      const response = await authAPI.register({
        email: data.email || '',
        password: data.password || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        // Hier würden die Onboarding-Daten mitgeschickt
      });
      
      // No token in response - email verification required
      if (!response.token && (response as any).message) {
        // Redirect to success page
        navigate('/registration-success', { state: { email: data.email } });
        return;
      }
      
      // Old flow - direct login (if email verification is disabled)
      setAuth(response.user, response.token);
      localStorage.setItem('userProfile', JSON.stringify(onboardingData));
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error(error.response?.data?.error || 'Fehler beim Erstellen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-10">
          Step: {step} | Google: {isGoogleUser ? 'Yes' : 'No'} | Loading: {loadingUserData ? 'Yes' : 'No'}
        </div>
      )}
      
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 left-6 z-10"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-red-500 hover:text-white dark:hover:bg-red-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-red-500"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">
            {step === 1 ? 'Zurück' : 'Zurück zur Homepage'}
          </span>
        </Link>
      </motion.div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun size={20} className="animate-spin" style={{animationDuration: '0.5s', animationIterationCount: '1'}} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <TrendingUp size={32} className="text-white dark:text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">FlowJournal</h1>
          <p className="text-gray-600 dark:text-gray-400">Dein persönliches Trading Journal</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Schritt {step} von 7</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round((step / 7) * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-gray-800 to-gray-900 dark:from-white dark:to-gray-200 transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
          {/* Loading User Data for Google Users */}
          {loadingUserData && (
            <div className="text-center py-12">
              <div className="w-20 h-20 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Lade deine Daten...</h2>
              <p className="text-gray-600 dark:text-gray-400">Einen Moment bitte</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && !isGoogleUser && !loadingUserData && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  Los geht's! 
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="text-primary-500" size={24} />
                  </motion.div>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Erstelle deinen Account und starte deine Trading Journey</p>
              </motion.div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  type="button"
                  onClick={() => window.location.href = `${API_URL.replace('/api', '')}/api/auth/google`}
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
                  <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">Mit Google fortfahren</span>
                </motion.button>


              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">Oder mit E-Mail</span>
                </div>
              </div>

              {/* Email Registration Form */}
              <form onSubmit={handleSubmit(() => setStep(2))} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vorname</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <User size={20} />
                      </div>
                      <input {...register('firstName')} className="input pl-11" placeholder="Max" />
                    </div>
                    {errors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nachname</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <User size={20} />
                      </div>
                      <input {...register('lastName')} className="input pl-11" placeholder="Mustermann" />
                    </div>
                    {errors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">E-Mail</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input {...register('email')} type="email" className="input pl-11" placeholder="deine@email.com" />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Passwort</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input 
                      {...register('password')} 
                      type={showPassword ? 'text' : 'password'} 
                      className="input pl-11 pr-11" 
                      placeholder="••••••••" 
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={showPassword ? 'off' : 'on'}
                          initial={{ rotate: -180, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 180, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
                </motion.div>

                <motion.button 
                  type="submit" 
                  className="btn btn-primary w-full flex items-center justify-center gap-2 relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="relative z-10">Weiter</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </div>
          )}

          {/* Step 2: Trading Style */}
          {step === 2 && !loadingUserData && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Wie tradest du?</h2>
                <p className="text-gray-600 dark:text-gray-400">Wähle deinen Trading-Stil (mehrere möglich)</p>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {tradingStyles.map((style, index) => {
                  const Icon = style.icon;
                  const isSelected = onboardingData.tradingStyle.includes(style.id);
                  return (
                    <motion.button
                      key={style.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() =>
                        setOnboardingData({
                          ...onboardingData,
                          tradingStyle: toggleSelection(onboardingData.tradingStyle, style.id),
                        })
                      }
                      className={`group p-5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-gray-900 dark:border-white bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                      whileHover={{ scale: isSelected ? 1.05 : 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'} transition-colors`}>
                          <Icon size={24} className={`${style.color} transition-transform group-hover:scale-110`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{style.label}</h3>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{style.desc}</p>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <motion.button 
                  onClick={() => setStep(1)} 
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={20} /> Zurück
                </motion.button>
                <button
                  onClick={() => setStep(3)}
                  disabled={onboardingData.tradingStyle.length === 0}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Weiter <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Assets */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Was tradest du?</h2>
                <p className="text-gray-600 dark:text-gray-400">Wähle deine bevorzugten Assets</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {assetTypes.map((asset) => {
                  const isSelected = onboardingData.assets.includes(asset.id);
                  console.log(`[OnboardingPage] Asset ${asset.id}: selected=${isSelected}`, onboardingData.assets);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() =>
                        setOnboardingData({
                          ...onboardingData,
                          assets: toggleSelection(onboardingData.assets, asset.id),
                        })
                      }
                      className={`p-6 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                        isSelected
                          ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-5xl mb-3">{asset.emoji}</div>
                      <p className="font-bold text-gray-900 dark:text-white">{asset.label}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft size={20} /> Zurück
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={onboardingData.assets.length === 0}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Weiter <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Experience Level */}
          {step === 4 && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Deine Erfahrung?</h2>
                <p className="text-gray-600 dark:text-gray-400">Wähle dein aktuelles Erfahrungslevel</p>
              </motion.div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Erfahrungslevel</label>
                <div className="grid grid-cols-2 gap-3">
                  {experienceLevels.map((level, index) => {
                    const Icon = level.icon;
                    const isSelected = onboardingData.experience === level.id;
                    return (
                      <motion.button
                        key={level.id}
                        type="button"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setOnboardingData({ ...onboardingData, experience: level.id })}
                        className={`group p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-gray-900 dark:border-white bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Icon size={20} className={`${level.color} transition-transform group-hover:scale-110`} />
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white flex-1">{level.label}</h3>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-500"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">{level.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button 
                  onClick={() => setStep(3)} 
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={20} /> Zurück
                </motion.button>
                <motion.button
                  onClick={() => setStep(5)}
                  disabled={!onboardingData.experience}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Weiter <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          )}

          {/* Step 5: Goals */}
          {step === 5 && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Deine Ziele?</h2>
                <p className="text-gray-600 dark:text-gray-400">Was möchtest du mit Trading erreichen? (mehrere möglich)</p>
              </motion.div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Deine Ziele (mehrere möglich)</label>
                <div className="grid grid-cols-2 gap-3">
                  {goals.map((goal, index) => {
                    const Icon = goal.icon;
                    const isSelected = onboardingData.goals.includes(goal.id);
                    return (
                      <motion.button
                        key={goal.id}
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() =>
                          setOnboardingData({
                            ...onboardingData,
                            goals: toggleSelection(onboardingData.goals, goal.id),
                          })
                        }
                        className={`group p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-gray-900 dark:border-white bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-3 rounded-lg ${isSelected ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Icon size={28} className={`${goal.color} transition-transform group-hover:scale-110`} />
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-center text-sm">{goal.label}</p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-500"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button 
                  onClick={() => setStep(4)} 
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={20} /> Zurück
                </motion.button>
                <motion.button
                  onClick={() => setStep(6)}
                  disabled={onboardingData.goals.length === 0}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Weiter <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          )}

          {/* Step 6: Theme Selection */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Wie möchtest du arbeiten?</h2>
                <p className="text-gray-600 dark:text-gray-400">Wähle dein bevorzugtes Theme</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-8 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                    theme === 'light'
                      ? 'border-gray-900 bg-gradient-to-br from-white to-gray-50 shadow-xl'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-gray-300 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                    <Sun size={40} className="text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">Light Mode</h3>
                  <p className="text-sm text-gray-600">Hell & klassisch</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-8 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                    theme === 'dark'
                      ? 'border-white bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl'
                      : 'border-gray-200 hover:border-gray-400 bg-gray-50'
                  }`}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                    <Moon size={40} className="text-gray-300" />
                  </div>
                  <h3 className={`font-bold text-xl mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Dark Mode</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Dunkel & modern</p>
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                💡 Du kannst das Theme jederzeit in den Einstellungen ändern
              </p>

              <div className="flex gap-4">
                <button onClick={() => setStep(5)} className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft size={20} /> Zurück
                </button>
                <button
                  onClick={analyzeProfile}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} /> Profil analysieren
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Analysis & Complete */}
          {step === 7 && (
            <div className="space-y-6">
              {analyzing ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">KI analysiert dein Profil...</h2>
                  <p className="text-gray-600 dark:text-gray-400">Wir personalisieren FlowJournal für dich</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Sparkles size={40} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perfekt!</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Dein Journal ist bereit</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">🎯 Deine Personalisierung:</h3>
                    <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✅</span>
                        <span>Dashboard optimiert für <strong className="text-gray-900 dark:text-white">{onboardingData.tradingStyle.join(', ')}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✅</span>
                        <span>Asset-Filter für <strong className="text-gray-900 dark:text-white">{onboardingData.assets.join(', ')}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✅</span>
                        <span>Empfohlene Metriken für <strong className="text-gray-900 dark:text-white">{onboardingData.experience}</strong> Level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✅</span>
                        <span>Goal-Tracking für deine Ziele</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✅</span>
                        <span>Farbschema & Layout angepasst</span>
                      </li>
                    </ul>
                  </div>

                  {/* Google User: Set Password */}
                  {isGoogleUser && !isRestartMode && (
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">🔐 Setze dein Passwort</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Du hast dich mit Google angemeldet. Bitte setze zusätzlich ein Passwort für deinen Account.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Vorname (optional)
                          </label>
                          <input
                            {...register('firstName')}
                            className="input w-full"
                            placeholder={userData?.firstName || 'Vorname'}
                            defaultValue={userData?.firstName || ''}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Nachname (optional)
                          </label>
                          <input
                            {...register('lastName')}
                            className="input w-full"
                            placeholder={userData?.lastName || 'Nachname'}
                            defaultValue={userData?.lastName || ''}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Passwort *
                          </label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock size={20} />
                            </div>
                            <input
                              {...register('password')}
                              type={showPassword ? 'text' : 'password'}
                              className="input w-full pl-11 pr-11"
                              placeholder="Mindestens 8 Zeichen"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.password.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={isRestartMode ? async () => {
                      setIsLoading(true);
                      try {
                        const token = localStorage.getItem('token');
                        
                        // Save to localStorage
                        localStorage.setItem('userProfile', JSON.stringify(onboardingData));
                        
                        // Try to update on server (optional)
                        try {
                          await fetch(`${API_URL}/settings/update-preferences`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ onboardingData })
                          });
                        } catch (err) {
                          // Ignore server errors, localStorage is enough
                          console.log('Server update failed, using localStorage only');
                        }
                        
                        navigate('/app/dashboard');
                      } catch (error) {
                        console.error('Error:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    } : handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="btn btn-primary w-full text-lg py-4"
                  >
                    {isLoading 
                      ? (isRestartMode ? 'Speichere Einstellungen...' : (isGoogleUser ? 'Vervollständige Profil...' : 'Erstelle Account...')) 
                      : (isRestartMode ? 'Einstellungen aktualisieren 🚀' : (isGoogleUser ? 'Profil vervollständigen & loslegen! 🚀' : 'Account erstellen & loslegen! 🚀'))}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Right Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-accent-dark-700 dark:via-accent-dark-800 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Animated Shapes */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16 text-white">
          <div className="max-w-md">
            {/* Icon/Illustration */}
            <motion.div 
              className="mb-8 flex items-center justify-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp size={40} className="text-white" />
              </motion.div>
              <motion.div 
                className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                <Target size={32} className="text-white" />
              </motion.div>
              <motion.div 
                className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              >
                <Rocket size={36} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h2 
              className="text-4xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Werde zum besseren Trader
            </motion.h2>
            <motion.p 
              className="text-lg text-white/80 mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Professionelles Journal mit KI-gestützten Insights und detaillierter Performance-Analyse
            </motion.p>

            {/* Features */}
            <motion.div 
              className="space-y-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { icon: Target, text: 'Präzises Trade-Tracking' },
                { icon: TrendingUp, text: 'Performance-Analytics' },
                { icon: GraduationCap, text: 'Lern-Insights' },
                { icon: Rocket, text: 'Ziel-Management' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="p-3 rounded-lg bg-white/10">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <span className="text-white font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {[
                { value: '10k+', label: 'Trades' },
                { value: '500+', label: 'Trader' },
                { value: '95%', label: 'Zufrieden' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
