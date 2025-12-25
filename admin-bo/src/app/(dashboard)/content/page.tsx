'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { LoadingChart } from '@/components/ui/loading';
import { DateRange, getDefaultDateRange } from '@/components/ui/date-range-picker';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS, formatDuration } from '@/lib/utils';

interface ContentMetrics {
  questionsByType: { type: string; count: number }[];
  questionsByDifficulty: { difficulty: number; count: number }[];
  accuracyByType: { type: string; total: number; correct: number; accuracy: string }[];
  accuracyByDifficulty: { difficulty: number; total: number; correct: number; accuracy: string }[];
  mostAnswered: { id: string; type: string; count: number }[];
  avgTimeByType: { type: string; avgTimeMs: number }[];
}

export default function ContentPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/metrics/content?${params}`);
      if (res.ok) setMetrics(await res.json());
    } catch (error) {
      console.error('Error fetching content metrics:', error);
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
        title="Content Analytics"
        subtitle="Question pool usage and performance metrics"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : metrics && (
          <>
            <PieChart
              title="Questions by Type"
              data={metrics.questionsByType.map(q => ({
                name: QUESTION_TYPE_LABELS[q.type] || q.type,
                value: q.count,
                color: QUESTION_TYPE_COLORS[q.type] || '#6b7280',
              }))}
            />
            <BarChart
              title="Questions by Difficulty"
              data={metrics.questionsByDifficulty.map(q => ({
                difficulty: `Level ${q.difficulty}`,
                count: q.count,
              }))}
              bars={[{ dataKey: 'count', name: 'Questions', color: '#6366f1' }]}
              xAxisKey="difficulty"
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
              title="Accuracy by Question Type"
              data={metrics.accuracyByType.map(a => ({
                type: QUESTION_TYPE_LABELS[a.type] || a.type,
                accuracy: parseFloat(a.accuracy),
              }))}
              bars={[{ dataKey: 'accuracy', name: 'Accuracy %', color: '#10b981' }]}
              xAxisKey="type"
            />
            <BarChart
              title="Accuracy by Difficulty"
              data={metrics.accuracyByDifficulty.map(a => ({
                difficulty: `Level ${a.difficulty}`,
                accuracy: parseFloat(a.accuracy),
              }))}
              bars={[{ dataKey: 'accuracy', name: 'Accuracy %', color: '#f59e0b' }]}
              xAxisKey="difficulty"
            />
          </>
        )}
      </div>

      {/* Average Time Table */}
      {!isLoading && metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Average Time per Question by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.avgTimeByType.map((t) => (
                    <tr key={t.type} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {QUESTION_TYPE_LABELS[t.type] || t.type}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {formatDuration(t.avgTimeMs)}
                      </td>
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

