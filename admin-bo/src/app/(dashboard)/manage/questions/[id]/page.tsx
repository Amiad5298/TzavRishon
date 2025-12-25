'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingCard, LoadingChart } from '@/components/ui/loading';
import { ArrowLeft, Edit, Target, Clock, Eye, CheckCircle } from 'lucide-react';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS, QUESTION_FORMAT_LABELS, formatDuration } from '@/lib/utils';

interface QuestionDetails {
  question: {
    id: string;
    type: string;
    format: string;
    prompt_text: string | null;
    prompt_image_url: string | null;
    explanation: string | null;
    difficulty: number;
    is_exam_question: boolean;
    created_at: string;
  };
  options: Array<{
    id: string;
    text: string | null;
    image_url: string | null;
    is_correct: boolean;
    option_order: number;
  }>;
  acceptableAnswers: Array<{
    id: string;
    value: string;
    numeric_tolerance: number | null;
  }>;
  stats: {
    timesServed: number;
    timesCorrect: number;
    avgTimeMs: number;
    accuracy: string | null;
  } | null;
}

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<QuestionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(`/api/manage/questions/${id}`);
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestion();
  }, [id]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8"><LoadingCard /></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard />
        </div>
        <LoadingChart />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Question not found</p>
        <Link href="/manage/questions" className="text-indigo-600 hover:underline mt-2 inline-block">
          Back to questions
        </Link>
      </div>
    );
  }

  const { question, options, acceptableAnswers, stats } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/manage/questions" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to questions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Details</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                {QUESTION_TYPE_LABELS[question.type]}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                {QUESTION_FORMAT_LABELS[question.format]}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                {DIFFICULTY_LABELS[question.difficulty]}
              </span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${question.is_exam_question ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {question.is_exam_question ? 'Exam Only' : 'Practice Only'}
              </span>
            </div>
          </div>
          <Link href={`/manage/questions/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Edit className="w-4 h-4" /> Edit Question
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Times Served" value={stats.timesServed} icon={Eye} iconColor="text-blue-600" />
          <StatCard title="Times Correct" value={stats.timesCorrect} icon={CheckCircle} iconColor="text-green-600" />
          <StatCard title="Accuracy" value={stats.accuracy ? `${stats.accuracy}%` : 'N/A'} icon={Target} iconColor="text-purple-600" />
          <StatCard title="Avg Time" value={stats.avgTimeMs ? formatDuration(stats.avgTimeMs) : 'N/A'} icon={Clock} iconColor="text-orange-600" />
        </div>
      )}

      {/* Question Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Question Content</CardTitle></CardHeader>
          <CardContent>
            {question.prompt_text && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Prompt Text</p>
                <p className="text-gray-900 whitespace-pre-wrap" dir="auto">{question.prompt_text}</p>
              </div>
            )}
            {question.prompt_image_url && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Prompt Image</p>
                <img src={question.prompt_image_url} alt="Question" className="max-w-full rounded-lg border" />
              </div>
            )}
            {question.explanation && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Explanation</p>
                <p className="text-gray-700 whitespace-pre-wrap" dir="auto">{question.explanation}</p>
              </div>
            )}
            <p className="text-sm text-gray-400 mt-4">Created: {new Date(question.created_at).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{question.format === 'TEXT_INPUT' ? 'Acceptable Answers' : 'Options'}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.format === 'TEXT_INPUT' ? (
              <div className="space-y-2">
                {acceptableAnswers.map((a) => (
                  <div key={a.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800" dir="auto">{a.value}</p>
                    {a.numeric_tolerance && (
                      <p className="text-sm text-green-600">Tolerance: ±{a.numeric_tolerance}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((o) => (
                  <div key={o.id} className={`p-3 rounded-lg border ${o.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{o.option_order}.</span>
                      {o.text && <p className="font-medium" dir="auto">{o.text}</p>}
                      {o.is_correct && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                    </div>
                    {o.image_url && <img src={o.image_url} alt="" className="mt-2 max-w-full rounded" />}
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

