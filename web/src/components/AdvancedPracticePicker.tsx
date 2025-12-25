import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, MessageSquare, Calculator, Compass, X, HelpCircle } from 'lucide-react';

// Type definitions
type QuestionTypeId = 'visualAnalogy' | 'verbalAnalogy' | 'quantitative' | 'directions';

interface QuestionType {
  id: QuestionTypeId;
  label: string;
  icon: typeof Shapes;
  help: string;
  backendId: string;
}

interface AdvancedPracticePickerProps {
  onSelect: (type: QuestionTypeId) => void;
  defaultType?: QuestionTypeId;
  loading?: boolean;
  onBack?: () => void;
}

// Question types configuration
const QUESTION_TYPES: QuestionType[] = [
  {
    id: 'visualAnalogy',
    label: 'אנלוגיה צורנית',
    icon: Shapes,
    help: 'זיהוי קשרים בין צורות, דפוסים ותכונות חזותיות.',
    backendId: 'SHAPE_ANALOGY'
  },
  {
    id: 'verbalAnalogy',
    label: 'אנלוגיה מילולית',
    icon: MessageSquare,
    help: 'הבנת יחסים בין מילים ומושגים בשפה.',
    backendId: 'VERBAL_ANALOGY'
  },
  {
    id: 'quantitative',
    label: 'חשיבה כמותית',
    icon: Calculator,
    help: 'פתרון בעיות בעזרת מספרים, גרפים ויחסים.',
    backendId: 'QUANTITATIVE'
  },
  {
    id: 'directions',
    label: 'הוראות וכיוונים',
    icon: Compass,
    help: 'קריאה ופיענוח של הוראות, מפות וכיווני פעולה.',
    backendId: 'INSTRUCTIONS_DIRECTIONS'
  }
];

// Local storage key
const STORAGE_KEY = 'tzav-rishon-last-practice-type';

// Confetti particle component
const ConfettiParticle: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const colors = ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, x, y }}
      animate={{
        opacity: 0,
        scale: 0,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
      }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ backgroundColor: color }}
    />
  );
};

