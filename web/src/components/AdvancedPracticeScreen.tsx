import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, MessageSquare, Calculator, Compass, X, HelpCircle, Star, Pause, LogOut, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';

// Type definitions
export type QuestionType = 'visualAnalogy' | 'verbalAnalogy' | 'quantitative' | 'directions';

export interface Choice {
  id: string;             // 'A' | 'B' | 'C' | 'D'
  label?: string;         // text for non-image choices
  imageUrl?: string;      // for visual choices
}

export interface PracticeQuestion {
  id: string;
  type: QuestionType;
  stem: string;           // Hebrew text for the prompt
  assets?: string[];      // optional images for the stem (visual type)
  choices: [Choice, Choice, Choice, Choice]; // ALWAYS four choices
  correctChoiceId?: string;
  explanation?: string;   // shown after submit
  timeLimitSec?: number;
}

type Props = {
  question: PracticeQuestion;
  index: number;                 // current question index (1-based)
  total: number;                 // total in session
  // onSubmit can optionally return a boolean indicating correctness
  onSubmit: (choiceId: string) => Promise<boolean | void> | boolean | void;
  onNext: () => void;
  onExit: () => void;
};

// Type metadata mapping
const TYPE_META: Record<QuestionType, { icon: typeof Shapes; label: string; help: string }> = {
  visualAnalogy:   { icon: Shapes,        label: 'אנלוגיה צורנית',  help: 'זיהוי קשרים בין צורות ודפוסים חזותיים.' },
  verbalAnalogy:   { icon: MessageSquare, label: 'אנלוגיה מילולית', help: 'הבנת יחסים בין מילים ומושגים.' },
  quantitative:    { icon: Calculator,    label: 'חשיבה כמותית',    help: 'פתרון בעיות במספרים ויחסים.' },
  directions:      { icon: Compass,       label: 'הוראות וכיוונים', help: 'פענוח הוראות, מפות וכיוונים.' },
};

// State machine type
type ScreenState = 'idle' | 'selected' | 'submitting' | 'correct' | 'incorrect';

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
        x: x + (Math.random() - 0.5) * 150,
        y: y + (Math.random() - 0.5) * 150,
      }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ backgroundColor: color }}
    />
  );
};

