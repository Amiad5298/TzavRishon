import React from 'react';
import { Flag, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionStatus {
  id: string;
  answered: boolean;
  flagged: boolean;
}

interface SectionNavigatorProps {
  questions: QuestionStatus[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  collapsible?: boolean;
}

const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  questions,
  currentIndex,
  onNavigate,
  collapsible = true,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (isCollapsed && collapsible) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 shadow-lg transition-all"
        aria-label="פתח ניווט"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect width="4" height="4" rx="1" />
          <rect x="8" width="4" height="4" rx="1" />
          <rect x="16" width="4" height="4" rx="1" />
          <rect y="8" width="4" height="4" rx="1" />
          <rect x="8" y="8" width="4" height="4" rx="1" />
          <rect x="16" y="8" width="4" height="4" rx="1" />
          <rect y="16" width="4" height="4" rx="1" />
          <rect x="8" y="16" width="4" height="4" rx="1" />
          <rect x="16" y="16" width="4" height="4" rx="1" />
        </svg>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="fixed left-0 top-20 bottom-0 w-64 bg-slate-800/95 backdrop-blur-sm border-r border-white/10 overflow-y-auto z-40 p-4"
      dir="rtl"
    >
      {collapsible && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-2 left-2 text-white/70 hover:text-white p-2"
          aria-label="סגור ניווט"
        >
          ✕
        </button>
      )}

      <h3 className="text-lg font-semibold text-white mb-4">ניווט בשאלות</h3>

      <div className="grid grid-cols-4 gap-2">
        {questions.map((question, index) => {
          const isCurrent = index === currentIndex;
          const status = question.answered ? 'answered' : question.flagged ? 'flagged' : 'unanswered';

          return (
            <button
              key={question.id}
              onClick={() => onNavigate(index)}
              className={`
                relative aspect-square p-2 rounded-lg font-medium text-sm transition-all
                ${isCurrent
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : status === 'answered'
                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                  : status === 'flagged'
                  ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                }
              `}
              aria-label={`שאלה ${index + 1}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {index + 1}
              
              {question.flagged && (
                <Flag 
                  size={12} 
                  className="absolute top-1 left-1 text-orange-400 fill-orange-400" 
                />
              )}
              
              {question.answered && !isCurrent && (
                <Check 
                  size={12} 
                  className="absolute bottom-1 right-1 text-green-400" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
          <span>נענתה</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30 relative">
            <Flag size={10} className="absolute inset-0 m-auto text-orange-400" />
          </div>
          <span>מסומנת</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
          <span>לא נענתה</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SectionNavigator;

