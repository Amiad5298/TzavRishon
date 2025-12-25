import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shapes,
  MessageSquare,
  Calculator,
  Compass,
  Users,
  BarChart3,
  Infinity as InfinityIcon,
  Lock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import { practiceApi } from '@/api';

const NewHome: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Map friendly IDs to backend IDs
  const typeMapping: Record<string, string> = {
    'visualAnalogy': 'SHAPE_ANALOGY',
    'verbalAnalogy': 'VERBAL_ANALOGY',
    'quantitative': 'QUANTITATIVE',
    'directions': 'INSTRUCTIONS_DIRECTIONS',
  };

  // Category cards
  const categories = [
    {
      id: 'visualAnalogy',
      icon: Shapes,
      label: 'אנלוגיה צורנית',
      help: 'זיהוי קשרים בין צורות ודפוסים',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'verbalAnalogy',
      icon: MessageSquare,
      label: 'אנלוגיה מילולית',
      help: 'הבנת יחסים בין מילים',
      color: 'from-violet-500 to-pink-600',
    },
    {
      id: 'quantitative',
      icon: Calculator,
      label: 'חשיבה כמותית',
      help: 'פתרון בעיות במספרים',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'directions',
      icon: Compass,
      label: 'הוראות וכיוונים',
      help: 'פענוח הוראות ומפות',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  // Gated content cards with routing
  const gatedFeatures = [
    {
      id: 'full-exams',
      title: 'מבחנים מלאים',
      description: 'מבחנים מלאים עם תזמון אמיתי ומעקב תוצאות',
      icon: Target,
      route: '/exam',
    },
    {
      id: 'question-bank',
      title: 'מאגר שאלות מתקדם',
      description: 'גישה למאות שאלות נוספות בכל הקטגוריות',
      icon: Sparkles,
      route: '/question-bank',
    },
    {
      id: 'stats-dashboard',
      title: 'סטטיסטיקות מעקב',
      description: 'ניתוח מעמיק של הביצועים והתקדמות',
      icon: BarChart3,
      route: '/progress',
    },
    {
      id: 'learning-plan',
      title: 'תוכנית למידה אישית',
      description: 'המלצות מותאמות אישית על סמך הביצועים שלך',
      icon: TrendingUp,
      route: '/learning-plan',
    },
  ];

  const handleCategoryClick = async (categoryId?: string) => {
    if (categoryId) {
      // Start the practice session on the homepage, then navigate with session data
      setIsStartingSession(true);
      setSessionError(null);

      try {
        // Map frontend ID to backend ID
        const backendType = typeMapping[categoryId] || categoryId;

        // Start the practice session
        const response = await practiceApi.start(backendType);

        if (response.data.limitReached) {
          setSessionError('הגעת למגבלת התרגול היומית. התחבר כדי לתרגל ללא הגבלה.');
          setIsStartingSession(false);
          return;
        }

        // Get the questions for the session
        const questionsResponse = await practiceApi.getQuestions(response.data.sessionId);

        // Navigate to practice page with session data in state
        navigate('/practice', {
          state: {
            sessionId: response.data.sessionId,
            questions: questionsResponse.data,
            questionType: categoryId,
          }
        });
      } catch (err: any) {
        setSessionError(err.response?.data?.message || 'שגיאה בטעינת השאלות. נסה שוב.');
        setIsStartingSession(false);
      }
    } else {
      // Navigate to practice page without parameters (shows picker)
      navigate('/practice');
    }
  };

  const handleLockedClick = (cardId: string, route: string) => {
    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'gated_card_click', {
        card_id: cardId,
        is_authenticated: isAuthenticated,
        intended_route: route,
      });
    }

    if (!isAuthenticated) {
      // Open modal for non-authenticated users
      setIsLoginModalOpen(true);
    } else {
      // Navigate to the specific feature if authenticated
      navigate(route);
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
    <div className="relative" dir="rtl">
      {/* Loading Overlay */}
      {isStartingSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
              <p className="text-white text-lg font-semibold">מכין את התרגול שלך...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {sessionError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-500/90 backdrop-blur-xl rounded-2xl p-4 border border-red-400/50 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-white font-semibold">{sessionError}</p>
              </div>
              <button
                onClick={() => setSessionError(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content - background is now provided by Layout */}
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
            style={{ fontFamily: 'Heebo, Rubik, system-ui, sans-serif' }}
          >
            צו ראשון פלוס. תרגול חכם. תוצאות מהר.
          </motion.h1>

          {/* Features Card */}
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-xl rounded-[24px] border border-white/10 p-10 text-center shadow-2xl mb-10"
          >
            <div className="flex flex-wrap items-center justify-center gap-10 text-white/70">
              <div className="flex items-center gap-3">
                <CheckCircle size={22} className="text-accent-500" strokeWidth={2} />
                <span className="font-medium">גישה ללא הגבלה</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={22} className="text-accent-500" strokeWidth={2} />
                <span className="font-medium">התקדמות בזמן אמת</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={22} className="text-accent-500" strokeWidth={2} />
                <span className="font-medium">דוחות חכמים</span>
              </div>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-lg sm:text-xl lg:text-2xl text-white/70 font-light mb-10 leading-relaxed max-w-3xl mx-auto"
          >
            מסך תרגול מתקדם שמותאם אליך — בחרו קטגוריה וצאו לדרך
          </motion.h2>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={() => handleCategoryClick()}
              whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
              className="px-10 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary-600/40 hover:shadow-accent-600/60 transition-all duration-300 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <span>התחל לתרגל</span>
              <ArrowRight size={22} strokeWidth={2.5} />
            </motion.button>

            {/* Secondary CTA: Only show when NOT authenticated */}
            {!isAuthenticated && (
              <motion.button
                onClick={() => setIsLoginModalOpen(true)}
                whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
                whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                className="px-10 py-4 bg-white/5 backdrop-blur-lg text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                התנסות חינם
              </motion.button>
            )}
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-8 text-white/50 text-sm"
          >
            <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
              <Users size={18} strokeWidth={1.5} />
              <span>אלפי מתרגלים</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
              <BarChart3 size={18} strokeWidth={1.5} />
              <span>סטטיסטיקות מתקדמות</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
              <InfinityIcon size={18} strokeWidth={1.5} />
              <span>מבחנים ללא הגבלה</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Category Teaser */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 sm:py-20"
      >
        <motion.h3
          variants={itemVariants}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-white text-center mb-3 tracking-tight"
        >
          התחילו לתרגל עכשיו
        </motion.h3>
        <motion.p
          variants={itemVariants}
          className="text-white/50 text-center mb-12 text-base sm:text-lg"
        >
          בחרו קטגוריה והתחילו לתרגל ללא הרשמה
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                variants={itemVariants}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={!prefersReducedMotion ? {
                  scale: 1.03,
                  y: -6,
                } : {}}
                whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                className="group relative p-7 bg-white/[0.03] backdrop-blur-xl rounded-[18px] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 text-right focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-2xl hover:shadow-primary-600/20"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${category.color} blur-2xl -z-10`} />

                {/* Icon badge */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-gradient-to-br ${category.color} shadow-xl shadow-primary-600/30 group-hover:shadow-2xl group-hover:shadow-primary-600/50 transition-shadow duration-300`}>
                  <Icon size={30} className="text-white" strokeWidth={2} />
                </div>

                {/* Label */}
                <h4 className="text-lg font-bold text-white mb-2 tracking-tight">
                  {category.label}
                </h4>

                {/* Helper text */}
                <p className="text-white/50 text-sm leading-relaxed">
                  {category.help}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Gated Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 sm:py-20"
      >
        <motion.h3
          variants={itemVariants}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-white text-center mb-3 tracking-tight"
        >
          עוד יותר עם חשבון
        </motion.h3>
        <motion.p
          variants={itemVariants}
          className="text-white/50 text-center mb-12 text-base sm:text-lg"
        >
          הירשמו וקבלו גישה למבחנים מלאים וסטטיסטיקות מתקדמות
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {gatedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isLocked = !isAuthenticated;

            return (
              <motion.button
                key={feature.id}
                variants={itemVariants}
                onClick={() => handleLockedClick(feature.id, feature.route)}
                whileHover={!prefersReducedMotion && isLocked ? {
                  scale: 1.01,
                } : !prefersReducedMotion ? { scale: 1.03, y: -6 } : {}}
                disabled={false}
                aria-disabled={isLocked}
                aria-describedby={isLocked ? `locked-tooltip-${index}` : undefined}
                className={`group relative p-7 rounded-[18px] border transition-all duration-300 text-right focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg ${
                  isLocked
                    ? 'bg-white/[0.02] backdrop-blur-xl border-white/10 cursor-not-allowed'
                    : 'bg-white/[0.06] backdrop-blur-xl border-white/20 hover:bg-white/[0.10] hover:border-white/30 hover:shadow-2xl hover:shadow-primary-600/20 cursor-pointer'
                }`}
                role="button"
                tabIndex={0}
              >
                {/* Locked overlay */}
                {isLocked && (
                  <>
                    {/* Blur overlay */}
                    <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30 rounded-[18px] z-10" />

                    {/* Animated sheen */}
                    <div
                      className="absolute inset-0 rounded-[18px] overflow-hidden z-10"
                      style={{
                        background: 'linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%)',
                        backgroundSize: '400% 100%',
                        animation: prefersReducedMotion ? 'none' : 'shimmer 3s linear infinite',
                      }}
                    />

                    {/* Lock badge */}
                    <motion.div
                      animate={!prefersReducedMotion ? {
                        scale: [1, 1.08, 1],
                      } : {}}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute top-4 left-4 w-11 h-11 bg-white/5 backdrop-blur-lg rounded-xl flex items-center justify-center z-20 border border-white/20 shadow-lg"
                    >
                      <Lock size={18} className="text-white/70" strokeWidth={2} />
                    </motion.div>

                    {/* Tooltip */}
                    <span
                      id={`locked-tooltip-${index}`}
                      className="sr-only"
                    >
                      זמין לאחר הרשמה
                    </span>
                  </>
                )}

                {/* Icon */}
                <div className={`relative z-0 inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-gradient-to-br from-primary-600/15 to-accent-600/15 ${
                  !isLocked && 'group-hover:from-primary-600/25 group-hover:to-accent-600/25'
                } transition-all shadow-lg ${!isLocked && 'group-hover:shadow-xl group-hover:shadow-primary-600/30'}`}>
                  <Icon size={30} className={isLocked ? 'text-primary-400/60' : 'text-primary-400'} strokeWidth={2} />
                </div>

                {/* Title */}
                <h4 className="relative z-0 text-lg font-bold text-white mb-2 tracking-tight">
                  {feature.title}
                </h4>

                {/* Description */}
                <p className="relative z-0 text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* SEO Informational Section - About Tzav Rishon */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 sm:py-20"
      >
        <motion.div
          variants={itemVariants}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight text-center">
              למה חשוב להתכונן לצו ראשון?
            </h2>

            <div className="space-y-6 text-white/80 text-lg leading-relaxed">
              <p>
                <strong className="text-white">צו ראשון</strong> הוא המפגש הראשון והמכריע שלכם עם צה"ל - יום המיונים שקובע את עתידכם הצבאי.
                ביום זה תעברו סדרה של מבחנים ומיונים, כאשר המבחן הפסיכוטכני הוא הגורם המשפיעי ביותר על <strong className="text-white">ציון הדפ"ר</strong> שלכם.
              </p>

              <p>
                <strong className="text-white">הכנה נכונה לצו ראשון</strong> יכולה לעשות את ההבדל בין שירות משמעותי ביחידה מבוקשת לבין שירות רגיל.
                ציון דפ"ר גבוה פותח דלתות לקורסים מתקדמים, יחידות איכות, ותפקידים מעניינים שישפיעו על כל חייכם המקצועיים.
              </p>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-8 mb-4">
                הכנה לצו ראשון בחינם - איך מתחילים?
              </h3>

              <p>
                הפלטפורמה שלנו מציעה <strong className="text-white">הכנה לצו ראשון בחינם</strong> עם מאות שאלות תרגול במגוון קטגוריות:
              </p>

              <ul className="list-disc list-inside space-y-3 mr-4">
                <li><strong className="text-white">חשיבה כמותית</strong> - שאלות מתמטיקה ופתרון בעיות מילוליות</li>
                <li><strong className="text-white">חשיבה מילולית</strong> - הבנת הנקרא, אנלוגיות ומשפטים</li>
                <li><strong className="text-white">אנגלית</strong> - הבנת הנקרא ואוצר מילים</li>
                <li><strong className="text-white">חשיבה ויזואלית</strong> - דפוסים וצורות גיאומטריות</li>
              </ul>

              <p>
                תרגול קבוע ומתמיד הוא המפתח להצלחה. מחקרים מראים שמתגייסים שהתכוננו באופן שיטתי משיגים ציוני דפ"ר גבוהים יותר ב-15-20 נקודות בממוצע.
                התחילו את ההכנה שלכם היום - <strong className="text-white">ללא עלות, ללא התחייבות</strong>, עם מערכת תרגול חכמה שמתאימה את עצמה לרמה שלכם.
              </p>

              <div className="mt-8 p-6 bg-accent-500/10 border border-accent-500/30 rounded-2xl">
                <p className="text-accent-400 font-semibold text-center">
                  💡 טיפ חשוב: התחילו את ההכנה לפחות חודש לפני יום הצו הראשון כדי לראות שיפור משמעותי בביצועים
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer CTA */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container mx-auto px-4 py-20 pb-32"
      >
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto text-center"
        >
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
            מוכנים להתחיל?
          </h3>
          <p className="text-white/50 mb-10 text-lg sm:text-xl leading-relaxed">
            הצטרפו לאלפי מתרגלים שכבר משתפרים כל יום
          </p>
          <motion.button
            onClick={() => handleCategoryClick()}
            whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
            whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
            className="px-14 py-5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary-600/50 hover:shadow-accent-600/60 transition-all duration-300 inline-flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            <span>התחילו עכשיו</span>
            <ArrowRight size={26} strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Footer content */}
            <div className="text-center">
              <p className="text-white/30 text-sm mb-4">
                © {new Date().getFullYear()} צו ראשון. כל הזכויות שמורות.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-white/20">
                <a href="#" className="hover:text-white/40 transition-colors">מדיניות פרטיות</a>
                <a href="#" className="hover:text-white/40 transition-colors">תנאי שימוש</a>
                <a href="#" className="hover:text-white/40 transition-colors">יצירת קשר</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default NewHome;

