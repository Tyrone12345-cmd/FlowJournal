import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, LogOut, User, Moon, Sun, Plus, BookOpen, FileText, Book, BarChart3, PlayCircle, RotateCcw, HelpCircle, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import AccountModal from './AccountModal';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [showThemeInfo, setShowThemeInfo] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setShowThemeInfo(true);
    setTimeout(() => setShowThemeInfo(false), 2000);
  };

  const navItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/daily-journal', icon: BookOpen, label: 'Daily Journal', disabled: true },
    { path: '/app/trades', icon: TrendingUp, label: 'Trades' },
    { path: '/app/notebook', icon: Book, label: 'Notebook', disabled: true },
    { path: '/app/reports', icon: FileText, label: 'Reports', badge: 'NEW', disabled: true },
    { path: '/app/playbooks', icon: PlayCircle, label: 'Playbooks', badge: 'NEW', disabled: true },
    { path: '/app/progress', icon: BarChart3, label: 'Progress Tracker', disabled: true },
    { path: '/app/replay', icon: RotateCcw, label: 'Trade Replay', disabled: true },
    { path: '/app/resources', icon: HelpCircle, label: 'Resource Center', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Theme Toggle Button - Top Right */}
      <button
        onClick={handleThemeToggle}
        className="fixed top-6 right-6 p-2 rounded-lg bg-white/80 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 backdrop-blur-lg"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun size={20} className="animate-spin" style={{animationDuration: '0.5s', animationIterationCount: '1'}} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-500 ${isAccountModalOpen ? 'scale-95 opacity-80 blur-sm' : 'scale-100 opacity-100'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-accent-dark-500">FlowJournal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Trading Journal</p>
        </div>

        {/* Add Trade Button */}
        <div className="px-4 mb-4">
          <button 
            onClick={() => navigate('/app/trades/new')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 text-white dark:text-gray-900 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
          >
            <Plus size={20} />
            Add Trade
          </button>
        </div>

        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.disabled) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                >
                  <Icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-accent-dark-900/20 text-primary-700 dark:text-accent-dark-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                }`}
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAccountModalOpen(true);
            }}
            className="w-full flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 flex items-center justify-center">
              <User size={20} className="text-white dark:text-gray-900" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </button>
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-4 py-2 mb-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Home size={16} />
            Zur Homepage
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`ml-64 min-h-screen transition-all duration-500 ${isAccountModalOpen ? 'scale-95 opacity-80 blur-sm' : 'scale-100 opacity-100'}`}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Account Modal */}
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />

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