// Main component
export const AdvancedPracticeScreen: React.FC<Props> = ({
  question,
  index,
  total,
  onSubmit,
  onNext,
  onExit,
}) => {
  // Validate choices length
  if (question.choices.length !== 4) {
    throw new Error(`Question ${question.id} must have exactly 4 choices, got ${question.choices.length}`);
  }

  const [state, setState] = useState<ScreenState>('idle');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [markedForReview, setMarkedForReview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState<number | null>(question.timeLimitSec || null);
  const [isPaused, setIsPaused] = useState(false);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const typeMeta = TYPE_META[question.type];
  const Icon = typeMeta.icon;

  // Reset all per-question state when question changes (by stable ID)
  useEffect(() => {
    // Clear selection and submission state
    setSelectedChoice(null);
    setState('idle');
    setShowExplanation(false);
    setMarkedForReview(false);

    // Reset focus to first choice
    setFocusedIndex(0);

    // Reset timer
    setTimeLeft(question.timeLimitSec || null);

    // Reset keyboard navigation flag
    setIsKeyboardNavigation(false);

    // Don't programmatically focus on page load - only focus when keyboard navigation is active
    // This prevents the focus ring from appearing on page load
  }, [question.id]); // Key dependency: only reset when question ID changes

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || isPaused || state === 'submitting' || state === 'correct' || state === 'incorrect') {
      return;
    }

    if (timeLeft <= 0) {
      // Auto-submit with no answer
      handleAutoSubmit();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isPaused, state]);

  const handleAutoSubmit = async () => {
    if (state === 'submitting') return;
    setState('submitting');

    // Submit with current selection or no answer
    const choiceToSubmit = selectedChoice || question.choices[0].id;

    try {
      const result = await onSubmit(choiceToSubmit);
      const isCorrect =
        typeof result === 'boolean'
          ? result
          : choiceToSubmit === question.correctChoiceId;
      setState(isCorrect ? 'correct' : 'incorrect');
    } catch (error) {
      console.error('Submit error:', error);
      setState('idle');
    }
  };

  const handleChoiceClick = (choiceId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== 'idle' && state !== 'selected') return;

    // Reset keyboard navigation flag on mouse click
    setIsKeyboardNavigation(false);

    setSelectedChoice(choiceId);
    setState('selected');

    // Show confetti at click position (only in idle state, not when already selected)
    if (!prefersReducedMotion && state === 'idle') {
      const rect = event.currentTarget.getBoundingClientRect();
      setConfettiOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedChoice || state === 'submitting') return;

    setState('submitting');

    try {
      const result = await onSubmit(selectedChoice);
      const isCorrect =
        typeof result === 'boolean'
          ? result
          : selectedChoice === question.correctChoiceId;
      setState(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect && !prefersReducedMotion) {
        // Show confetti burst for correct answer
        const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        setConfettiOrigin(screenCenter);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setState('selected');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (state === 'submitting') return;

    const { key } = event;

    // Mark that keyboard navigation is being used
    setIsKeyboardNavigation(true);

    // Number keys 1-4 for selection
    if (['1', '2', '3', '4'].includes(key) && (state === 'idle' || state === 'selected')) {
      event.preventDefault();
      const index = parseInt(key) - 1;
      setSelectedChoice(question.choices[index].id);
      setState('selected');
      setFocusedIndex(index);
      return;
    }

    // Arrow key navigation
    switch (key) {
      case 'ArrowRight': // In RTL, ArrowRight moves to previous
        event.preventDefault();
        if (focusedIndex % 2 === 1) {
          setFocusedIndex(focusedIndex - 1);
        }
        break;
      case 'ArrowLeft': // In RTL, ArrowLeft moves to next
        event.preventDefault();
        if (focusedIndex % 2 === 0) {
          setFocusedIndex(focusedIndex + 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (focusedIndex >= 2) {
          setFocusedIndex(focusedIndex - 2);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (focusedIndex < 2) {
          setFocusedIndex(focusedIndex + 2);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (state === 'idle' || state === 'selected') {
          if (!selectedChoice) {
            setSelectedChoice(question.choices[focusedIndex].id);
            setState('selected');
          } else {
            handleSubmitAnswer();
          }
        } else if (state === 'correct' || state === 'incorrect') {
          onNext();
        }
        break;
      case ' ':
        event.preventDefault();
        if (state === 'idle' || state === 'selected') {
          setSelectedChoice(question.choices[focusedIndex].id);
          setState('selected');
        }
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
    // Only update if not in a submitted state (to avoid stealing focus from action buttons)
    // and only if keyboard navigation is active
    if (isKeyboardNavigation && state !== 'correct' && state !== 'incorrect') {
      choiceRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, state, isKeyboardNavigation]);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 },
    },
  };

  const getChoiceState = (choiceId: string): 'idle' | 'selected' | 'correct' | 'incorrect' => {
    if (state === 'idle') return 'idle';

    if ((state === 'selected' || state === 'submitting') && selectedChoice === choiceId) {
      return 'selected';
    }

    if (state === 'correct') {
      // When the answer is correct, highlight the selected choice.
      return selectedChoice === choiceId ? 'correct' : 'idle';
    }

    if (state === 'incorrect') {
      // When the answer is incorrect, highlight the correct answer (if known)
      // and mark the selected choice as incorrect.
      if (question.correctChoiceId && choiceId === question.correctChoiceId) {
        return 'correct';
      }
      if (selectedChoice === choiceId) {
        return 'incorrect';
      }
      return 'idle';
    }

    return 'idle';
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 relative overflow-hidden"
      dir="rtl"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
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
        className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        {/* Header bar */}
        <motion.div variants={itemVariants} className="mb-6 flex items-center justify-between flex-wrap gap-4">
          {/* Category chip */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
              <Icon size={18} className="text-white" />
            </div>
            <span className="text-white font-medium text-sm">{typeMeta.label}</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className={`font-mono text-lg ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
              aria-label={isPaused ? 'המשך' : 'השהה'}
            >
              <Pause size={20} className="text-white" />
            </button>

            <button
              onClick={onExit}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="יציאה"
            >
              <LogOut size={20} className="text-white" />
            </button>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between text-white/60 text-sm mb-2">
            <span>שאלה {index} מתוך {total}</span>
            <span>{Math.round((index / total) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(index / total) * 100}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
            />
          </div>
        </motion.div>

        {/* Question card - keyed by question.id to force remount on question change */}
        <motion.div
          key={`question-${question.id}`}
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 mb-6 shadow-2xl"
        >
          <h1 className="text-fluid-2xl sm:text-3xl font-bold text-white mb-4 leading-relaxed">
            {question.stem}
          </h1>

          {/* Visual assets for visual analogy */}
          {question.type === 'visualAnalogy' && question.assets && question.assets.length > 0 && (
            <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                {question.assets.map((assetUrl, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={assetUrl}
                      alt={`תמונת שאלה ${idx + 1}`}
                      className="w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-white/60 text-sm">
            {typeMeta.help}
          </p>
        </motion.div>

        {/* Answers grid - keyed by question.id to force remount */}
        <motion.div
          key={`choices-${question.id}`}
          role="radiogroup"
          aria-label="בחר תשובה"
          aria-describedby={`question-${question.id}`}
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {question.choices.map((choice, index) => {
            const choiceState = getChoiceState(choice.id);
            const isFocused = focusedIndex === index;
            const isDisabled = state === 'submitting' || state === 'correct' || state === 'incorrect';

            return (
              <motion.button
                key={`${question.id}-${choice.id}`}
                ref={(el) => (choiceRefs.current[index] = el)}
                role="radio"
                aria-checked={selectedChoice === choice.id}
                aria-label={`תשובה ${choice.id}: ${choice.label || ''}`}
                tabIndex={isFocused ? 0 : -1}
                data-choice-id={choice.id}
                onClick={(e) => !isDisabled && handleChoiceClick(choice.id, e)}
                disabled={isDisabled}
                variants={itemVariants}
                whileHover={!prefersReducedMotion && !isDisabled ? {
                  scale: 1.02,
                  y: -4,
                } : {}}
                whileTap={!prefersReducedMotion && !isDisabled ? { scale: 0.98 } : {}}
                className={`
                  group relative p-6 rounded-2xl backdrop-blur-lg
                  transition-all duration-300 perspective-1000 text-right
                  ${choiceState === 'selected' ? 'bg-white/20 border-2 border-primary-400 shadow-2xl shadow-primary-500/50' :
                    choiceState === 'correct' ? 'bg-green-500/20 border-2 border-green-400 shadow-2xl shadow-green-500/50' :
                    choiceState === 'incorrect' ? 'bg-red-500/20 border-2 border-red-400 shadow-2xl shadow-red-500/50' :
                    'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                  ${isFocused && isKeyboardNavigation ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-transparent' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${choiceState === 'incorrect' && !prefersReducedMotion ? 'animate-shake' : ''}
                `}
                style={{
                  animation: choiceState === 'incorrect' && !prefersReducedMotion ? 'shake 0.5s ease-in-out' : 'none',
                }}
              >
                {/* Choice badge */}
                <div className={`
                  absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                  ${choiceState === 'correct' ? 'bg-green-500 text-white' :
                    choiceState === 'incorrect' ? 'bg-red-500 text-white' :
                    choiceState === 'selected' ? 'bg-primary-500 text-white' :
                    'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                  }
                  transition-all duration-300
                `}>
                  {choice.id}
                </div>

                {/* Content */}
                <div className="mr-14">
                  {choice.imageUrl ? (
                    <img
                      src={choice.imageUrl}
                      alt={`תשובה ${choice.id}`}
                      className="w-full h-32 object-contain rounded-lg"
                    />
                  ) : (
                    <p className="text-white text-lg font-medium leading-relaxed">
                      {choice.label}
                    </p>
                  )}
                </div>

                {/* State indicator */}
                {choiceState === 'correct' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Check size={20} className="text-white" />
                  </motion.div>
                )}
                {choiceState === 'incorrect' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <X size={20} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Explanation panel */}
        <AnimatePresence>
          {(state === 'correct' || state === 'incorrect') && question.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full flex items-center justify-between text-right"
                  aria-expanded={showExplanation}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${state === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {state === 'correct' ? <Check size={20} className="text-white" /> : <AlertCircle size={20} className="text-white" />}
                    </div>
                    <span className="text-white font-semibold text-lg">
                      {state === 'correct' ? 'תשובה נכונה!' : 'תשובה שגויה'}
                    </span>
                  </div>
                  {showExplanation ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
                </button>
                
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <p className="text-white/80 leading-relaxed">
                        {question.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMarkedForReview(!markedForReview)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                markedForReview 
                  ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-400' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              aria-label="סמן לסקירה"
            >
              <Star size={20} className={markedForReview ? 'fill-current' : ''} />
              <span>סמן לסקירה</span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="עזרה"
            >
              <HelpCircle size={20} />
              <span>עזרה</span>
            </button>
          </div>

          <motion.button
            onClick={state === 'correct' || state === 'incorrect' ? onNext : handleSubmitAnswer}
            disabled={!selectedChoice && state !== 'correct' && state !== 'incorrect'}
            whileHover={!prefersReducedMotion && selectedChoice ? { scale: 1.02 } : {}}
            whileTap={!prefersReducedMotion && selectedChoice ? { scale: 0.98 } : {}}
            className={`
              relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden min-w-[200px]
              transition-all duration-300
              ${selectedChoice || state === 'correct' || state === 'incorrect'
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
              }
            `}
          >
            <span className="relative z-10">
              {state === 'submitting' ? 'בודק...' : 
               state === 'correct' || state === 'incorrect' ? 'המשך' : 
               'בדוק תשובה'}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 20 }).map((_, i) => (
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
                <h3 className="text-2xl font-bold text-white">עזרה - {typeMeta.label}</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="סגור"
                >
                  <X size={24} className="text-white/70" />
                </button>
              </div>
              
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>{typeMeta.help}</p>
                
                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-semibold text-white mb-2">טיפים:</h4>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>השתמש במקשי המספרים 1-4 לבחירה מהירה</li>
                    <li>השתמש בחיצים לניווט בין התשובות</li>
                    <li>לחץ Enter כדי לבדוק את התשובה</li>
                    <li>סמן שאלות לסקירה כדי לחזור אליהן מאוחר יותר</li>
                  </ul>
                </div>
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

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center"
          >
            <div className="text-center">
              <Pause size={64} className="text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">מושהה</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all duration-200"
              >
                המשך
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedPracticeScreen;

