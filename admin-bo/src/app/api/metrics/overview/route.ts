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
    // Total registered users
    const [totalUsers] = await query<{ count: string }>('SELECT COUNT(*) as count FROM users');
    
    // New users in period
    const [newUsers] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at <= $2',
      [from, to]
    );

    // Total guests
    const [totalGuests] = await query<{ count: string }>('SELECT COUNT(*) as count FROM guest_identities');

    // Active users in period (users with practice or exam activity)
    const [activeUsers] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM practice_sessions WHERE user_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
        UNION
        SELECT user_id FROM exam_attempts WHERE created_at >= $1 AND created_at <= $2
      ) active
    `, [from, to]);

    // Total practice sessions
    const [practiceSessions] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM practice_sessions WHERE started_at >= $1 AND started_at <= $2',
      [from, to]
    );

    // Total exam attempts
    const [examAttempts] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM exam_attempts WHERE created_at >= $1 AND created_at <= $2',
      [from, to]
    );

    // Total questions answered (practice + exam)
    const [practiceAnswers] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM practice_answers pa
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2
    `, [from, to]);

    const [examAnswers] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM exam_answers ea
      JOIN exam_sections es ON ea.section_id = es.id
      JOIN exam_attempts et ON es.attempt_id = et.id
      WHERE et.created_at >= $1 AND et.created_at <= $2
    `, [from, to]);

    // Average exam score
    const [avgScore] = await query<{ avg: string }>(`
      SELECT AVG(total_score_90) as avg FROM exam_attempts 
      WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2
    `, [from, to]);

    // Overall accuracy
    const [accuracy] = await query<{ accuracy: string }>(`
      SELECT 
        CASE WHEN COUNT(*) > 0 
          THEN ROUND(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 1)
          ELSE 0 
        END as accuracy
      FROM (
        SELECT is_correct FROM practice_answers pa
        JOIN practice_sessions ps ON pa.session_id = ps.id
        WHERE ps.started_at >= $1 AND ps.started_at <= $2
        UNION ALL
        SELECT is_correct FROM exam_answers ea
        JOIN exam_sections es ON ea.section_id = es.id
        JOIN exam_attempts et ON es.attempt_id = et.id
        WHERE et.created_at >= $1 AND et.created_at <= $2
      ) all_answers
    `, [from, to]);

    return NextResponse.json({
      totalUsers: parseInt(totalUsers?.count || '0'),
      newUsers: parseInt(newUsers?.count || '0'),
      totalGuests: parseInt(totalGuests?.count || '0'),
      activeUsers: parseInt(activeUsers?.count || '0'),
      practiceSessions: parseInt(practiceSessions?.count || '0'),
      examAttempts: parseInt(examAttempts?.count || '0'),
      totalAnswers: parseInt(practiceAnswers?.count || '0') + parseInt(examAnswers?.count || '0'),
      avgExamScore: parseFloat(avgScore?.avg || '0').toFixed(1),
      overallAccuracy: parseFloat(accuracy?.accuracy || '0'),
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

