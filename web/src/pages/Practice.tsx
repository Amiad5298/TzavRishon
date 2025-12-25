import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { practiceApi } from '@/api';
import { useAudio } from '@/contexts/AudioContext';
import type { Question } from '@/api/types';
import { AdvancedPracticePicker } from '@/components/AdvancedPracticePicker';
import { AdvancedPracticeScreen } from '@/components/AdvancedPracticeScreen';
import { mapQuestionToPracticeQuestion, mapChoiceIdToOptionId } from '@/utils/practiceMappers';
import { useAuth } from '@/contexts/AuthContext';
import { PracticeSummaryGuest } from '@/components/PracticeSummaryGuest';
import { PracticeSummaryAuth } from '@/components/PracticeSummaryAuth';

const Practice: React.FC = () => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useAudio();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [step, setStep] = useState<'type' | 'questions' | 'summary'>('type');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<{correct: boolean; explanation?: string} | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [submittedChoiceId, setSubmittedChoiceId] = useState<string | null>(null);

  // Map friendly IDs to backend IDs
  const typeMapping: Record<string, string> = {
    'visualAnalogy': 'SHAPE_ANALOGY',
    'verbalAnalogy': 'VERBAL_ANALOGY',
    'quantitative': 'QUANTITATIVE',
    'directions': 'INSTRUCTIONS_DIRECTIONS',
  };

  // Initialize practice session from navigation state (when coming from homepage category cards)
  useEffect(() => {
    const state = location.state as { sessionId?: string; questions?: Question[]; questionType?: string } | null;

    if (state?.sessionId && state?.questions && !sessionId) {
      // Session was already started on the homepage, just use the data
      setSessionId(state.sessionId);
      setQuestions(state.questions);
      setCurrentIndex(0);
      setQuestionStartTime(Date.now());
      setStep('questions');
    }
  }, [location.state]); // Only run when location state changes

  const handleSelectType = async (type: string) => {
    // Map frontend ID to backend ID
    const backendType = typeMapping[type] || type;

    setLoading(true);
    setError(null);

    try {
      const response = await practiceApi.start(backendType);
      if (response.data.limitReached) {
        setError(t('practice.limit_reached'));
        setLoading(false);
        return;
      }

      setSessionId(response.data.sessionId);
      const questionsResponse = await practiceApi.getQuestions(response.data.sessionId);
      setQuestions(questionsResponse.data);
      setCurrentIndex(0);
      setQuestionStartTime(Date.now());
      setStep('questions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בטעינת השאלות');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (choiceId: string): Promise<boolean> => {
    if (!sessionId || !questions[currentIndex]) return false;

    setLoading(true);
    setSubmittedChoiceId(choiceId);

    try {
      // Map choice ID (A-D) back to backend option ID
      const optionId = mapChoiceIdToOptionId(choiceId, questions[currentIndex]);

      const now = Date.now();
      const startTime = questionStartTime ?? now;
      const timeMs = now - startTime;

      const response = await practiceApi.submitAnswer(sessionId, {
        questionId: questions[currentIndex].id,
        selectedOptionId: optionId,
        timeMs,
      });

      setFeedback(response.data);
      if (response.data.correct) {
        playCorrect();
      } else {
        playIncorrect();
      }

      return response.data.correct;
    } catch (err) {
      setError('שגיאה בשליחת התשובה');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setSubmittedChoiceId(null);

    if (currentIndex + 1 >= questions.length) {
      finishSession();
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setQuestionStartTime(Date.now());
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;

    try {
      const response = await practiceApi.finish(sessionId);
      setSummary(response.data);
      setStep('summary');
    } catch (err) {
      setError('שגיאה בסיום התרגול');
    }
  };

  const resetPractice = () => {
    setStep('type');
    setSessionId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setFeedback(null);
    setSummary(null);
    setError(null);
  };

  const handleExit = () => {
    if (window.confirm('האם אתה בטוח שברצונך לצאת מהתרגול?')) {
      resetPractice();
    }
  };

  if (step === 'type') {
    return (
      <div className="relative">
        <AdvancedPracticePicker
          onSelect={handleSelectType}
          loading={loading}
        />
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          </div>
        )}
      </div>
    );
  }

  if (step === 'summary') {
    // If user is not authenticated, show conversion-focused guest summary
    if (!isAuthenticated) {
      return (
        <Container maxWidth="sm">
          <Typography variant="h4" align="center" gutterBottom>
            {t('practice.summary_title')}
          </Typography>
          <PracticeSummaryGuest
            accuracy={summary?.accuracy || 0}
            correctAnswers={summary?.correctAnswers || 0}
            totalQuestions={summary?.totalQuestions || 0}
            totalTimeMs={summary?.totalTimeMs || 0}
            onBackToTypes={resetPractice}
          />
        </Container>
      );
    }

    // Authenticated users see the enhanced summary card
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" align="center" gutterBottom>
          {t('practice.summary_title')}
        </Typography>
        <PracticeSummaryAuth
          accuracy={summary?.accuracy || 0}
          correctAnswers={summary?.correctAnswers || 0}
          totalQuestions={summary?.totalQuestions || 0}
          totalTimeMs={summary?.totalTimeMs || 0}
          onBackToTypes={resetPractice}
        />
      </Container>
    );
  }

  // Questions step - show loading if questions haven't loaded yet
  if (step === 'questions') {
    const currentQuestion = questions[currentIndex];

    if (!currentQuestion) {
      return (
        <Container maxWidth="sm">
          <Alert severity="info">טוען שאלות...</Alert>
        </Container>
      );
    }

    // Map backend question to practice question format
    const basePracticeQuestion = mapQuestionToPracticeQuestion(
      currentQuestion,
      undefined,
      feedback?.explanation
    );

    const practiceQuestion = feedback && submittedChoiceId
      ? {
          ...basePracticeQuestion,
          // For practice sessions we treat the submitted choice as "correct" when the
          // backend reports success so the UI can render green feedback without
          // exposing the real correct option.
          correctChoiceId: feedback.correct ? submittedChoiceId : undefined,
        }
      : basePracticeQuestion;

    return (
      <AdvancedPracticeScreen
        question={practiceQuestion}
        index={currentIndex + 1}
        total={questions.length}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
        onExit={handleExit}
      />
    );
  }

  // Fallback - should never reach here
  return null;
};

export default Practice;

