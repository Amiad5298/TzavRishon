import React from 'react';
import { X } from 'lucide-react';
import ExamTimer from './ExamTimer';

interface ExamFocusBarProps {
  timerStartTimestamp: number;
  timerDurationSeconds: number;
  onTimerExpire: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  sectionName: string;
  onExit: () => void;
}

const ExamFocusBar: React.FC<ExamFocusBarProps> = ({
  timerStartTimestamp,
  timerDurationSeconds,
  onTimerExpire,
  currentQuestionIndex,
  totalQuestions,
  sectionName,
  onExit,
}) => {
  const progressPercent = totalQuestions > 0 
    ? ((currentQuestionIndex + 1) / totalQuestions) * 100 
    : 0;

  return (
    <div className="sticky top-0 z-50 bg-slate-950/98 backdrop-blur-md border-b border-slate-700/30" dir="rtl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Section Info */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-sm rounded-lg font-medium border border-indigo-500/20">
              {sectionName}
            </div>
            <span className="text-slate-300 text-sm">
              שאלה {currentQuestionIndex + 1} מתוך {totalQuestions}
            </span>
          </div>

          {/* Timer and Actions */}
          <div className="flex items-center gap-4">
            <ExamTimer 
              startTimestamp={timerStartTimestamp}
              durationSeconds={timerDurationSeconds}
              onExpire={onTimerExpire}
            />
            
            <button
              onClick={onExit}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label="יציאה"
              title="יציאה"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-slate-800/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamFocusBar;

