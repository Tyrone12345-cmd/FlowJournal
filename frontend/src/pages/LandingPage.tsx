import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart3, Brain, Target, Users, Zap, CheckCircle2, ArrowRight, Menu, X, Moon, Sun, Play, Award, Clock } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeInfo, setShowThemeInfo] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.fade-in-up, .fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    setShowThemeInfo(true);
    setTimeout(() => setShowThemeInfo(false), 2000);
  };

  const features = [
    {
      icon: BarChart3,
      title: "Detaillierte Analytics",
      description: "Verfolge deine Performance mit präzisen Metriken und Statistiken"
    },
    {
      icon: Brain,
      title: "Psychologie-Tracking",
      description: "Verstehe deine emotionalen Muster und verbessere deine Trading-Disziplin"
    },
    {
      icon: Target,
      title: "Zielbasiertes Trading",
      description: "Setze klare Ziele und verfolge deinen Fortschritt in Echtzeit"
    },
    {
      icon: Zap,
      title: "Schnelle Eingabe",
      description: "Dokumentiere Trades in Sekunden - ohne komplizierte Formulare"
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "Entdecke Muster in deinen profitablen und verlustbringenden Trades"
    },
    {
      icon: Users,
      title: "Community Features",
      description: "Lerne von erfolgreichen Tradern und teile deine Erfahrungen"
    }
  ];

  const benefits = [
    "Unbegrenzte Trade-Einträge",
    "Alle wichtigen Metriken inklusive",
    "Dark Mode & Light Mode",
    "Responsive auf allen Geräten",
    "Datenschutz & Sicherheit",
    "Regelmäßige Updates"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-400 dark:to-accent-dark-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">FlowJournal</span>
            </button>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Vorteile</a>
              {!isAuthenticated && (
                <button onClick={() => navigate("/login")} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Login</button>
              )}
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} className="animate-spin" style={{animationDuration: '0.5s', animationIterationCount: '1'}} /> : <Moon size={20} />}
              </button>
              {isAuthenticated ? (
                <button onClick={() => navigate("/app/dashboard")} className="btn btn-primary">Zum Dashboard</button>
              ) : (
                <button onClick={() => navigate("/register")} className="btn btn-primary">Jetzt Starten</button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-900 dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <a href="#features" className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#benefits" className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Vorteile</a>
              {!isAuthenticated && (
                <button onClick={() => navigate("/login")} className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Login</button>
              )}
              <button 
                onClick={handleThemeToggle}
                className="flex items-center gap-2 w-full text-left p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              {isAuthenticated ? (
                <button onClick={() => navigate("/app/dashboard")} className="btn btn-primary w-full">Zum Dashboard</button>
              ) : (
                <button onClick={() => navigate("/register")} className="btn btn-primary w-full">Jetzt Starten</button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Alles was du über dein Trading<br />
            <span className="text-gray-400">wissen wolltest...</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            FlowJournal zeigt dir die Metriken, die wirklich zählen und die Verhaltensweisen, die zu profitablem Trading führen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate("/register")} 
              className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              Jetzt Starten <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate("/login")} 
              className="btn btn-secondary text-lg px-8 py-4"
            >
              Zum Login
            </button>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-accent-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              So funktioniert FlowJournal
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Sieh selbst, wie einfach Trading-Journaling sein kann
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto fade-in-up">
            {/* Video Placeholder - Hier kannst du dein eigenes Video einbinden */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-950 dark:to-black rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/90 dark:bg-accent-dark-500/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Play size={32} className="text-primary-600 dark:text-gray-900 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center shadow-sm">
                <Clock size={32} className="text-primary-600 dark:text-accent-dark-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">2 Min</div>
                <div className="text-gray-600 dark:text-gray-400">Setup Zeit</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center shadow-sm">
                <Zap size={32} className="text-primary-600 dark:text-accent-dark-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">10 Sek</div>
                <div className="text-gray-600 dark:text-gray-400">Trade Eingabe</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center shadow-sm">
                <Award size={32} className="text-primary-600 dark:text-accent-dark-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Einfach</div>
                <div className="text-gray-600 dark:text-gray-400">Zu bedienen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Alles was du brauchst
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Professionelle Trading-Tools für deine persönliche Entwicklung
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="fade-in-up bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-white dark:text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Warum FlowJournal?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Entwickelt von Tradern für Trader. Wir verstehen die Herausforderungen und bieten die Lösungen.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 size={24} className="text-primary-600 dark:text-accent-dark-500 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate("/register")} 
                className="btn btn-primary text-lg px-8 py-4 mt-8 flex items-center gap-2"
              >
                Jetzt Starten <ArrowRight size={20} />
              </button>
            </div>
            <div className="fade-in-up bg-gradient-to-br from-primary-50 to-primary-100 dark:from-accent-dark-700 dark:to-accent-dark-600 rounded-3xl p-12 text-center">
              <div className="text-6xl font-bold text-primary-700 dark:text-gray-100 mb-4">Trading</div>
              <div className="text-2xl font-semibold text-primary-600 dark:text-gray-200 mb-2">Journal</div>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Für professionelle Trader entwickelt</p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle2 size={20} className="text-primary-600 dark:text-accent-dark-400" />
                  <span>Intuitive Bedienung</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle2 size={20} className="text-primary-600 dark:text-accent-dark-400" />
                  <span>Detaillierte Analytics</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle2 size={20} className="text-primary-600 dark:text-accent-dark-400" />
                  <span>Alle Features verfügbar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bereit dein Trading auf das nächste Level zu bringen?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Starte noch heute und entdecke, was FlowJournal für dich tun kann.
          </p>
          <button 
            onClick={() => navigate("/register")} 
            className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
          >
            Jetzt Starten <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white dark:text-gray-900" />
              </div>
              <span className="text-lg font-bold">FlowJournal</span>
            </div>
            <p className="text-gray-400">© 2026 FlowJournal. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Vorteile</a>
              <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-white transition-colors">Login</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Theme Info Toast */}
      <div 
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 ${
          showThemeInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {theme === 'dark' ? (
          <>
            <Moon size={20} className="text-accent-dark-500" />
            <span className="font-medium text-gray-900 dark:text-white">Dark Mode aktiviert</span>
          </>
        ) : (
          <>
            <Sun size={20} className="text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">Light Mode aktiviert</span>
          </>
        )}
      </div>
    </div>
  );
}
