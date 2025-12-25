import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Layout: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle scroll for header background intensification
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-deep via-primary-950 to-background-dark relative overflow-x-hidden" dir="rtl">
      {/* Global unified background layers */}
      <div className="fixed inset-0 -z-10">
        {/* Animated gradient blobs */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(109, 103, 228, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(0, 194, 168, 0.25) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(139, 122, 255, 0.2) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
            animation: prefersReducedMotion ? 'none' : 'gradient-slow 30s ease infinite',
          }}
        />
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Glass Header - Sticky with scroll-aware background */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background-deep/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5' 
            : 'bg-transparent backdrop-blur-sm'
        }`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Brand/Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg px-2"
            >
              <Home size={24} className="text-primary-500" />
              <span className="hidden sm:inline">{t('app.title')}</span>
            </Link>

            {/* Right side: Sound + Auth */}
            <div className="flex items-center gap-3">
              {/* Auth Button/Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    aria-label="תפריט משתמש"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary-600/20 to-accent-600/20 border border-white/20 hover:border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.displayName || 'משתמש'} 
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white/90" />
                    )}
                    <span className="hidden sm:inline text-sm font-medium text-white/90">
                      {user?.displayName || 'משתמש'}
                    </span>
                  </button>

                  {/* User dropdown menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-48 bg-background-muted/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white/90 truncate">
                            {user?.displayName}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-right text-sm text-white/80 hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/5"
                        >
                          <LogOut size={16} />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full font-semibold text-sm shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Footer (only show on non-home pages or at bottom of home) */}
      {!isHomePage && (
        <footer className="relative z-10 mt-auto py-8 border-t border-white/5">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} {t('app.title')}. כל הזכויות שמורות.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/30">
              <a href="#" className="hover:text-white/50 transition-colors">מדיניות פרטיות</a>
              <a href="#" className="hover:text-white/50 transition-colors">תנאי שימוש</a>
              <a href="#" className="hover:text-white/50 transition-colors">יצירת קשר</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;

