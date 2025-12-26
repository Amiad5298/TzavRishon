import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { progressApi } from '@/api';
import type { PracticeStatsResponse } from '@/api/types';
import type { QuestionTypeFilter } from '@/components/dashboard/CategoryFilter';
import BarChart from './charts/BarChart';
import Sparkline from './charts/Sparkline';

interface PracticeTabProps {
  dateRange: { startDate?: string; endDate?: string };
  categoryFilter: QuestionTypeFilter;
}

const TYPE_LABELS: Record<string, string> = {
  VERBAL_ANALOGY: 'אנלוגיה מילולית',
  SHAPE_ANALOGY: 'אנלוגיה צורנית',
  QUANTITATIVE: 'חשיבה כמותית',
  INSTRUCTIONS_DIRECTIONS: 'הוראות וכיוונים',
};

const PracticeTab: React.FC<PracticeTabProps> = ({ dateRange, categoryFilter }) => {
  const [data, setData] = useState<PracticeStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await progressApi.getPracticeSummary(dateRange.startDate, dateRange.endDate);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch practice stats:', error);
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

  if (!data || data.totalQuestions === 0) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-white/60 text-lg mb-4">אין נתוני תרגול בטווח זמן זה</p>
        <button
          onClick={() => navigate('/practice')}
          className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          התחל לתרגל עכשיו
        </button>
      </div>
    );
  }

  // Filter data by category if needed
  const filteredStats = categoryFilter === 'all' 
    ? data.statsByType 
    : Object.fromEntries(
        Object.entries(data.statsByType).filter(([key]) => key === categoryFilter)
      );

  // Prepare accuracy by type data
  const accuracyByType = Object.entries(filteredStats).map(([type, stats]) => ({
    name: TYPE_LABELS[type] || type,
    value: stats.accuracy,
    color: getTypeColor(type),
  }));

  // Prepare time by type data
  const timeByType = Object.entries(filteredStats).map(([type, stats]) => ({
    name: TYPE_LABELS[type] || type,
    value: stats.avgTimeMs / 1000, // Convert to seconds
  }));

  // Prepare mastery data
  const masteryData = Object.entries(filteredStats).map(([questionType, stats]) => ({
    type: questionType,
    label: TYPE_LABELS[questionType] || questionType,
    score: stats.masteryScore,
  }));

  // Daily volume for sparkline
  const dailyVolumeData = data.dailyVolume.slice(-14).map(d => ({ value: d.questionCount }));

  // Find weakest type
  const weakestType = Object.entries(filteredStats).reduce((min, [questionType, stats]) => {
    return stats.accuracy < (min?.accuracy || 100) ? { type: questionType, accuracy: stats.accuracy } : min;
  }, null as any);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/70">דיוק כולל</h4>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <p className="text-4xl font-bold text-white">{data.overallAccuracy.toFixed(1)}%</p>
          <p className="text-sm text-white/60 mt-2">{data.totalQuestions} שאלות</p>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/70">רצף תרגול</h4>
            <Flame className="text-orange-400" size={20} />
          </div>
          <p className="text-4xl font-bold text-white">{data.currentStreak}</p>
          <p className="text-sm text-white/60 mt-2">ימים ברצף</p>
        </motion.div>

        {/* Avg Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/70">זמן ממוצע לשאלה</h4>
          </div>
          <p className="text-4xl font-bold text-white">
            {(data.avgTimePerQuestionMs / 1000).toFixed(1)}s
          </p>
          <p className="text-sm text-white/60 mt-2">שניות</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy by Type */}
        <BarChart
          title="אחוזי מענה נכון לפי סוג שאלה"
          data={accuracyByType}
          formatValue={(v) => `${v.toFixed(1)}%`}
        />

        {/* Time by Type */}
        <BarChart
          title="זמן ממוצע לתשובה לפי סוג (שניות)"
          data={timeByType}
          horizontal
          formatValue={(v) => `${v.toFixed(1)}s`}
        />
      </div>

      {/* Mastery Chips + Daily Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Scores */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">ציון מאסטרי לפי סוג</h3>
          <p className="text-sm text-white/60 mb-4">
            מבוסס על דיוק משוקלל לפי עדכניות התרגול
          </p>
          <div className="space-y-3">
            {masteryData.map((item) => {
              const score = item.score;
              const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={item.type} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm font-medium">{item.label}</span>
                      <span className="text-white/70 text-sm">{score.toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] as any }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Volume Sparkline */}
        <Sparkline
          title="נפח תרגול יומי (14 ימים אחרונים)"
          data={dailyVolumeData}
          count={data.dailyVolume[data.dailyVolume.length - 1]?.questionCount || 0}
          trend="up"
          color="#3b82f6"
        />
      </div>

      {/* Weak Areas CTA */}
      {weakestType && categoryFilter === 'all' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                אזור לשיפור: {TYPE_LABELS[weakestType.type]}
              </h3>
              <p className="text-white/70">
                דיוק נוכחי: {weakestType.accuracy.toFixed(1)}% - שפרו את הביצועים בסוג זה
              </p>
            </div>
            <button
              onClick={() => navigate(`/question-bank?type=${weakestType.type}`)}
              className="
                flex items-center gap-2 px-6 py-3 
                bg-white/20 hover:bg-white/30 text-white rounded-xl 
                font-semibold transition-all
              "
            >
              <span>ראה שאלות לשיפור</span>
              <ExternalLink size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Helper tooltip */}
      <p className="text-center text-white/40 text-sm">
        💡 המדדים מחושבים לפי טווח הזמן והמסננים שנבחרו
      </p>
    </div>
  );
};

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    VERBAL_ANALOGY: '#3b82f6',
    SHAPE_ANALOGY: '#8b5cf6',
    QUANTITATIVE: '#ec4899',
    INSTRUCTIONS_DIRECTIONS: '#f59e0b',
  };
  return colors[type] || '#6b7280';
}

export default PracticeTab;

