import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, ChevronLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { progressApi } from '@/api';
import type { ExamAttemptListResponse, ProgressSummaryResponse } from '@/api/types';
import type { QuestionTypeFilter } from '@/components/dashboard/CategoryFilter';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';

interface ExamsTabProps {
  dateRange: { startDate?: string; endDate?: string };
  categoryFilter: QuestionTypeFilter;
}

const TYPE_LABELS: Record<string, string> = {
  VERBAL_ANALOGY: 'אנלוגיה מילולית',
  SHAPE_ANALOGY: 'אנלוגיה צורנית',
  QUANTITATIVE: 'חשיבה כמותית',
  INSTRUCTIONS_DIRECTIONS: 'הוראות וכיוונים',
};

const ExamsTab: React.FC<ExamsTabProps> = ({ dateRange, categoryFilter }) => {
  const [attempts, setAttempts] = useState<ExamAttemptListResponse | null>(null);
  const [summary, setSummary] = useState<ProgressSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attemptsRes, summaryRes] = await Promise.all([
          progressApi.getExamAttempts(5),
          progressApi.getSummary(dateRange.startDate, dateRange.endDate),
        ]);
        setAttempts(attemptsRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch exam stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange.startDate, dateRange.endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!attempts || attempts.attempts.length === 0) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-white/60 text-lg mb-4">טרם ביצעת מבחנים</p>
        <button
          onClick={() => navigate('/exam')}
          className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          התחל מבחן עכשיו
        </button>
      </div>
    );
  }

  const latestAttempt = attempts.attempts[0];

  // Prepare accuracy by type from summary
  const accuracyByType = summary?.statsByType
    .filter((stat) => categoryFilter === 'all' || stat.type === categoryFilter)
    .map((stat) => ({
      name: TYPE_LABELS[stat.type] || stat.type,
      value: stat.accuracy,
    })) || [];

  // Time management donut data
  const timeManagementData = latestAttempt ? Object.entries(latestAttempt.sections).map(([type, section]) => ({
    name: TYPE_LABELS[type] || type,
    value: section.timeSpentSeconds,
  })) : [];

  // Find weakest section
  const weakestSection = latestAttempt && Object.entries(latestAttempt.sections).reduce((min, [type, section]) => {
    return section.accuracy < (min?.accuracy || 100) ? { type, ...section } : min;
  }, null as any);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/70">ציון אחרון</h4>
            <Target className="text-purple-400" size={20} />
          </div>
          <p className="text-4xl font-bold text-white">{latestAttempt.score90}</p>
          <p className="text-sm text-white/60 mt-2">מתוך 90</p>
        </motion.div>

        {/* Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/70">דיוק</h4>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <p className="text-4xl font-bold text-white">{latestAttempt.accuracy.toFixed(1)}%</p>
          <p className="text-sm text-white/60 mt-2">תשובות נכונות</p>
        </motion.div>

        {/* Duration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/70">משך זמן</h4>
            <Clock className="text-blue-400" size={20} />
          </div>
          <p className="text-4xl font-bold text-white">
            {formatDuration(latestAttempt.durationSeconds)}
          </p>
          <p className="text-sm text-white/60 mt-2">דקות:שניות</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy by Type */}
        {accuracyByType.length > 0 && (
          <BarChart
            title="דיוק לפי סוג שאלה"
            data={accuracyByType}
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        )}

        {/* Time Management */}
        {timeManagementData.length > 0 && (
          <DonutChart
            title="ניהול זמן לפי מדור"
            data={timeManagementData}
            formatValue={(v) => `${Math.floor(v / 60)}m`}
          />
        )}
      </div>

      {/* Recent Attempts */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">מבחנים אחרונים</h3>
        <div className="space-y-3">
          {attempts.attempts.slice(0, 5).map((attempt, index) => (
            <motion.div
              key={attempt.attemptId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                flex items-center justify-between p-4 
                bg-white/5 hover:bg-white/10 rounded-xl 
                transition-all cursor-pointer border border-white/5
              "
              onClick={() => navigate(`/progress?exam=${attempt.attemptId}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-semibold text-2xl">{attempt.score90}</span>
                  <span className="text-white/40">/90</span>
                  <span className={`text-sm px-2 py-1 rounded-lg ${
                    attempt.accuracy >= 80 ? 'bg-green-500/20 text-green-300' :
                    attempt.accuracy >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {attempt.accuracy.toFixed(0)}%
                  </span>
                </div>
                <p className="text-white/60 text-sm">
                  {new Date(attempt.createdAt).toLocaleDateString('he-IL')} • {formatDuration(attempt.durationSeconds)}
                </p>
              </div>
              <button className="text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weak Section CTA */}
      {weakestSection && categoryFilter === 'all' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                נקודה לחזרה: {TYPE_LABELS[weakestSection.type]}
              </h3>
              <p className="text-white/70">
                דיוק במבחן אחרון: {weakestSection.accuracy.toFixed(1)}% - תרגלו את סוג זה
              </p>
            </div>
            <button
              onClick={() => navigate(`/practice?type=${weakestSection.type}`)}
              className="
                flex items-center gap-2 px-6 py-3 
                bg-white/20 hover:bg-white/30 text-white rounded-xl 
                font-semibold transition-all
              "
            >
              <span>תרגל עכשיו</span>
              <ExternalLink size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Total Attempts Count */}
      <p className="text-center text-white/60">
        סה"כ {summary?.totalAttempts || 0} מבחנים הושלמו
      </p>
    </div>
  );
};

export default ExamsTab;

