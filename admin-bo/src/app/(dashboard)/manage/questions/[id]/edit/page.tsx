'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/loading';
import { ArrowLeft, Save } from 'lucide-react';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS, QUESTION_FORMAT_LABELS } from '@/lib/utils';

interface QuestionData {
  question: {
    id: string;
    type: string;
    format: string;
    prompt_text: string | null;
    prompt_image_url: string | null;
    explanation: string | null;
    difficulty: number;
    is_exam_question: boolean;
  };
  options: Array<{ id: string; text: string | null; image_url: string | null; is_correct: boolean; option_order: number }>;
  acceptableAnswers: Array<{ id: string; value: string; numeric_tolerance: number | null }>;
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    format: '',
    difficulty: 3,
    prompt_text: '',
    prompt_image_url: '',
    explanation: '',
    is_exam_question: false,
  });
  const [answers, setAnswers] = useState<Array<{ value: string; numeric_tolerance: string }>>([]);
  const [options, setOptions] = useState<Array<{ text: string; image_url: string; is_correct: boolean }>>([]);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(`/api/manage/questions/${id}`);
        if (res.ok) {
          const data: QuestionData = await res.json();
          setFormData({
            type: data.question.type,
            format: data.question.format,
            difficulty: data.question.difficulty,
            prompt_text: data.question.prompt_text || '',
            prompt_image_url: data.question.prompt_image_url || '',
            explanation: data.question.explanation || '',
            is_exam_question: data.question.is_exam_question || false,
          });
          setAnswers(data.acceptableAnswers.map(a => ({ 
            value: a.value, 
            numeric_tolerance: a.numeric_tolerance?.toString() || '' 
          })));
          setOptions(data.options.map(o => ({ 
            text: o.text || '', 
            image_url: o.image_url || '', 
            is_correct: o.is_correct 
          })));
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestion();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        ...formData,
        prompt_text: formData.prompt_text || null,
        prompt_image_url: formData.prompt_image_url || null,
        explanation: formData.explanation || null,
      };

      if (formData.format === 'TEXT_INPUT') {
        body.acceptable_answers = answers.filter(a => a.value.trim()).map(a => ({
          value: a.value,
          numeric_tolerance: a.numeric_tolerance ? parseFloat(a.numeric_tolerance) : null,
        }));
      } else {
        body.options = options.map(o => ({
          text: o.text || null,
          image_url: o.image_url || null,
          is_correct: o.is_correct,
        }));
      }

      const res = await fetch(`/api/manage/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push(`/manage/questions/${id}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save question');
      }
    } catch (error) {
      alert('Error saving question');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div><LoadingCard /><LoadingCard /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <Link href={`/manage/questions/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to question
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          <button onClick={handleSave} disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Question Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select value={formData.format} onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  {Object.entries(QUESTION_FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea value={formData.prompt_text} onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg" dir="auto" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <input value={formData.prompt_image_url} onChange={(e) => setFormData({ ...formData, prompt_image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
              <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg" dir="auto" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_exam_question"
                checked={formData.is_exam_question}
                onChange={(e) => setFormData({ ...formData, is_exam_question: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="is_exam_question" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Exam Question
                </label>
                <p className="text-xs text-gray-500">
                  If checked, this question will only appear in exams. Otherwise, it will only appear in practice sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{formData.format === 'TEXT_INPUT' ? 'Acceptable Answers' : 'Options'}</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.format === 'TEXT_INPUT' ? (
              <div className="space-y-3">
                {answers.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={a.value} onChange={(e) => { const newA = [...answers]; newA[i].value = e.target.value; setAnswers(newA); }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" dir="auto" placeholder="Answer value" />
                    <input value={a.numeric_tolerance} onChange={(e) => { const newA = [...answers]; newA[i].numeric_tolerance = e.target.value; setAnswers(newA); }}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg" placeholder="±" type="number" step="0.01" />
                    {answers.length > 1 && (
                      <button onClick={() => setAnswers(answers.filter((_, idx) => idx !== i))}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setAnswers([...answers, { value: '', numeric_tolerance: '' }])}
                  className="text-sm text-indigo-600 hover:text-indigo-700">+ Add answer</button>
              </div>
            ) : (
              <div className="space-y-3">
                {options.map((o, i) => (
                  <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="radio" checked={o.is_correct}
                        onChange={() => setOptions(options.map((opt, idx) => ({ ...opt, is_correct: idx === i })))} />
                      <span className="text-sm text-gray-500">Correct</span>
                    </div>
                    <input value={o.text} onChange={(e) => { const newO = [...options]; newO[i].text = e.target.value; setOptions(newO); }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg" dir="auto" placeholder="Option text" />
                    <input value={o.image_url} onChange={(e) => { const newO = [...options]; newO[i].image_url = e.target.value; setOptions(newO); }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Image URL (optional)" />
                    {options.length > 2 && (
                      <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                        className="text-sm text-red-600 hover:text-red-700">Remove option</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setOptions([...options, { text: '', image_url: '', is_correct: false }])}
                  className="text-sm text-indigo-600 hover:text-indigo-700">+ Add option</button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

