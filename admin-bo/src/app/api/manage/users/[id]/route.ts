import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAuthApi } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuthApi();
  if (authError) return authError;

  const { id } = await params;

  try {
    // Get user details
    const user = await queryOne<{
      id: string;
      email: string;
      display_name: string | null;
      avatar_url: string | null;
      is_premium: boolean;
      created_at: string;
      google_id: string | null;
    }>(
      `SELECT id, email, display_name, avatar_url, is_premium, created_at, google_id
       FROM users WHERE id = $1`,
      [id]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get practice sessions
    const practiceSessions = await query<{
      id: string;
      type: string;
      started_at: string;
      ended_at: string | null;
      answer_count: string;
      correct_count: string;
    }>(
      `SELECT 
        ps.id,
        ps.type,
        ps.started_at,
        ps.ended_at,
        COUNT(pa.id) as answer_count,
        SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as correct_count
      FROM practice_sessions ps
      LEFT JOIN practice_answers pa ON ps.id = pa.session_id
      WHERE ps.user_id = $1
      GROUP BY ps.id, ps.type, ps.started_at, ps.ended_at
      ORDER BY ps.started_at DESC
      LIMIT 20`,
      [id]
    );

    // Get exam attempts
    const examAttempts = await query<{
      id: string;
      created_at: string;
      completed_at: string | null;
      total_score_90: number | null;
      section_count: string;
    }>(
      `SELECT 
        ea.id,
        ea.created_at,
        ea.completed_at,
        ea.total_score_90,
        COUNT(es.id) as section_count
      FROM exam_attempts ea
      LEFT JOIN exam_sections es ON ea.id = es.attempt_id
      WHERE ea.user_id = $1
      GROUP BY ea.id, ea.created_at, ea.completed_at, ea.total_score_90
      ORDER BY ea.created_at DESC
      LIMIT 20`,
      [id]
    );

    // Get activity summary
    const activitySummary = await queryOne<{
      total_practice_sessions: string;
      total_practice_answers: string;
      practice_accuracy: string;
      total_exams: string;
      completed_exams: string;
      avg_exam_score: string;
    }>(
      `SELECT 
        (SELECT COUNT(*) FROM practice_sessions WHERE user_id = $1) as total_practice_sessions,
        (SELECT COUNT(*) FROM practice_answers pa 
         JOIN practice_sessions ps ON pa.session_id = ps.id 
         WHERE ps.user_id = $1) as total_practice_answers,
        (SELECT COALESCE(AVG(CASE WHEN pa.is_correct THEN 1.0 ELSE 0.0 END) * 100, 0)
         FROM practice_answers pa 
         JOIN practice_sessions ps ON pa.session_id = ps.id 
         WHERE ps.user_id = $1) as practice_accuracy,
        (SELECT COUNT(*) FROM exam_attempts WHERE user_id = $1) as total_exams,
        (SELECT COUNT(*) FROM exam_attempts WHERE user_id = $1 AND completed_at IS NOT NULL) as completed_exams,
        (SELECT COALESCE(AVG(total_score_90), 0) FROM exam_attempts 
         WHERE user_id = $1 AND completed_at IS NOT NULL) as avg_exam_score`,
      [id]
    );

    return NextResponse.json({
      user,
      practiceSessions: practiceSessions.map(s => ({
        ...s,
        answer_count: parseInt(s.answer_count),
        correct_count: parseInt(s.correct_count || '0'),
      })),
      examAttempts: examAttempts.map(e => ({
        ...e,
        section_count: parseInt(e.section_count),
      })),
      activitySummary: activitySummary ? {
        totalPracticeSessions: parseInt(activitySummary.total_practice_sessions),
        totalPracticeAnswers: parseInt(activitySummary.total_practice_answers),
        practiceAccuracy: parseFloat(activitySummary.practice_accuracy),
        totalExams: parseInt(activitySummary.total_exams),
        completedExams: parseInt(activitySummary.completed_exams),
        avgExamScore: parseFloat(activitySummary.avg_exam_score),
      } : null,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}

