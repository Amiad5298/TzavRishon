'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard, LoadingChart } from '@/components/ui/loading';
import { DateRange, getDefaultDateRange } from '@/components/ui/date-range-picker';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, UserPlus, ClipboardCheck, AlertTriangle, Calendar } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ConversionMetrics {
  guestsPracticed: number;
  practiceToRegister: number;
  practiceToExam: number;
  totalExamUsers: number;
  funnel: { registered: number; practiced: number; tookExam: number };
  avgDaysToFirstExam: string;
  guestsHitLimit: number;
}

export default function ConversionPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/metrics/conversion?${params}`);
      if (res.ok) setMetrics(await res.json());
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const practiceToExamRate = metrics?.totalExamUsers && metrics?.practiceToExam
    ? ((metrics.practiceToExam / metrics.totalExamUsers) * 100).toFixed(1)
    : '0';

  return (
    <div>
      <Header
        title="Conversion Funnel"
        subtitle="User journey and conversion metrics"
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
              title="Guests Practiced"
              value={formatNumber(metrics?.guestsPracticed || 0)}
              subtitle="Anonymous users"
              icon={Users}
              iconColor="text-gray-600"
            />
            <StatCard
              title="Practice → Register"
              value={formatNumber(metrics?.practiceToRegister || 0)}
              subtitle="Users who registered after practice"
              icon={UserPlus}
              iconColor="text-green-600"
            />
            <StatCard
              title="Practice → Exam"
              value={formatNumber(metrics?.practiceToExam || 0)}
              subtitle={`${practiceToExamRate}% of exam takers`}
              icon={ClipboardCheck}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Guests Hit Limit"
              value={formatNumber(metrics?.guestsHitLimit || 0)}
              subtitle="Reached 5 session limit"
              icon={AlertTriangle}
              iconColor="text-orange-600"
            />
          </>
        )}
      </div>

      {/* Funnel Visualization */}
      {!isLoading && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FunnelStep
                  label="Registered Users"
                  value={metrics.funnel.registered}
                  percentage={100}
                  color="bg-indigo-500"
                />
                <FunnelStep
                  label="Practiced"
                  value={metrics.funnel.practiced}
                  percentage={metrics.funnel.registered > 0 
                    ? (metrics.funnel.practiced / metrics.funnel.registered) * 100 
                    : 0}
                  color="bg-blue-500"
                />
                <FunnelStep
                  label="Took Exam"
                  value={metrics.funnel.tookExam}
                  percentage={metrics.funnel.registered > 0 
                    ? (metrics.funnel.tookExam / metrics.funnel.registered) * 100 
                    : 0}
                  color="bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time to First Exam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Calendar className="w-12 h-12 text-indigo-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    {parseFloat(metrics.avgDaysToFirstExam).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Average days from registration to first exam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingChart />
          <LoadingChart />
        </div>
      )}
    </div>
  );
}

function FunnelStep({ label, value, percentage, color }: { 
  label: string; 
  value: number; 
  percentage: number; 
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{formatNumber(value)} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${color} h-4 rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}

