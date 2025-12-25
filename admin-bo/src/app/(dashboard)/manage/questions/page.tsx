'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/loading';
import { Search, Filter, ChevronLeft, ChevronRight, HelpCircle, Plus, Upload, Eye, Edit } from 'lucide-react';
import { cn, QUESTION_TYPE_LABELS, DIFFICULTY_LABELS, QUESTION_FORMAT_LABELS } from '@/lib/utils';

interface Question {
  id: string;
  type: string;
  format: string;
  prompt_text: string | null;
  prompt_image_url: string | null;
  explanation: string | null;
  difficulty: number;
  is_exam_question: boolean;
  created_at: string;
  options_count: number;
  times_served: number;
  times_correct: number;
  accuracy: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function QuestionManagementPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [poolFilter, setPoolFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        sortBy,
        sortOrder,
      });
      if (typeFilter) params.set('type', typeFilter);
      if (difficultyFilter) params.set('difficulty', difficultyFilter);
      if (formatFilter) params.set('format', formatFilter);
      if (poolFilter) params.set('pool', poolFilter);

      const res = await fetch(`/api/manage/questions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, typeFilter, difficultyFilter, formatFilter, poolFilter, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchQuestions(), 300);
    return () => clearTimeout(debounce);
  }, [fetchQuestions]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
          <p className="mt-1 text-sm text-gray-500">View, create, and manage questions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" /> Batch Upload
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">All Types</option>
              {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={difficultyFilter} onChange={(e) => { setDifficultyFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">All Difficulties</option>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={formatFilter} onChange={(e) => { setFormatFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">All Formats</option>
              {Object.entries(QUESTION_FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={poolFilter} onChange={(e) => { setPoolFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">All Pools</option>
              <option value="practice">Practice Only</option>
              <option value="exam">Exam Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Questions ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4"><LoadingCard /><LoadingCard /><LoadingCard /></div>
          ) : (
            <QuestionTable questions={questions} pagination={pagination} setPagination={setPagination} 
                          sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />
          )}
        </CardContent>
      </Card>

      {showUploadModal && <BatchUploadModal onClose={() => setShowUploadModal(false)} onSuccess={fetchQuestions} />}
      {showCreateModal && <CreateQuestionModal onClose={() => setShowCreateModal(false)} onSuccess={fetchQuestions} />}
    </div>
  );
}

function QuestionTable({ questions, pagination, setPagination, sortBy, sortOrder, handleSort }: {
  questions: Question[];
  pagination: Pagination;
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>;
  sortBy: string;
  sortOrder: string;
  handleSort: (column: string) => void;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Question</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('type')}>
                Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Pool</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('difficulty')}>
                Difficulty {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Stats</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('created_at')}>
                Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="max-w-md">
                    <p className="font-medium text-gray-900 truncate" dir="auto">
                      {q.prompt_text || (q.prompt_image_url ? '[Image Question]' : '[No content]')}
                    </p>
                    <p className="text-sm text-gray-500">{QUESTION_FORMAT_LABELS[q.format]} • {q.options_count} options</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                    {QUESTION_TYPE_LABELS[q.type]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={cn('px-2 py-1 rounded text-xs font-medium',
                    q.is_exam_question ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                    {q.is_exam_question ? 'Exam' : 'Practice'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <DifficultyBadge difficulty={q.difficulty} />
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <p className="text-gray-900">{q.times_served} served</p>
                    <p className="text-gray-500">{q.accuracy ? `${q.accuracy}% accuracy` : 'No data'}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/manage/questions/${q.id}`}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/manage/questions/${q.id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginator pagination={pagination} setPagination={setPagination} />
    </>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const colors: Record<number, string> = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-lime-100 text-lime-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
  };
  return (
    <span className={cn('px-2 py-1 rounded text-xs font-medium', colors[difficulty] || 'bg-gray-100 text-gray-700')}>
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}

