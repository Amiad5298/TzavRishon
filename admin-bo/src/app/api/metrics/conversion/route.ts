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
    // Total guests who practiced
    const [totalGuestsPracticed] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT guest_id) as count
      FROM practice_sessions
      WHERE guest_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
    `, [from, to]);

    // Users who practiced before registering (approximation based on timing)
    const [practiceToRegister] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      WHERE u.created_at >= $1 AND u.created_at <= $2
      AND EXISTS (
        SELECT 1 FROM practice_sessions ps 
        WHERE ps.user_id = u.id 
        AND ps.started_at >= u.created_at
      )
    `, [from, to]);

    // Users who took exams after practicing
    const [practiceToExam] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT ea.user_id) as count
      FROM exam_attempts ea
      WHERE ea.created_at >= $1 AND ea.created_at <= $2
      AND EXISTS (
        SELECT 1 FROM practice_sessions ps 
        WHERE ps.user_id = ea.user_id 
        AND ps.started_at < ea.created_at
      )
    `, [from, to]);

    // Total users who took exams
    const [totalExamUsers] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM exam_attempts
      WHERE created_at >= $1 AND created_at <= $2
    `, [from, to]);

    // Funnel: Guest -> Registered -> Practice -> Exam
    const [totalRegistered] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at <= $2
    `, [from, to]);

    const [registeredWithPractice] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT ps.user_id) as count
      FROM practice_sessions ps
      JOIN users u ON ps.user_id = u.id
      WHERE u.created_at >= $1 AND u.created_at <= $2
    `, [from, to]);

    const [registeredWithExam] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT ea.user_id) as count
      FROM exam_attempts ea
      JOIN users u ON ea.user_id = u.id
      WHERE u.created_at >= $1 AND u.created_at <= $2
    `, [from, to]);

    // Time to first exam (from registration)
    const [avgTimeToExam] = await query<{ avg: string }>(`
      SELECT AVG(EXTRACT(EPOCH FROM (first_exam - u.created_at)) / 86400) as avg
      FROM users u
      JOIN (
        SELECT user_id, MIN(created_at) as first_exam
        FROM exam_attempts
        GROUP BY user_id
      ) fe ON u.id = fe.user_id
      WHERE u.created_at >= $1 AND u.created_at <= $2
    `, [from, to]);

    // Guest limit hit rate (guests with exactly 5 sessions per type)
    const [guestsHitLimit] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT guest_id) as count
      FROM (
        SELECT guest_id, type, COUNT(*) as session_count
        FROM practice_sessions
        WHERE guest_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
        GROUP BY guest_id, type
        HAVING COUNT(*) >= 5
      ) limited_guests
    `, [from, to]);

    return NextResponse.json({
      guestsPracticed: parseInt(totalGuestsPracticed?.count || '0'),
      practiceToRegister: parseInt(practiceToRegister?.count || '0'),
      practiceToExam: parseInt(practiceToExam?.count || '0'),
      totalExamUsers: parseInt(totalExamUsers?.count || '0'),
      funnel: {
        registered: parseInt(totalRegistered?.count || '0'),
        practiced: parseInt(registeredWithPractice?.count || '0'),
        tookExam: parseInt(registeredWithExam?.count || '0'),
      },
      avgDaysToFirstExam: parseFloat(avgTimeToExam?.avg || '0').toFixed(1),
      guestsHitLimit: parseInt(guestsHitLimit?.count || '0'),
    });
  } catch (error) {
    console.error('Error fetching conversion metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

