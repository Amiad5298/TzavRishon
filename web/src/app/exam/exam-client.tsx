'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, ChevronLeft } from 'lucide-react';
import { examApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Question, ExamSectionInfo } from '@/api/types';
import ExamFocusBar from '@/components/exam/ExamFocusBar';
import ExamSummarySheet from '@/components/exam/ExamSummarySheet';
import ExitConfirmDialog from '@/components/exam/ExitConfirmDialog';

type ExamState = 'start' | 'inProgress' | 'finished';

interface QuestionAnswer {
  questionId: string;
  sectionId: string;
  selectedChoiceId?: string;
  isCorrect: boolean;
  answerTimeMs: number;
  flagged: boolean;
}

interface SectionState {
  sectionId: string;
  type: string;
  orderIndex: number;
  durationSeconds: number;
  startTimestamp: number;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<string, QuestionAnswer>;
  questionStartTimes: Map<string, number>;
  flaggedQuestions: Set<string>;
}

const Exam: React.FC = () => {
  const { user } = useAuth();
  const [examState, setExamState] = useState<ExamState>('start');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [allSections, setAllSections] = useState<ExamSectionInfo[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionState, setSectionState] = useState<SectionState | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAnswers = useRef<QuestionAnswer[]>([]);
  const submittedQuestionIds = useRef<Set<string>>(new Set());

  const currentQuestion = sectionState?.questions[sectionState.currentQuestionIndex];

  // Section label helper
  const getSectionLabel = (type: string) => {
    const labels: Record<string, string> = {
      VERBAL_ANALOGY: 'אנלוגיה מילולית',
      SHAPE_ANALOGY: 'אנלוגיה צורנית',
      INSTRUCTIONS_DIRECTIONS: 'הוראות וכיוונים',
      QUANTITATIVE: 'חשיבה כמותית',
    };
    return labels[type] || type;
  };

  // Start exam
  const handleStart = async () => {
    try {
      setLoading(true);
      const response = await examApi.start();
      setAttemptId(response.data.attemptId);
      
      // Sort sections by order
      const sortedSections = response.data.sections.sort((a, b) => a.orderIndex - b.orderIndex);
      setAllSections(sortedSections);
      
      // Load first section
      await loadSection(response.data.attemptId, 0);
      setExamState('inProgress');
    } catch (error) {
      console.error('Failed to start exam:', error);
      alert('שגיאה בהתחלת המבחן');
    } finally {
      setLoading(false);
    }
  };

  // Load a section
  const loadSection = async (currentAttemptId: string, sectionIndex: number) => {
    try {
      const sectionResponse = await examApi.getCurrentSection(currentAttemptId);
      const now = Date.now();
      
      const newSectionState: SectionState = {
        sectionId: sectionResponse.data.sectionId,
        type: sectionResponse.data.type,
        orderIndex: sectionResponse.data.orderIndex,
        durationSeconds: sectionResponse.data.remainingTimeSeconds,
        startTimestamp: now,
        questions: sectionResponse.data.questions,
        currentQuestionIndex: 0,
        answers: new Map(),
        questionStartTimes: new Map(),
        flaggedQuestions: new Set(),
      };

      // Mark first question start time
      if (newSectionState.questions.length > 0) {
        newSectionState.questionStartTimes.set(newSectionState.questions[0].id, now);
      }

      setSectionState(newSectionState);
      setCurrentSectionIndex(sectionIndex);
    } catch (error) {
      console.error('Failed to load section:', error);
      // If section is expired or finished, try to move to next
      await handleSectionComplete(currentAttemptId, sectionIndex);
    }
  };

  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || !sectionState) return;

    setSectionState(prev => {
      if (!prev) return prev;
      const newState = { ...prev };
      const existingAnswer = newState.answers.get(currentQuestion.id);
      
      if (existingAnswer) {
        // Update existing selection
        newState.answers.set(currentQuestion.id, {
          ...existingAnswer,
          selectedChoiceId: optionId,
        });
      } else {
        // Create new answer placeholder (will be filled on submit)
        newState.answers.set(currentQuestion.id, {
          questionId: currentQuestion.id,
          sectionId: newState.sectionId,
          selectedChoiceId: optionId,
          isCorrect: false,
          answerTimeMs: 0,
          flagged: newState.flaggedQuestions.has(currentQuestion.id),
        });
      }
      
      return newState;
    });
  };

  // Toggle flag
  const handleToggleFlag = () => {
    if (!currentQuestion || !sectionState) return;

    setSectionState(prev => {
      if (!prev) return prev;
      const newState = { ...prev };
      const newFlagged = new Set(newState.flaggedQuestions);
      
      if (newFlagged.has(currentQuestion.id)) {
        newFlagged.delete(currentQuestion.id);
      } else {
        newFlagged.add(currentQuestion.id);
      }
      
      newState.flaggedQuestions = newFlagged;
      
      // Update answer if exists
      const answer = newState.answers.get(currentQuestion.id);
      if (answer) {
        newState.answers.set(currentQuestion.id, {
          ...answer,
          flagged: newFlagged.has(currentQuestion.id),
        });
      }
      
      return newState;
    });
  };

  // Submit answer (debounced to prevent double-clicks)
  const handleSubmitAnswer = useCallback(async () => {
    if (!attemptId || !currentQuestion || !sectionState || isSubmitting) return;

    // Check if already submitted to backend
    if (submittedQuestionIds.current.has(currentQuestion.id)) {
      console.log('Question already submitted, skipping');
      return;
    }

    const answer = sectionState.answers.get(currentQuestion.id);
    if (!answer?.selectedChoiceId) return;

    setIsSubmitting(true);

    try {
      const startTime = sectionState.questionStartTimes.get(currentQuestion.id) || Date.now();
      const answerTimeMs = Date.now() - startTime;

      const response = await examApi.submitAnswer(attemptId, {
        questionId: currentQuestion.id,
        selectedOptionId: answer.selectedChoiceId,
        timeMs: answerTimeMs,
      });

      // Mark as submitted
      submittedQuestionIds.current.add(currentQuestion.id);

      // Update answer with correctness
      const completedAnswer: QuestionAnswer = {
        questionId: currentQuestion.id,
        sectionId: sectionState.sectionId,
        selectedChoiceId: answer.selectedChoiceId,
        isCorrect: response.data.correct,
        answerTimeMs,
        flagged: sectionState.flaggedQuestions.has(currentQuestion.id),
      };

      allAnswers.current.push(completedAnswer);

      setSectionState(prev => {
        if (!prev) return prev;
        const newState = { ...prev };
        newState.answers.set(currentQuestion.id, completedAnswer);
        return newState;
      });

      // Move to next question or finish section
      if (sectionState.currentQuestionIndex < sectionState.questions.length - 1) {
        const nextIndex = sectionState.currentQuestionIndex + 1;
        const nextQuestionId = sectionState.questions[nextIndex].id;
        
        setSectionState(prev => {
          if (!prev) return prev;
          const newState = { ...prev };
          newState.currentQuestionIndex = nextIndex;
          
          // Record start time for next question
          if (!newState.questionStartTimes.has(nextQuestionId)) {
            newState.questionStartTimes.set(nextQuestionId, Date.now());
          }
          
          return newState;
        });
      } else {
        // Last question in section - automatically finish section and move to next
        console.log('Last question answered, finishing section...');
        
        // Confirm section finish
        try {
          await examApi.confirmFinishSection(attemptId);
        } catch (error) {
          console.error('Failed to confirm section finish:', error);
        }
        
        // Move to next section or finish exam
        await handleSectionComplete(attemptId, currentSectionIndex);
      }
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      // If it's "already answered", just mark it as submitted and move on
      if (error?.response?.data?.message?.includes('already answered') || 
          error?.message?.includes('already answered')) {
        submittedQuestionIds.current.add(currentQuestion.id);
      } else {
        alert('שגיאה בשליחת התשובה');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, currentQuestion, sectionState, isSubmitting, currentSectionIndex]);

  // Handle section timer expiry
  const handleSectionTimerExpire = useCallback(async () => {
    if (!attemptId || !sectionState) return;
    
    // Only record unanswered questions locally (don't submit to backend)
    // The backend will handle marking them as skipped when we confirm finish
    const unansweredQuestions = sectionState.questions.filter(
      q => !sectionState.answers.has(q.id)
    );

    for (const question of unansweredQuestions) {
      const unansweredAnswer: QuestionAnswer = {
        questionId: question.id,
        sectionId: sectionState.sectionId,
        selectedChoiceId: undefined,
        isCorrect: false,
        answerTimeMs: 0,
        flagged: sectionState.flaggedQuestions.has(question.id),
      };
      allAnswers.current.push(unansweredAnswer);
    }

    // Confirm section finish (backend will lock the section)
    try {
      await examApi.confirmFinishSection(attemptId);
    } catch (error) {
      console.error('Failed to confirm section finish:', error);
    }

    // Move to next section or finish exam
    await handleSectionComplete(attemptId, currentSectionIndex);
  }, [attemptId, sectionState, currentSectionIndex]);

  // Handle section complete
  const handleSectionComplete = async (currentAttemptId: string, currentIndex: number) => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < allSections.length) {
      // Load next section
      await loadSection(currentAttemptId, nextIndex);
    } else {
      // All sections complete - finish exam
      await finishExam(currentAttemptId);
    }
  };

  // Finish entire exam
  const finishExam = async (currentAttemptId: string) => {
    try {
      setLoading(true);
      const response = await examApi.finish(currentAttemptId);
      
      // Build section summaries
      const sectionSummaries = Object.entries(response.data).
        filter(([key]) => ['verbalAnalogy', 'shapeAnalogy', 'instructionsDirections', 'quantitative'].includes(key))
        .map(([key, value]: [string, any]) => {
          const typeMap: Record<string, string> = {
            verbalAnalogy: 'VERBAL_ANALOGY',
            shapeAnalogy: 'SHAPE_ANALOGY',
            instructionsDirections: 'INSTRUCTIONS_DIRECTIONS',
            quantitative: 'QUANTITATIVE',
          };
          
          return {
            type: typeMap[key] || key,
            answered: value?.answered || 0,
            total: value?.total || 0,
            correct: value?.correct || 0,
            accuracy: value?.accuracy || 0,
            timeSpentSeconds: value?.timeSpentSeconds || 0,
          };
        });

      setSummaryData({
        ...response.data,
        sections: sectionSummaries,
      });
      setExamState('finished');
    } catch (error) {
      console.error('Failed to finish exam:', error);
      alert('שגיאה בסיום המבחן');
    } finally {
      setLoading(false);
    }
  };

  // Navigate within section (no cross-section navigation)
  const handleNavigateToQuestion = (questionIndex: number) => {
    if (!sectionState) return;
    
    // Only allow navigation within current section
    if (questionIndex >= 0 && questionIndex < sectionState.questions.length) {
      setSectionState(prev => {
        if (!prev) return prev;
        const newState = { ...prev };
        newState.currentQuestionIndex = questionIndex;
        
        const questionId = newState.questions[questionIndex].id;
        if (!newState.questionStartTimes.has(questionId)) {
          newState.questionStartTimes.set(questionId, Date.now());
        }
        
        return newState;
      });
    }
  };

  // Exit confirmation
  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    window.location.href = '/';
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (examState !== 'inProgress' || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (currentQuestion.options && currentQuestion.options[index]) {
          handleSelectOption(currentQuestion.options[index].id);
        }
      } else if (e.key === 'Enter' && !isSubmitting) {
        handleSubmitAnswer();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFlag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [examState, currentQuestion, isSubmitting, handleSubmitAnswer]);

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center" dir="rtl">
          <h1 className="text-3xl font-bold text-slate-100 mb-4">נדרשת התחברות</h1>
          <p className="text-slate-400 mb-6">יש להתחבר כדי לבצע מבחן מלא</p>
          <button
            onClick={() => window.location.href = '/api/v1/auth/google/login/google'}
            className="px-6 py-3 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            התחבר עכשיו
          </button>
        </div>
      </div>
    );
  }

  // Start screen
  if (examState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 text-center">
            מבחן מלא
          </h1>
          <p className="text-slate-400 text-lg text-center mb-8">
            מבחן מדומה הכולל 4 חלקים עם זמן מוגבל לכל חלק
          </p>

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">הוראות</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">•</span>
                <span>המבחן כולל 4 חלקים: אנלוגיה מילולית, אנלוגיה צורנית, הוראות וכיוונים וחשיבה כמותית</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">•</span>
                <span>כל חלק מתוזמן בנפרד - לא ניתן לחזור לחלק קודם</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">•</span>
                <span>ניתן לנווט בין שאלות בתוך אותו החלק ולסמן לחזרה</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">•</span>
                <span>בתום זמן החלק, המערכת תעבור אוטומטית לחלק הבא</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">•</span>
                <span>קיצורי מקלדת: 1-4 לבחירת תשובה, Enter לשליחה, F לסימון</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="
              w-full px-8 py-4 
              bg-gradient-to-br from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white rounded-xl font-bold text-xl
              transition-all shadow-lg hover:shadow-xl
            "
          >
            {loading ? 'טוען...' : 'התחל מבחן'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Finished screen
  if (examState === 'finished' && summaryData) {
    return (
      <ExamSummarySheet
        score90={summaryData.totalScore90}
        totalQuestions={summaryData.totalQuestions}
        correctAnswers={summaryData.correctAnswers}
        totalTimeSeconds={summaryData.totalTimeSeconds || 0}
        attemptId={attemptId!}
        sections={summaryData.sections || []}
      />
    );
  }

  // Exam in progress
  if (!sectionState || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-300 text-lg">טוען...</div>
      </div>
    );
  }

  const currentAnswer = sectionState.answers.get(currentQuestion.id);
  const selectedOptionId = currentAnswer?.selectedChoiceId;
  const isFlagged = sectionState.flaggedQuestions.has(currentQuestion.id);
  const hasAnsweredAll = sectionState.questions.every(q => sectionState.answers.has(q.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      {/* Focus Bar */}
      <ExamFocusBar
        timerStartTimestamp={sectionState.startTimestamp}
        timerDurationSeconds={sectionState.durationSeconds}
        onTimerExpire={handleSectionTimerExpire}
        currentQuestionIndex={sectionState.currentQuestionIndex}
        totalQuestions={sectionState.questions.length}
        sectionName={getSectionLabel(sectionState.type)}
        onExit={handleExit}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Within-section navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">שאלות בחלק זה</h3>
            {hasAnsweredAll && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                ✓ כל השאלות נענו
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionState.questions.map((q, idx) => {
              const answered = sectionState.answers.has(q.id);
              const flagged = sectionState.flaggedQuestions.has(q.id);
              const isCurrent = idx === sectionState.currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => handleNavigateToQuestion(idx)}
                  className={`
                    relative w-10 h-10 rounded-lg font-medium text-sm transition-all
                    ${isCurrent 
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' 
                      : answered
                        ? 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600'
                        : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/40 border border-slate-700'
                    }
                  `}
                  aria-label={`שאלה ${idx + 1}${answered ? ' (נענתה)' : ''}${flagged ? ' (מסומנת)' : ''}`}
                >
                  {idx + 1}
                  {flagged && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl"
          >
            {/* Question */}
            <h2 className="text-2xl font-semibold text-slate-100 mb-6 leading-relaxed">
              {currentQuestion.promptText}
            </h2>

            {/* Image if exists */}
            {currentQuestion.promptImageUrl && (
              <div className="mb-6 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                <img 
                  src={currentQuestion.promptImageUrl} 
                  alt="שאלה"
                  className="max-w-full rounded-lg mx-auto"
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-8" role="radiogroup" aria-label="תשובות">
              {currentQuestion.options?.map((option, index) => {
                const optionLabel = ['א', 'ב', 'ג', 'ד'][index];
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`
                      w-full p-4 rounded-xl text-right transition-all
                      flex items-center gap-3
                      ${isSelected
                        ? 'bg-indigo-600/30 ring-2 ring-indigo-500 text-slate-100'
                        : 'bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                      }
                    `}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`תשובה ${optionLabel}`}
                  >
                    <span className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                      ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700/50 text-slate-400'}
                    `}>
                      {optionLabel}
                    </span>
                    {option.imageUrl ? (
                      <img 
                        src={option.imageUrl} 
                        alt={`תשובה ${optionLabel}`}
                        className="flex-1 max-h-24 object-contain"
                      />
                    ) : (
                      <span className="flex-1">{option.text}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleFlag}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${isFlagged
                    ? 'bg-amber-600/20 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/40 border border-slate-700/50'
                  }
                `}
                aria-pressed={isFlagged}
                aria-label={isFlagged ? 'בטל סימון' : 'סמן לסקירה'}
              >
                <Flag size={16} className={isFlagged ? 'fill-amber-300' : ''} />
                <span>{isFlagged ? 'מסומן לסקירה' : 'סמן לסקירה'}</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId || isSubmitting}
                  className="
                    flex items-center gap-2 px-6 py-3
                    bg-gradient-to-br from-indigo-600 to-violet-600
                    hover:from-indigo-500 hover:to-violet-500
                    disabled:opacity-40 disabled:cursor-not-allowed
                    text-white rounded-xl font-semibold transition-all
                    shadow-lg hover:shadow-xl
                  "
                  aria-label={selectedOptionId ? 'שלח תשובה והמשך' : 'בחר תשובה תחילה'}
                >
                  <span>{isSubmitting ? 'שולח...' : selectedOptionId ? 'שלח והמשך' : 'בחר תשובה'}</span>
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
              <p className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">{sectionState.answers.size}</span> מתוך {sectionState.questions.length} שאלות נענו
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit Dialog */}
      <ExitConfirmDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
      />
    </div>
  );
};

export default Exam;
