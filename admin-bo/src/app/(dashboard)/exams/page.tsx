'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard, LoadingChart } from '@/components/ui/loading';
import { DateRange, getDefaultDateRange } from '@/components/ui/date-range-picker';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardCheck, CheckCircle, Clock, Users } from 'lucide-react';
import { formatNumber, formatPercent, formatDuration, QUESTION_TYPE_LABELS } from '@/lib/utils';

interface ExamMetrics {
  attemptsTrend: { date: string; count: number }[];
  completionRate: { total: number; completed: number; rate: string };
  scoreDistribution: { range: string; count: number }[];
  scoreTrend: { date: string; avgScore: string }[];
  sectionPerformance: { type: string; avgScore: string; total: number; correct: number; accuracy: string }[];
  avgDurationSeconds: number;
  repeatTakers: number;
}

export default function ExamsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [metrics, setMetrics] = useState<ExamMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/metrics/exams?${params}`);
      if (res.ok) setMetrics(await res.json());
    } catch (error) {
      console.error('Error fetching exam metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAttempts = metrics?.attemptsTrend.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <div>
      <Header
        title="Exam Analytics"
        subtitle="Exam attempt metrics and score analysis"
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
              title="Total Attempts"
              value={formatNumber(totalAttempts)}
              icon={ClipboardCheck}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Completion Rate"
              value={formatPercent(parseFloat(metrics?.completionRate.rate || '0'))}
              subtitle={`${metrics?.completionRate.completed}/${metrics?.completionRate.total}`}
              icon={CheckCircle}
              iconColor="text-green-600"
            />
            <StatCard
              title="Avg Duration"
              value={formatDuration(metrics?.avgDurationSeconds ? metrics.avgDurationSeconds * 1000 : 0)}
              icon={Clock}
              iconColor="text-blue-600"
            />
            <StatCard
              title="Repeat Takers"
              value={formatNumber(metrics?.repeatTakers || 0)}
              subtitle="Users with 2+ exams"
              icon={Users}
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
            <LineChart
              title="Exam Attempts Over Time"
              data={metrics.attemptsTrend}
              lines={[{ dataKey: 'count', name: 'Attempts', color: '#8b5cf6' }]}
              xAxisKey="date"
            />
            <LineChart
              title="Average Score Trend"
              data={metrics.scoreTrend.map(s => ({ ...s, avgScore: parseFloat(s.avgScore) }))}
              lines={[{ dataKey: 'avgScore', name: 'Avg Score', color: '#10b981' }]}
              xAxisKey="date"
            />
          </>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : metrics && (
          <>
            <BarChart
              title="Score Distribution"
              data={metrics.scoreDistribution}
              bars={[{ dataKey: 'count', name: 'Exams', color: '#6366f1' }]}
              xAxisKey="range"
            />
            <BarChart
              title="Section Performance (Accuracy %)"
              data={metrics.sectionPerformance.map(s => ({
                type: QUESTION_TYPE_LABELS[s.type] || s.type,
                accuracy: parseFloat(s.accuracy),
              }))}
              bars={[{ dataKey: 'accuracy', name: 'Accuracy', color: '#f59e0b' }]}
              xAxisKey="type"
            />
          </>
        )}
      </div>

      {/* Section Details Table */}
      {!isLoading && metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Section Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Section</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Avg Score</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Accuracy</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.sectionPerformance.map((s) => (
                    <tr key={s.type} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{QUESTION_TYPE_LABELS[s.type] || s.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{s.avgScore}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{s.accuracy}%</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatNumber(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

