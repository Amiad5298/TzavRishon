import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, ExternalLink, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SectionSummary {
  type: string;
  answered: number;
  total: number;
  correct: number;
  accuracy: number;
  timeSpentSeconds: number;
}

interface ExamSummaryProps {
  score90: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  attemptId: string;
  sections: SectionSummary[];
}

const ExamSummarySheet: React.FC<ExamSummaryProps> = ({
  score90,
  totalQuestions,
  correctAnswers,
  totalTimeSeconds,
  attemptId,
  sections,
}) => {
  const navigate = useNavigate();
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (score90 >= 75) return 'text-emerald-400';
    if (score90 >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getSectionLabel = (type: string) => {
    const labels: Record<string, string> = {
      VERBAL_ANALOGY: 'אנלוגיה מילולית',
      SHAPE_ANALOGY: 'אנלוגיה צורנית',
      INSTRUCTIONS_DIRECTIONS: 'הוראות וכיוונים',
      QUANTITATIVE: 'חשיבה כמותית',
    };
    return labels[type] || type;
  };

  const weakestSections = [...sections]
    .filter(s => s.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-6 bg-gradient-to-br from-indigo-600/30 to-violet-600/30 rounded-full mb-4 border border-indigo-500/20"
          >
            <Target size={64} className="text-indigo-300" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-100 mb-2">המבחן הושלם!</h1>
          <p className="text-slate-400 text-lg">כל הכבוד על השלמת המבחן המלא</p>
        </div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6 shadow-2xl"
        >
          <div className="text-center mb-6">
            <p className="text-slate-400 mb-2 text-sm font-medium">הציון הסופי שלך</p>
            <p className={`text-7xl font-bold ${getScoreColor()}`}>
              {score90}
            </p>
            <p className="text-slate-500 text-2xl mt-1">מתוך 90</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/50">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 text-emerald-400" size={24} />
              <p className="text-2xl font-bold text-slate-200">{accuracy.toFixed(1)}%</p>
              <p className="text-slate-500 text-sm">דיוק</p>
            </div>

            <div className="text-center">
              <Clock className="mx-auto mb-2 text-indigo-400" size={24} />
              <p className="text-2xl font-bold text-slate-200">{formatDuration(totalTimeSeconds)}</p>
              <p className="text-slate-500 text-sm">משך זמן</p>
            </div>

            <div className="text-center">
              <Target className="mx-auto mb-2 text-violet-400" size={24} />
              <p className="text-2xl font-bold text-slate-200">{correctAnswers}/{totalQuestions}</p>
              <p className="text-slate-500 text-sm">תשובות נכונות</p>
            </div>
          </div>
        </motion.div>

        {/* Section Breakdown */}
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-indigo-400" size={20} />
              <h3 className="text-lg font-semibold text-slate-200">פירוט לפי חלקים</h3>
            </div>
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.type} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium text-sm">{getSectionLabel(section.type)}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {section.correct}/{section.total} נכונות · {formatDuration(section.timeSpentSeconds)}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${section.accuracy >= 75 ? 'text-emerald-400' : section.accuracy >= 60 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {section.accuracy.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate(`/progress?tab=exams&attemptId=${attemptId}`)}
            className="
              flex items-center justify-center gap-2 px-6 py-4
              bg-gradient-to-br from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              text-white rounded-xl font-semibold
              transition-all shadow-lg hover:shadow-xl
            "
          >
            <span>צפה בדוח מפורט</span>
            <ExternalLink size={20} />
          </button>

          <button
            onClick={() => {
              if (weakestSections.length > 0) {
                navigate(`/practice?type=${weakestSections[0].type}`);
              } else {
                navigate('/practice');
              }
            }}
            className="
              flex items-center justify-center gap-2 px-6 py-4
              bg-slate-800/60 hover:bg-slate-700/60
              text-slate-200 rounded-xl font-semibold
              transition-all border border-slate-600/50
            "
          >
            <span>תרגל חולשות</span>
            <Activity size={20} />
          </button>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            חזרה לדף הבית
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExamSummarySheet;

