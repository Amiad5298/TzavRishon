'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LayoutNext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header - only show on non-home pages */}
      {!isHomePage && (
        <header className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-slate-900/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 text-white hover:text-accent-400 transition-colors">
                <Home size={24} />
                <span className="text-xl font-bold">צו ראשון</span>
              </Link>

              {/* User menu */}
              <div className="flex items-center gap-4">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                    >
                      <User size={20} />
                      <span>{user.email}</span>
                    </button>
                    
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-white/10 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-3 text-right text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                          >
                            <LogOut size={18} />
                            <span>התנתק</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={login}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    התחבר
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default LayoutNext;

