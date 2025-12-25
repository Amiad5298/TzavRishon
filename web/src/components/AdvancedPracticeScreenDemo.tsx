import React, { useState } from 'react';
import { AdvancedPracticeScreen, PracticeQuestion } from './AdvancedPracticeScreen';

// Mock questions for testing
const MOCK_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'q1',
    type: 'visualAnalogy',
    stem: 'מהו הקשר בין הצורות המוצגות? בחר את התמונה המשלימה את הדפוס.',
    assets: [
      'https://via.placeholder.com/200x200/6366f1/ffffff?text=צורה+1',
      'https://via.placeholder.com/200x200/a855f7/ffffff?text=צורה+2',
    ],
    choices: [
      { id: 'A', imageUrl: 'https://via.placeholder.com/150x150/06b6d4/ffffff?text=A' },
      { id: 'B', imageUrl: 'https://via.placeholder.com/150x150/10b981/ffffff?text=B' },
      { id: 'C', imageUrl: 'https://via.placeholder.com/150x150/f59e0b/ffffff?text=C' },
      { id: 'D', imageUrl: 'https://via.placeholder.com/150x150/ef4444/ffffff?text=D' },
    ],
    correctChoiceId: 'B',
    explanation: 'התשובה הנכונה היא B כי היא משלימה את הדפוס הלוגי של הצורות המוצגות. הקשר הוא שכל צורה מסתובבת ב-90 מעלות בכיוון השעון.',
    timeLimitSec: 120,
  },
  {
    id: 'q2',
    type: 'verbalAnalogy',
    stem: 'ים : מים :: יער : ?',
    choices: [
      { id: 'A', label: 'עצים' },
      { id: 'B', label: 'חול' },
      { id: 'C', label: 'שמש' },
      { id: 'D', label: 'עננים' },
    ],
    correctChoiceId: 'A',
    explanation: 'התשובה הנכונה היא "עצים". כמו שים מורכב ממים, כך יער מורכב מעצים. זהו קשר של "שלם-חלק".',
    timeLimitSec: 90,
  },
  {
    id: 'q3',
    type: 'quantitative',
    stem: 'אם 3x + 5 = 20, מהו ערך x?',
    choices: [
      { id: 'A', label: '3' },
      { id: 'B', label: '5' },
      { id: 'C', label: '7' },
      { id: 'D', label: '15' },
    ],
    correctChoiceId: 'B',
    explanation: 'התשובה הנכונה היא 5. פתרון: 3x + 5 = 20 → 3x = 15 → x = 5',
    timeLimitSec: 60,
  },
  {
    id: 'q4',
    type: 'directions',
    stem: 'אתה עומד פונה צפונה. הסתובב ימינה 90 מעלות, אז שמאלה 180 מעלות. לאן אתה פונה עכשיו?',
    choices: [
      { id: 'A', label: 'צפון' },
      { id: 'B', label: 'דרום' },
      { id: 'C', label: 'מערב' },
      { id: 'D', label: 'מזרח' },
    ],
    correctChoiceId: 'C',
    explanation: 'התשובה הנכונה היא "מערב". התחלת בפנייה לצפון. סיבוב ימינה 90° = מזרח. סיבוב שמאלה 180° = מערב.',
  },
];

export const AdvancedPracticeScreenDemo: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (choiceId: string) => {
    console.log(`Submitted choice: ${choiceId} for question ${MOCK_QUESTIONS[currentIndex].id}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const isCorrect = choiceId === MOCK_QUESTIONS[currentIndex].correctChoiceId;
    return isCorrect;
  };

  const handleNext = () => {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleExit = () => {
    if (confirm('האם אתה בטוח שברצונך לצאת?')) {
      setCurrentIndex(0);
      setIsComplete(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">סיימת את כל השאלות!</h2>
          <p className="text-white/70 mb-6">עברת על {MOCK_QUESTIONS.length} שאלות הדגמה מסוגים שונים.</p>
          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all duration-200"
          >
            התחל מחדש
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdvancedPracticeScreen
      question={MOCK_QUESTIONS[currentIndex]}
      index={currentIndex + 1}
      total={MOCK_QUESTIONS.length}
      onSubmit={handleSubmit}
      onNext={handleNext}
      onExit={handleExit}
    />
  );
};

export default AdvancedPracticeScreenDemo;

