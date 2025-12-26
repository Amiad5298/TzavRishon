'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Filter, Tag, Search, ArrowRight } from 'lucide-react';

const QuestionBank: React.FC = () => {
  const router = useRouter();
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Coming Soon Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/20 border border-accent-500/40 rounded-full text-accent-300 text-sm font-semibold backdrop-blur-sm">
              <Sparkles size={16} />
              <span>בקרוב</span>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl font-bold text-white mb-6">
            מאגר שאלות מתקדם
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-white/70 mb-12">
            גישה למאות שאלות נוספות עם סינון לפי קושי, נושא ותגיות
          </motion.p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Search, title: 'חיפוש חכם', desc: 'מצאו שאלות לפי מילות מפתח' },
              { icon: Filter, title: 'סינון מתקדם', desc: 'לפי קושי, סוג ונושא' },
              { icon: Tag, title: 'תגיות', desc: 'ארגון לפי תחומי ידע' },
              { icon: Sparkles, title: 'שאלות חדשות', desc: 'תכנים מתעדכנים באופן שוטף' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
                >
                  <Icon size={32} className="text-primary-400 mx-auto mb-3" strokeWidth={1.5 as unknown as number} />
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.button
            variants={itemVariants}
            onClick={() => router.push('/')}
            whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
            whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            <span>חזרה לדף הבית</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionBank;

