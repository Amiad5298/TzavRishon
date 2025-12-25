import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Infinity as InfinityIcon, BarChart3, Cloud, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'login' | 'signup';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const { login } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus first element
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);

    // Get all focusable elements
    const getFocusableElements = () => {
      return modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(getFocusableElements());
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    login();
  };

  const benefits = [
    {
      icon: InfinityIcon,
      text: 'גישה לא מוגבלת למבחנים',
    },
    {
      icon: BarChart3,
      text: 'סטטיסטיקות מעקב חכמות',
    },
    {
      icon: Cloud,
      text: 'שמירת התקדמות ומעבר בין מכשירים',
    },
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            className="relative w-full max-w-md bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            dir="rtl"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 pointer-events-none" />

            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-accent-400"
              aria-label="סגור"
            >
              <X size={20} className="text-white/70" />
            </button>

            {/* Content */}
            <div className="relative p-8">
              {/* Title */}
              <h2
                id="modal-title"
                className="text-3xl font-bold text-white mb-2 text-center"
              >
                מצטרפים ומקבלים יותר
              </h2>

              <p className="text-white/60 text-center mb-6 text-sm">
                ללא התחייבות, ניתן לבטל בכל רגע
              </p>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
                <button
                  ref={firstFocusableRef}
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400 ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  aria-controls="login-panel"
                >
                  התחברות
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400 ${
                    activeTab === 'signup'
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'signup'}
                  aria-controls="signup-panel"
                >
                  הרשמה
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: prefersReducedMotion ? 0 : index * 0.1,
                        duration: prefersReducedMotion ? 0 : 0.3,
                      }}
                      className="flex items-center gap-3 text-white/80"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <Icon size={20} className="text-primary-400" />
                      </div>
                      <span className="text-sm leading-relaxed">{benefit.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Google Sign In Button */}
              <motion.button
                onClick={handleGoogleLogin}
                whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
                whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                className="w-full py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {activeTab === 'login' ? 'כניסה עם Google' : 'הרשמה עם Google'}
              </motion.button>

              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="w-full py-3 text-white/60 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 rounded-lg"
              >
                ביטול
              </button>

              {/* Trust badge */}
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-white/40 text-xs">
                <CheckCircle size={16} />
                <span>אבטחה מלאה • הצפנת מידע • פרטיות מובטחת</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;

