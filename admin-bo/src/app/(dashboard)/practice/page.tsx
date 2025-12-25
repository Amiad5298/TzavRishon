'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard, LoadingChart } from '@/components/ui/loading';
import { DateRange, getDefaultDateRange } from '@/components/ui/date-range-picker';
import { LineChart } from '@/components/charts/line-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import { formatNumber, formatPercent, formatDuration, QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from '@/lib/utils';

interface PracticeMetrics {
  sessionsTrend: { date: string; count: number }[];
  sessionsByType: { type: string; count: number }[];
  completionRate: { total: number; completed: number; rate: string };
  avgQuestionsPerSession: string;
  accuracyTrend: { date: string; accuracy: number }[];
  sessionBreakdown: { guest: number; registered: number };
  avgTimePerQuestion: number;
}

export default function PracticePage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [metrics, setMetrics] = useState<PracticeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/metrics/practice?${params}`);
      if (res.ok) setMetrics(await res.json());
    } catch (error) {
      console.error('Error fetching practice metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalSessions = metrics?.sessionsTrend.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <div>
      <Header
        title="Practice Analytics"
        subtitle="Practice session metrics and performance"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Sessions"
              value={formatNumber(totalSessions)}
              icon={BookOpen}
              iconColor="text-blue-600"
            />
            <StatCard
              title="Completion Rate"
              value={formatPercent(parseFloat(metrics?.completionRate.rate || '0'))}
              subtitle={`${metrics?.completionRate.completed}/${metrics?.completionRate.total}`}
              icon={CheckCircle}
              iconColor="text-green-600"
            />
            <StatCard
              title="Avg Questions/Session"
              value={metrics?.avgQuestionsPerSession || '0'}
              icon={Target}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Avg Time/Question"
              value={formatDuration(metrics?.avgTimePerQuestion || 0)}
              icon={Clock}
              iconColor="text-orange-600"
            />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : metrics && (
          <>
            <AreaChart
              title="Practice Sessions Over Time"
              data={metrics.sessionsTrend}
              areas={[{ dataKey: 'count', name: 'Sessions', color: '#6366f1' }]}
              xAxisKey="date"
            />
            <LineChart
              title="Accuracy Trend"
              data={metrics.accuracyTrend}
              lines={[{ dataKey: 'accuracy', name: 'Accuracy %', color: '#10b981' }]}
              xAxisKey="date"
            />
          </>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : metrics && (
          <>
            <PieChart
              title="Sessions by Question Type"
              data={metrics.sessionsByType.map(s => ({
                name: QUESTION_TYPE_LABELS[s.type] || s.type,
                value: s.count,
                color: QUESTION_TYPE_COLORS[s.type] || '#6b7280',
              }))}
            />
            <PieChart
              title="Sessions by User Type"
              data={[
                { name: 'Registered', value: metrics.sessionBreakdown.registered, color: '#6366f1' },
                { name: 'Guest', value: metrics.sessionBreakdown.guest, color: '#94a3b8' },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