// Main component
export const AdvancedPracticePicker: React.FC<AdvancedPracticePickerProps> = ({
  onSelect,
  defaultType,
  loading = false,
  onBack,
}) => {
  const [selectedType, setSelectedType] = useState<QuestionTypeId | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  const [isProceeding, setIsProceeding] = useState(false);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load last selection from localStorage
  useEffect(() => {
    if (defaultType) {
      setSelectedType(defaultType);
      return;
    }
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && QUESTION_TYPES.some(t => t.id === saved)) {
        setSelectedType(saved as QuestionTypeId);
      }
    } catch (e) {
      console.warn('Failed to load saved selection:', e);
    }
  }, [defaultType]);

  // Save selection to localStorage
  useEffect(() => {
    if (selectedType) {
      try {
        localStorage.setItem(STORAGE_KEY, selectedType);
      } catch (e) {
        console.warn('Failed to save selection:', e);
      }
    }
  }, [selectedType]);

  const handleCardClick = (typeId: QuestionTypeId, event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;

    // Reset keyboard navigation flag on mouse click
    setIsKeyboardNavigation(false);

    setSelectedType(typeId);

    // Show confetti at click position
    if (!prefersReducedMotion) {
      const rect = event.currentTarget.getBoundingClientRect();
      setConfettiOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };

  const handleProceed = () => {
    if (!selectedType || loading || isProceeding) return;
    
    setIsProceeding(true);
    
    // Add shimmer animation delay
    setTimeout(() => {
      onSelect(selectedType);
    }, 400);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (loading) return;

    const { key } = event;

    // Mark that keyboard navigation is being used
    setIsKeyboardNavigation(true);

    switch (key) {
      case 'ArrowRight': // In RTL, ArrowRight moves to previous
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : QUESTION_TYPES.length - 1));
        break;
      case 'ArrowLeft': // In RTL, ArrowLeft moves to next
        event.preventDefault();
        setFocusedIndex((prev) => (prev < QUESTION_TYPES.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev >= 2 ? prev - 2 : prev));
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev < 2 ? prev + 2 : prev));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setSelectedType(QUESTION_TYPES[focusedIndex].id);
        break;
      case 'Tab':
        // Tab key also indicates keyboard navigation
        setIsKeyboardNavigation(true);
        break;
    }
  };

  // Update focus when focusedIndex changes (roving tabIndex pattern)
  // Only programmatically focus if keyboard navigation is being used
  useEffect(() => {
    if (isKeyboardNavigation) {
      cardRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isKeyboardNavigation]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        when: 'beforeChildren',
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 },
    },
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 relative overflow-hidden flex items-center justify-center"
      dir="rtl"
    >
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Step indicator - hidden after type selection */}
        <AnimatePresence>
          {!selectedType && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }
              }}
              className="mb-8 overflow-hidden"
            >
              <div className="text-white/60 text-sm">
                <span>שלב 1/3</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div id="picker-header" className="text-center mb-12">
          <motion.h1
            variants={cardVariants}
            className="text-fluid-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            בחר סוג שאלה
          </motion.h1>
          <motion.h2
            variants={cardVariants}
            className="text-fluid-lg sm:text-xl text-white/70 font-light"
          >
            מסך תרגול מתקדם—בחרו קטגוריה והתחילו
          </motion.h2>
        </div>

        {/* Cards grid - roving tabIndex radio group */}
        <div
          role="radiogroup"
          aria-label="בחר סוג שאלה"
          aria-describedby="picker-header"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12"
        >
          {QUESTION_TYPES.map((type, index) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            const isFocused = focusedIndex === index;

            return (
              <motion.button
                key={`category-${type.id}`}
                ref={(el) => (cardRefs.current[index] = el)}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${type.label}: ${type.help}`}
                tabIndex={isFocused ? 0 : -1}
                data-type-id={type.id}
                variants={cardVariants}
                onClick={(e) => handleCardClick(type.id, e)}
                disabled={loading}
                whileHover={!prefersReducedMotion && !loading ? {
                  scale: 1.02,
                  y: -4,
                  rotateX: 2,
                  rotateY: -2,
                } : {}}
                whileTap={!prefersReducedMotion && !loading ? { scale: 0.98 } : {}}
                className={`
                  group relative p-8 rounded-2xl backdrop-blur-lg
                  transition-all duration-300 perspective-1000
                  ${isSelected
                    ? 'bg-white/20 border-2 border-primary-400 shadow-2xl shadow-primary-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                  ${isFocused && isKeyboardNavigation ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-transparent' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-right
                `}
              >
                {/* Gradient ring on hover */}
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 blur-xl -z-10
                  ${isSelected ? 'opacity-100' : ''}
                `} />

                {/* Icon badge */}
                <div className={`
                  inline-flex items-center justify-center w-20 h-20 rounded-full mb-6
                  ${isSelected
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg shadow-primary-500/50'
                    : 'bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10'
                  }
                  transition-all duration-300
                `}>
                  <Icon 
                    size={40} 
                    className={`${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'} transition-colors duration-300`}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Label */}
                <h3 className="text-fluid-xl sm:text-2xl font-semibold text-white mb-3">
                  {type.label}
                </h3>

                {/* Helper text (shown on hover/focus) */}
                <p className={`
                  text-fluid-sm text-white/60 leading-relaxed
                  transition-all duration-300
                  ${(isFocused || isSelected) ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 sm:group-hover:opacity-100 sm:group-hover:max-h-20'}
                `}>
                  {type.help}
                </p>

                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Action buttons */}
        <motion.div
          variants={cardVariants}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                disabled={loading || isProceeding}
                className="px-6 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                חזרה
              </button>
            )}
            
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="עזרה - הסבר על סוגי השאלות"
            >
              <HelpCircle size={20} />
              <span>עזרה</span>
            </button>
          </div>

          <motion.button
            onClick={handleProceed}
            disabled={!selectedType || loading || isProceeding}
            whileHover={!prefersReducedMotion && selectedType && !loading && !isProceeding ? { scale: 1.02 } : {}}
            whileTap={!prefersReducedMotion && selectedType && !loading && !isProceeding ? { scale: 0.98 } : {}}
            className={`
              relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden
              transition-all duration-300 min-w-[200px]
              ${selectedType && !loading && !isProceeding
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
              }
            `}
          >
            {/* Shimmer effect */}
            {isProceeding && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            )}
            <span className="relative z-10">
              {loading || isProceeding ? 'טוען...' : 'המשך'}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 12 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                x={confettiOrigin.x}
                y={confettiOrigin.y}
                delay={i * 0.02}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Help modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">מידע על סוגי השאלות</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="סגור"
                >
                  <X size={24} className="text-white/70" />
                </button>
              </div>
              
              <div className="space-y-6">
                {QUESTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <Icon size={24} className="text-primary-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{type.label}</h4>
                        <p className="text-white/60 leading-relaxed">{type.help}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-8 w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all duration-200"
              >
                הבנתי
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedPracticePicker;

