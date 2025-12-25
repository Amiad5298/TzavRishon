import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = searchParams.get('to') || new Date().toISOString();

  try {
    // Questions by type
    const questionsByType = await query<{ type: string; count: string }>(`
      SELECT type::text, COUNT(*) as count FROM questions GROUP BY type
    `);

    // Questions by difficulty
    const questionsByDifficulty = await query<{ difficulty: number; count: string }>(`
      SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty ORDER BY difficulty
    `);

    // Accuracy by question type
    const accuracyByType = await query<{ type: string; total: string; correct: string }>(`
      SELECT 
        q.type::text,
        COUNT(*) as total,
        SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as correct
      FROM practice_answers pa
      JOIN questions q ON pa.question_id = q.id
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2
      GROUP BY q.type
    `, [from, to]);

    // Accuracy by difficulty
    const accuracyByDifficulty = await query<{ difficulty: number; total: string; correct: string }>(`
      SELECT 
        q.difficulty,
        COUNT(*) as total,
        SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as correct
      FROM practice_answers pa
      JOIN questions q ON pa.question_id = q.id
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2
      GROUP BY q.difficulty
      ORDER BY q.difficulty
    `, [from, to]);

    // Most answered questions
    const mostAnswered = await query<{ id: string; type: string; count: string }>(`
      SELECT q.id, q.type::text, COUNT(*) as count
      FROM practice_answers pa
      JOIN questions q ON pa.question_id = q.id
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2
      GROUP BY q.id, q.type
      ORDER BY count DESC
      LIMIT 10
    `, [from, to]);

    // Average time per question by type
    const avgTimeByType = await query<{ type: string; avg_time: string }>(`
      SELECT 
        q.type::text,
        AVG(pa.time_ms) as avg_time
      FROM practice_answers pa
      JOIN questions q ON pa.question_id = q.id
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2 AND pa.time_ms IS NOT NULL
      GROUP BY q.type
    `, [from, to]);

    return NextResponse.json({
      questionsByType: questionsByType.map(q => ({
        type: q.type,
        count: parseInt(q.count),
      })),
      questionsByDifficulty: questionsByDifficulty.map(q => ({
        difficulty: q.difficulty,
        count: parseInt(q.count),
      })),
      accuracyByType: accuracyByType.map(a => ({
        type: a.type,
        total: parseInt(a.total),
        correct: parseInt(a.correct),
        accuracy: parseInt(a.total) > 0 ? (parseInt(a.correct) / parseInt(a.total) * 100).toFixed(1) : 0,
      })),
      accuracyByDifficulty: accuracyByDifficulty.map(a => ({
        difficulty: a.difficulty,
        total: parseInt(a.total),
        correct: parseInt(a.correct),
        accuracy: parseInt(a.total) > 0 ? (parseInt(a.correct) / parseInt(a.total) * 100).toFixed(1) : 0,
      })),
      mostAnswered: mostAnswered.map(q => ({
        id: q.id,
        type: q.type,
        count: parseInt(q.count),
      })),
      avgTimeByType: avgTimeByType.map(t => ({
        type: t.type,
        avgTimeMs: parseFloat(t.avg_time || '0'),
      })),
    });
  } catch (error) {
    console.error('Error fetching content metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

