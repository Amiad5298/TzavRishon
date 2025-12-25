'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard, LoadingChart } from '@/components/ui/loading';
import { DateRange, getDefaultDateRange } from '@/components/ui/date-range-picker';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { Users, UserPlus, Crown, UserCheck } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface UserMetrics {
  registrationTrend: { date: string; count: number }[];
  dauTrend: { date: string; count: number }[];
  activityBreakdown: { guest: number; registered: number };
  userTypes: { premium: number; free: number };
  retention: { cohortDate: string; day: number; retained: number }[];
}

export default function UsersPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/metrics/users?${params}`);
      if (res.ok) setMetrics(await res.json());
    } catch (error) {
      console.error('Error fetching user metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRegistrations = metrics?.registrationTrend.reduce((sum, d) => sum + d.count, 0) || 0;
  const avgDAU = metrics?.dauTrend.length 
    ? Math.round(metrics.dauTrend.reduce((sum, d) => sum + d.count, 0) / metrics.dauTrend.length)
    : 0;

  return (
    <div>
      <Header
        title="User Analytics"
        subtitle="User acquisition, engagement, and retention metrics"
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
              title="New Registrations"
              value={formatNumber(totalRegistrations)}
              subtitle="In selected period"
              icon={UserPlus}
              iconColor="text-green-600"
            />
            <StatCard
              title="Avg Daily Active Users"
              value={formatNumber(avgDAU)}
              icon={UserCheck}
              iconColor="text-blue-600"
            />
            <StatCard
              title="Premium Users"
              value={formatNumber(metrics?.userTypes.premium || 0)}
              icon={Crown}
              iconColor="text-yellow-600"
            />
            <StatCard
              title="Free Users"
              value={formatNumber(metrics?.userTypes.free || 0)}
              icon={Users}
              iconColor="text-gray-600"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : metrics && (
          <>
            <AreaChart
              title="User Registrations Over Time"
              data={metrics.registrationTrend}
              areas={[{ dataKey: 'count', name: 'Registrations', color: '#10b981' }]}
              xAxisKey="date"
            />
            <LineChart
              title="Daily Active Users"
              data={metrics.dauTrend}
              lines={[{ dataKey: 'count', name: 'DAU', color: '#6366f1' }]}
              xAxisKey="date"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : metrics && (
          <>
            <PieChart
              title="Activity by User Type"
              data={[
                { name: 'Registered', value: metrics.activityBreakdown.registered, color: '#6366f1' },
                { name: 'Guest', value: metrics.activityBreakdown.guest, color: '#94a3b8' },
              ]}
            />
            <PieChart
              title="User Subscription Status"
              data={[
                { name: 'Premium', value: metrics.userTypes.premium, color: '#f59e0b' },
                { name: 'Free', value: metrics.userTypes.free, color: '#6b7280' },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

