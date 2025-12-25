import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import TimeRangeSelector, { TimeRange } from '@/components/dashboard/TimeRangeSelector';
import CategoryFilter, { QuestionTypeFilter } from '@/components/dashboard/CategoryFilter';
import ExportButton from '@/components/dashboard/ExportButton';
import PracticeTab from '@/components/dashboard/PracticeTab';
import ExamsTab from '@/components/dashboard/ExamsTab';
import ExamDetailModal from '@/components/dashboard/ExamDetailModal';

type TabType = 'practice' | 'exams';

const Progress: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('practice');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [categoryFilter, setCategoryFilter] = useState<QuestionTypeFilter>('all');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Handle exam query parameter - runs on mount and when searchParams change
  useEffect(() => {
    const examId = searchParams.get('exam');
    if (examId) {
      setSelectedExamId(examId);
      setActiveTab('exams');
    } else {
      setSelectedExamId(null);
    }
  }, [searchParams]);

  const handleCloseExamDetail = () => {
    setSelectedExamId(null);
    // Remove exam query parameter
    searchParams.delete('exam');
    setSearchParams(searchParams);
  };

  // Calculate date range based on selection
  const getDateRange = () => {
    if (timeRange === 'all') return {};
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center p-4">
        <div className="text-center" dir="rtl">
          <h1 className="text-3xl font-bold text-white mb-4">נדרשת התחברות</h1>
          <p className="text-white/70 mb-6">יש להתחבר כדי לצפות בסטטיסטיקות</p>
          <button
            onClick={() => window.location.href = '/api/v1/auth/google/login/google'}
            className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            התחבר עכשיו
          </button>
        </div>
      </div>
    );
  }

  const dateRange = getDateRange();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 py-8" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">סטטיסטיקות</h1>
          <p className="text-white/60 text-lg">מעקב אחר ההתקדמות והביצועים שלך</p>
        </motion.div>

        {/* Global Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
              <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
            </div>
            
            <div className="flex items-center gap-4">
              <ExportButton />
              <div className="relative group">
                <button className="text-white/70 hover:text-white transition-colors">
                  <Info size={20} />
                </button>
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-sm rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  המדדים מחושבים לפי טווח הזמן והמסננים שנבחרו
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('practice')}
              className={`
                px-6 py-3 rounded-t-xl font-semibold text-lg transition-all
                ${activeTab === 'practice'
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              תרגול
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`
                px-6 py-3 rounded-t-xl font-semibold text-lg transition-all
                ${activeTab === 'exams'
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              מבחנים
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'practice' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'practice' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'practice' ? (
              <PracticeTab dateRange={dateRange} categoryFilter={categoryFilter} />
            ) : (
              <ExamsTab dateRange={dateRange} categoryFilter={categoryFilter} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exam Detail Modal */}
      {selectedExamId && (
        <ExamDetailModal
          attemptId={selectedExamId}
          onClose={handleCloseExamDetail}
        />
      )}
    </div>
  );
};

export default Progress;
