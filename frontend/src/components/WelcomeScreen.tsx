import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Award, Target } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

interface WelcomeScreenProps {
  userName: string;
  onComplete: () => void;
}

export default function WelcomeScreen({ userName, onComplete }: WelcomeScreenProps) {
  const { theme } = useThemeStore();
  const [showElements, setShowElements] = useState(false);
  const [playSound, setPlaySound] = useState(true);

  useEffect(() => {
    // Play sound effect
    if (playSound) {
      const audio = new Audio('/sounds/welcome.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback wenn kein Sound verfügbar
        console.log('Sound konnte nicht abgespielt werden');
      });
      setPlaySound(false);
    }

    // Show elements after initial animation
    const timer1 = setTimeout(() => setShowElements(true), 800);

    // Auto-complete after 3.5 seconds
    const timer2 = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div
        className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }`}
      >
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'
            }`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Icon Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          className="mb-8 flex justify-center"
        >
          <div
            className={`relative p-8 rounded-full ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            } shadow-2xl`}
          >
            <TrendingUp className="w-16 h-16 text-white" />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.4)',
                  '0 0 60px rgba(168, 85, 247, 0.8)',
                  '0 0 20px rgba(168, 85, 247, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1
            className={`text-6xl font-bold mb-4 ${
              theme === 'dark'
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
          >
            Welcome Back!
          </h1>
        </motion.div>

        {/* User Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2
            className={`text-4xl font-semibold mb-8 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {userName}
          </h2>
        </motion.div>

        {/* Feature Icons */}
        {showElements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-8 mt-8"
          >
            {[
              { icon: Sparkles, delay: 0 },
              { icon: Award, delay: 0.1 },
              { icon: Target, delay: 0.2 },
            ].map(({ icon: Icon, delay }, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay,
                  type: 'spring',
                  stiffness: 200,
                }}
                className={`p-4 rounded-full ${
                  theme === 'dark'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-purple-500/20 text-purple-700'
                }`}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading bar */}
        <motion.div
          className="mt-12 mx-auto w-64 h-1 bg-gray-700/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className={`h-full ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </div>
  );
}
