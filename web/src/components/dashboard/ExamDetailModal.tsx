import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, TrendingUp, CheckCircle, XCircle, Award, AlertTriangle } from 'lucide-react';
import { progressApi } from '@/api';
import type { ExamSummaryResponse } from '@/api/types';

interface ExamDetailModalProps {
  attemptId: string;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  VERBAL_ANALOGY: 'אנלוגיה מילולית',
  SHAPE_ANALOGY: 'אנלוגיה צורנית',
  QUANTITATIVE: 'חשיבה כמותית',
  INSTRUCTIONS_DIRECTIONS: 'הוראות וכיוונים',
};

const ExamDetailModal: React.FC<ExamDetailModalProps> = ({ attemptId, onClose }) => {
  const [data, setData] = useState<ExamSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await progressApi.getAttemptDetail(attemptId);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch exam details:', err);
        setError('שגיאה בטעינת פרטי המבחן');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attemptId]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (accuracy >= 60) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const sections = data ? [
    { key: 'verbalAnalogy', label: TYPE_LABELS.VERBAL_ANALOGY, data: data.verbalAnalogy },
    { key: 'shapeAnalogy', label: TYPE_LABELS.SHAPE_ANALOGY, data: data.shapeAnalogy },
    { key: 'instructionsDirections', label: TYPE_LABELS.INSTRUCTIONS_DIRECTIONS, data: data.instructionsDirections },
    { key: 'quantitative', label: TYPE_LABELS.QUANTITATIVE, data: data.quantitative },
  ].filter(s => s.data) : [];

  // Find best and worst performing sections
  const bestSection = sections.length > 0
    ? sections.reduce((best, current) =>
        (current.data!.accuracy > best.data!.accuracy) ? current : best
      )
    : null;

  const worstSection = sections.length > 0
    ? sections.reduce((worst, current) =>
        (current.data!.accuracy < worst.data!.accuracy) ? current : worst
      )
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">פרטי מבחן מלאים</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-400 text-lg">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  סגור
                </button>
              </div>
            )}

            {!loading && !error && data && (
              <div className="space-y-6">
                {/* Overall Score Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
                >
                  <div className="text-center mb-6">
                    <p className="text-white/60 mb-2 text-sm font-medium">ציון כולל</p>
                    <p className={`text-6xl font-bold ${getScoreColor(data.totalScore90)}`}>
                      {data.totalScore90}
                    </p>
                    <p className="text-white/40 text-xl mt-1">מתוך 90</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                    <div className="text-center">
                      <TrendingUp className="mx-auto mb-2 text-emerald-400" size={24} />
                      <p className="text-2xl font-bold text-white">
                        {data.totalQuestions > 0 ? ((data.correctAnswers / data.totalQuestions) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-white/60 text-sm">דיוק</p>
                    </div>

                    <div className="text-center">
                      <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
                      <p className="text-2xl font-bold text-white">
                        {data.correctAnswers}/{data.totalQuestions}
                      </p>
                      <p className="text-white/60 text-sm">תשובות נכונות</p>
                    </div>

                    <div className="text-center">
                      <Clock className="mx-auto mb-2 text-indigo-400" size={24} />
                      <p className="text-2xl font-bold text-white">
                        {formatDuration(data.totalTimeSeconds)}
                      </p>
                      <p className="text-white/60 text-sm">זמן כולל</p>
                    </div>
                  </div>
                </motion.div>

                {/* Section Breakdown */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">פירוט לפי מדור</h3>
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <motion.div
                        key={section.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-white">{section.label}</h4>
                            {/* Best/Worst Performance Badges */}
                            {sections.length > 1 && bestSection?.key === section.key && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                                <Award className="text-emerald-400" size={14} />
                                <span className="text-emerald-300 text-xs font-medium">הכי טוב</span>
                              </div>
                            )}
                            {sections.length > 1 && worstSection?.key === section.key && bestSection?.key !== section.key && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                                <AlertTriangle className="text-amber-400" size={14} />
                                <span className="text-amber-300 text-xs font-medium">לשיפור</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-sm px-3 py-1 rounded-lg border ${getAccuracyColor(section.data!.accuracy)}`}>
                            {section.data!.accuracy.toFixed(1)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <CheckCircle className="text-green-400" size={16} />
                              <span className="text-white/60 text-xs">נכונות</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                              {section.data!.correct}/{section.data!.total}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <XCircle className="text-red-400" size={16} />
                              <span className="text-white/60 text-xs">שגויות</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                              {section.data!.total - section.data!.correct}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Clock className="text-blue-400" size={16} />
                              <span className="text-white/60 text-xs">זמן</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                              {formatDuration(section.data!.timeSpentSeconds)}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                section.data!.accuracy >= 80 ? 'bg-green-500' :
                                section.data!.accuracy >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${section.data!.accuracy}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Performance Insights */}
                {sections.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl border border-emerald-500/20 p-5"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3">תובנות ביצועים</h4>
                    <div className="space-y-3">
                      {bestSection && (
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <Award className="text-emerald-400 mt-0.5 flex-shrink-0" size={20} />
                          <div>
                            <p className="text-emerald-300 font-semibold text-sm">נקודת חוזק</p>
                            <p className="text-white/80 text-sm mt-1">
                              הצלחת מצוין במדור <span className="font-semibold">{bestSection.label}</span> עם דיוק של{' '}
                              <span className="font-bold text-emerald-300">{bestSection.data!.accuracy.toFixed(1)}%</span>
                            </p>
                          </div>
                        </div>
                      )}
                      {worstSection && bestSection?.key !== worstSection?.key && (
                        <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <AlertTriangle className="text-amber-400 mt-0.5 flex-shrink-0" size={20} />
                          <div>
                            <p className="text-amber-300 font-semibold text-sm">תחום לשיפור</p>
                            <p className="text-white/80 text-sm mt-1">
                              כדאי להתמקד בתרגול מדור <span className="font-semibold">{worstSection.label}</span> - דיוק נוכחי:{' '}
                              <span className="font-bold text-amber-300">{worstSection.data!.accuracy.toFixed(1)}%</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Summary Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-5"
                >
                  <h4 className="text-lg font-semibold text-white mb-3">סיכום</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">סה"כ שאלות:</span>
                      <span className="text-white font-semibold">{data.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">תשובות נכונות:</span>
                      <span className="text-white font-semibold">{data.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">תשובות שגויות:</span>
                      <span className="text-white font-semibold">{data.totalQuestions - data.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">זמן ממוצע לשאלה:</span>
                      <span className="text-white font-semibold">
                        {data.totalTimeSeconds && data.totalQuestions > 0
                          ? `${Math.round(data.totalTimeSeconds / data.totalQuestions)}s`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExamDetailModal;

