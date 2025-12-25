'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard, LoadingChart } from '@/components/ui/loading';
import { ArrowLeft, Mail, Calendar, Crown, BookOpen, ClipboardCheck, Target, Clock } from 'lucide-react';
import { QUESTION_TYPE_LABELS } from '@/lib/utils';

interface UserDetails {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    is_premium: boolean;
    created_at: string;
    google_id: string | null;
  };
  practiceSessions: Array<{
    id: string;
    type: string;
    started_at: string;
    ended_at: string | null;
    answer_count: number;
    correct_count: number;
  }>;
  examAttempts: Array<{
    id: string;
    created_at: string;
    completed_at: string | null;
    total_score_90: number | null;
    section_count: number;
  }>;
  activitySummary: {
    totalPracticeSessions: number;
    totalPracticeAnswers: number;
    practiceAccuracy: number;
    totalExams: number;
    completedExams: number;
    avgExamScore: number;
  } | null;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/manage/users/${id}`);
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8"><LoadingCard /></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingChart /><LoadingChart />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Link href="/manage/users" className="text-indigo-600 hover:underline mt-2 inline-block">
          Back to users
        </Link>
      </div>
    );
  }

  const { user, practiceSessions, examAttempts, activitySummary } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/manage/users" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl text-indigo-600 font-medium">
                {(user.display_name || user.email)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {user.display_name || 'No name'}
              {user.is_premium && <Crown className="w-5 h-5 text-amber-500" />}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Joined {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {activitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Practice Sessions" value={activitySummary.totalPracticeSessions} 
                    subtitle={`${activitySummary.totalPracticeAnswers} answers`} icon={BookOpen} iconColor="text-blue-600" />
          <StatCard title="Practice Accuracy" value={`${activitySummary.practiceAccuracy.toFixed(1)}%`}
                    subtitle="Overall accuracy" icon={Target} iconColor="text-green-600" />
          <StatCard title="Exam Attempts" value={activitySummary.totalExams}
                    subtitle={`${activitySummary.completedExams} completed`} icon={ClipboardCheck} iconColor="text-purple-600" />
          <StatCard title="Avg Exam Score" value={activitySummary.avgExamScore.toFixed(0)}
                    subtitle="Out of 90" icon={Clock} iconColor="text-orange-600" />
        </div>
      )}

      {/* Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Practice Sessions</CardTitle></CardHeader>
          <CardContent>
            {practiceSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No practice sessions</p>
            ) : (
              <div className="space-y-3">
                {practiceSessions.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{QUESTION_TYPE_LABELS[s.type] || s.type}</p>
                      <p className="text-sm text-gray-500">{new Date(s.started_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{s.correct_count}/{s.answer_count}</p>
                      <p className="text-sm text-gray-500">
                        {s.answer_count > 0 ? ((s.correct_count / s.answer_count) * 100).toFixed(0) : 0}% correct
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Exam Attempts</CardTitle></CardHeader>
          <CardContent>
            {examAttempts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No exam attempts</p>
            ) : (
              <div className="space-y-3">
                {examAttempts.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {e.completed_at ? 'Completed' : 'In Progress'}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(e.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      {e.total_score_90 !== null ? (
                        <>
                          <p className="font-medium text-gray-900">{e.total_score_90}/90</p>
                          <p className="text-sm text-gray-500">{e.section_count} sections</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">{e.section_count} sections</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

