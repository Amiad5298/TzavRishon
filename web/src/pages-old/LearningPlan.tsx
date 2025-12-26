import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';

const LearningPlan: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const features = [
    {
      icon: Target,
      text: 'אבחון התחלתי מהיר',
      description: 'מבחן קצר שמזהה את רמתך הנוכחית',
    },
    {
      icon: TrendingUp,
      text: 'בניית יעדים חכמים',
      description: 'יעדים מותאמים אישית על בסיס הביצועים שלך',
    },
    {
      icon: Brain,
      text: 'תרגול ממוקד חולשות',
      description: 'תרגילים ממוקדים לשיפור נקודות החולשה',
    },
  ];

  const handleCTAClick = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      // For now, route to exams as a stub
      navigate('/exam');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 relative overflow-hidden" dir="rtl">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20 sm:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          {/* Coming Soon Badge */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/20 border border-accent-500/40 rounded-full text-accent-300 text-sm font-semibold backdrop-blur-sm">
              <Sparkles size={16} />
              <span>בקרוב</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 text-center leading-tight"
          >
            תוכנית למידה אישית
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/70 font-light mb-12 text-center leading-relaxed"
          >
            בקרוב: מסלול מותאם אישית לפי רמתך והביצועים שלך
          </motion.h2>

          {/* Features */}
          <motion.div
            variants={containerVariants}
            className="space-y-6 mb-12"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                      <Icon size={28} className="text-primary-400" strokeWidth={1.5 as unknown as number} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.text}
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-white/40">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* How it works */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-12"
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              איך זה יעבוד?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 font-bold text-lg mb-3">
                  1
                </div>
                <h4 className="text-white font-semibold mb-2">אבחון מהיר</h4>
                <p className="text-white/60 text-sm">
                  מבחן קצר לזיהוי נקודות חוזקה וחולשה
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary-500/20 text-secondary-400 font-bold text-lg mb-3">
                  2
                </div>
                <h4 className="text-white font-semibold mb-2">תוכנית מותאמת</h4>
                <p className="text-white/60 text-sm">
                  יצירת מסלול תרגול אישי על בסיס התוצאות
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-500/20 text-accent-400 font-bold text-lg mb-3">
                  3
                </div>
                <h4 className="text-white font-semibold mb-2">מעקב התקדמות</h4>
                <p className="text-white/60 text-sm">
                  עדכון התוכנית בהתאם לשיפור ולביצועים
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4"
          >
            <motion.button
              onClick={handleCTAClick}
              whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
              className="px-10 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60 transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span>
                {isAuthenticated ? 'התחל אבחון' : 'התחברות / הרשמה'}
              </span>
              <ArrowRight size={20} />
            </motion.button>

            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 rounded-lg px-3 py-2"
            >
              חזרה לדף הבית
            </button>
          </motion.div>

          {/* Feature flag note (visible only in dev) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              variants={itemVariants}
              className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center"
            >
              <p className="text-yellow-200 text-sm">
                <strong>Dev Note:</strong> This is a TBD placeholder. Feature flag: <code>FEATURE_LEARNING_PLAN</code>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default LearningPlan;

