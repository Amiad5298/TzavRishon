'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard } from '@/components/ui/loading';
import { DateRange, getDefaultDateRange } from '@/components/ui/date-range-picker';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Users, Activity, BookOpen, ClipboardCheck, Target, TrendingUp } from 'lucide-react';
import { formatNumber, formatPercent, QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from '@/lib/utils';

interface OverviewMetrics {
  totalUsers: number;
  newUsers: number;
  totalGuests: number;
  activeUsers: number;
  practiceSessions: number;
  examAttempts: number;
  totalAnswers: number;
  avgExamScore: string;
  overallAccuracy: number;
}

interface PracticeMetrics {
  sessionsTrend: { date: string; count: number }[];
  sessionsByType: { type: string; count: number }[];
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [practice, setPractice] = useState<PracticeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });

      const [overviewRes, practiceRes] = await Promise.all([
        fetch(`/api/metrics/overview?${params}`),
        fetch(`/api/metrics/practice?${params}`),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (practiceRes.ok) setPractice(await practiceRes.json());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <Header
        title="Dashboard Overview"
        subtitle="Key metrics and performance indicators"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
              title="Total Users"
              value={formatNumber(overview?.totalUsers || 0)}
              subtitle={`${formatNumber(overview?.newUsers || 0)} new in period`}
              icon={Users}
              iconColor="text-indigo-600"
            />
            <StatCard
              title="Active Users"
              value={formatNumber(overview?.activeUsers || 0)}
              subtitle="Users with activity"
              icon={Activity}
              iconColor="text-green-600"
            />
            <StatCard
              title="Practice Sessions"
              value={formatNumber(overview?.practiceSessions || 0)}
              icon={BookOpen}
              iconColor="text-blue-600"
            />
            <StatCard
              title="Exam Attempts"
              value={formatNumber(overview?.examAttempts || 0)}
              icon={ClipboardCheck}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Total Answers"
              value={formatNumber(overview?.totalAnswers || 0)}
              subtitle="Questions answered"
              icon={Target}
              iconColor="text-orange-600"
            />
            <StatCard
              title="Overall Accuracy"
              value={formatPercent(overview?.overallAccuracy || 0)}
              icon={TrendingUp}
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Avg Exam Score"
              value={overview?.avgExamScore || '0'}
              subtitle="Out of 90"
              icon={ClipboardCheck}
              iconColor="text-pink-600"
            />
            <StatCard
              title="Guest Users"
              value={formatNumber(overview?.totalGuests || 0)}
              subtitle="Anonymous visitors"
              icon={Users}
              iconColor="text-gray-600"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {practice && (
          <>
            <LineChart
              title="Practice Sessions Trend"
              data={practice.sessionsTrend}
              lines={[{ dataKey: 'count', name: 'Sessions', color: '#6366f1' }]}
              xAxisKey="date"
            />
            <PieChart
              title="Sessions by Question Type"
              data={practice.sessionsByType.map(s => ({
                name: QUESTION_TYPE_LABELS[s.type] || s.type,
                value: s.count,
                color: QUESTION_TYPE_COLORS[s.type] || '#6b7280',
              }))}
            />
          </>
        )}
      </div>
    </div>
  );
}