function Paginator({ pagination, setPagination }: {
  pagination: Pagination;
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>;
}) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page <= 1}
          className={cn('p-2 rounded-lg border transition-colors', pagination.page <= 1
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
        <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page >= pagination.totalPages}
          className={cn('p-2 rounded-lg border transition-colors', pagination.page >= pagination.totalPages
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BatchUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: Array<{ index: number; error: string }> } | null>(null);
  const [mode, setMode] = useState<'file' | 'json'>('file');

  const handleUpload = async () => {
    setIsUploading(true);
    setResult(null);
    try {
      let questions;
      if (mode === 'file' && file) {
        const text = await file.text();
        if (file.name.endsWith('.csv')) {
          questions = parseCSV(text);
        } else {
          questions = JSON.parse(text);
          if (!Array.isArray(questions)) questions = questions.questions || [questions];
        }
      } else if (mode === 'json' && jsonInput) {
        const parsed = JSON.parse(jsonInput);
        questions = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
      }

      if (!questions || questions.length === 0) {
        alert('No questions found in input');
        return;
      }

      const res = await fetch('/api/manage/questions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success > 0) onSuccess();
    } catch (error) {
      alert('Error parsing input: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Batch Upload Questions</h2>
          <p className="text-sm text-gray-500 mt-1">Upload multiple questions via JSON or CSV file</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4 mb-4">
            <button onClick={() => setMode('file')} className={cn('px-4 py-2 rounded-lg font-medium transition-colors',
              mode === 'file' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              Upload File
            </button>
            <button onClick={() => setMode('json')} className={cn('px-4 py-2 rounded-lg font-medium transition-colors',
              mode === 'json' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              Paste JSON
            </button>
          </div>

          {mode === 'file' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input type="file" accept=".json,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{file ? file.name : 'Click to select JSON or CSV file'}</p>
              </label>
            </div>
          ) : (
            <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10}
              placeholder='[{"type": "VERBAL_ANALOGY", "format": "TEXT_INPUT", "difficulty": 3, "prompt_text": "...", "acceptable_answers": [{"value": "..."}]}]'
              className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              dir="auto" />
          )}

          {result && (
            <div className={cn('p-4 rounded-lg', result.failed > 0 ? 'bg-yellow-50' : 'bg-green-50')}>
              <p className="font-medium">{result.success} questions uploaded successfully</p>
              {result.failed > 0 && (
                <>
                  <p className="text-red-600">{result.failed} questions failed</p>
                  <ul className="mt-2 text-sm text-red-600 max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>Row {e.index + 1}: {e.error}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <FormatHelp />
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Close
          </button>
          <button onClick={handleUpload} disabled={isUploading || (mode === 'file' ? !file : !jsonInput)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormatHelp() {
  return (
    <details className="text-sm text-gray-600">
      <summary className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700">
        View JSON/CSV format guide
      </summary>
      <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
        <div>
          <p className="font-medium">JSON Format:</p>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto" dir="ltr">{`[
  {
    "type": "VERBAL_ANALOGY",
    "format": "TEXT_INPUT",
    "difficulty": 3,
    "is_exam_question": false,
    "prompt_text": "שאלה בעברית",
    "explanation": "הסבר",
    "acceptable_answers": [{"value": "תשובה"}]
  },
  {
    "type": "SHAPE_ANALOGY",
    "format": "SINGLE_CHOICE_IMAGE",
    "difficulty": 2,
    "is_exam_question": true,
    "prompt_image_url": "https://...",
    "options": [
      {"text": "אפשרות 1", "is_correct": true},
      {"text": "אפשרות 2", "is_correct": false}
    ]
  }
]`}</pre>
        </div>
        <div>
          <p className="font-medium">CSV Format (for TEXT_INPUT):</p>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto" dir="ltr">
{`type,format,difficulty,is_exam_question,prompt_text,explanation,answer1,answer2
VERBAL_ANALOGY,TEXT_INPUT,3,false,שאלה,הסבר,תשובה1,תשובה2`}
          </pre>
        </div>
        <div>
          <p className="font-medium">Valid Types:</p>
          <p>VERBAL_ANALOGY, SHAPE_ANALOGY, INSTRUCTIONS_DIRECTIONS, QUANTITATIVE</p>
        </div>
        <div>
          <p className="font-medium">Valid Formats:</p>
          <p>TEXT_INPUT (requires acceptable_answers), SINGLE_CHOICE_IMAGE (requires options)</p>
        </div>
        <div>
          <p className="font-medium">Question Pool:</p>
          <p>is_exam_question: true (exam only) or false (practice only, default)</p>
        </div>
      </div>
    </details>
  );
}

function parseCSV(text: string): Array<Record<string, unknown>> {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const questions: Array<Record<string, unknown>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const q: Record<string, unknown> = {};

    headers.forEach((h, idx) => {
      if (h === 'difficulty') {
        q[h] = parseInt(values[idx]) || 3;
      } else if (h === 'is_exam_question') {
        q[h] = values[idx].toLowerCase() === 'true';
      } else if (h.startsWith('answer')) {
        if (!q.acceptable_answers) q.acceptable_answers = [];
        if (values[idx]) (q.acceptable_answers as Array<{value: string}>).push({ value: values[idx] });
      } else if (h.startsWith('option') && h.includes('_')) {
        // option1_text, option1_correct format
        if (!q.options) q.options = [];
        const [optNum, field] = h.replace('option', '').split('_');
        const optIdx = parseInt(optNum) - 1;
        while ((q.options as Array<Record<string, unknown>>).length <= optIdx) {
          (q.options as Array<Record<string, unknown>>).push({});
        }
        if (field === 'correct') {
          (q.options as Array<Record<string, unknown>>)[optIdx].is_correct = values[idx].toLowerCase() === 'true';
        } else {
          (q.options as Array<Record<string, unknown>>)[optIdx][field] = values[idx];
        }
      } else {
        q[h] = values[idx];
      }
    });

    questions.push(q);
  }

  return questions;
}

function CreateQuestionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'VERBAL_ANALOGY',
    format: 'TEXT_INPUT',
    difficulty: 3,
    prompt_text: '',
    explanation: '',
    is_exam_question: false,
  });
  const [answers, setAnswers] = useState<string[]>(['']);
  const [options, setOptions] = useState<Array<{ text: string; is_correct: boolean }>>([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...formData };
      if (formData.format === 'TEXT_INPUT') {
        body.acceptable_answers = answers.filter(a => a.trim()).map(value => ({ value }));
      } else {
        body.options = options;
      }

      const res = await fetch('/api/manage/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create question');
      }
    } catch (error) {
      alert('Error creating question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Question</h2>
        </div>
        <div className="p-6 space-y-4">
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
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg" dir="auto" placeholder="Enter question text (Hebrew supported)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
            <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg" dir="auto" />
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

          {formData.format === 'TEXT_INPUT' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acceptable Answers</label>
              {answers.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={a} onChange={(e) => { const newA = [...answers]; newA[i] = e.target.value; setAnswers(newA); }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" dir="auto" placeholder="Answer" />
                  {answers.length > 1 && (
                    <button onClick={() => setAnswers(answers.filter((_, idx) => idx !== i))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">×</button>
                  )}
                </div>
              ))}
              <button onClick={() => setAnswers([...answers, ''])}
                className="text-sm text-indigo-600 hover:text-indigo-700">+ Add answer</button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              {options.map((o, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input type="radio" checked={o.is_correct} onChange={() => setOptions(options.map((opt, idx) => ({ ...opt, is_correct: idx === i })))} />
                  <input value={o.text} onChange={(e) => { const newO = [...options]; newO[i].text = e.target.value; setOptions(newO); }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" dir="auto" placeholder="Option text" />
                  {options.length > 2 && (
                    <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">×</button>
                  )}
                </div>
              ))}
              <button onClick={() => setOptions([...options, { text: '', is_correct: false }])}
                className="text-sm text-indigo-600 hover:text-indigo-700">+ Add option</button>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

