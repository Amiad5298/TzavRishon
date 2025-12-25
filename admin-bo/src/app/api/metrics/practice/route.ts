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
    // Practice sessions trend
    const sessionsTrend = await query<{ date: string; count: string }>(`
      SELECT DATE(started_at) as date, COUNT(*) as count
      FROM practice_sessions
      WHERE started_at >= $1 AND started_at <= $2
      GROUP BY DATE(started_at)
      ORDER BY date
    `, [from, to]);

    // Sessions by type
    const sessionsByType = await query<{ type: string; count: string }>(`
      SELECT type::text, COUNT(*) as count
      FROM practice_sessions
      WHERE started_at >= $1 AND started_at <= $2
      GROUP BY type
    `, [from, to]);

    // Session completion rate
    const [completionRate] = await query<{ total: string; completed: string }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ended_at IS NOT NULL THEN 1 ELSE 0 END) as completed
      FROM practice_sessions
      WHERE started_at >= $1 AND started_at <= $2
    `, [from, to]);

    // Average questions per session
    const [avgQuestions] = await query<{ avg: string }>(`
      SELECT AVG(question_count) as avg FROM (
        SELECT ps.id, COUNT(pa.id) as question_count
        FROM practice_sessions ps
        LEFT JOIN practice_answers pa ON ps.id = pa.session_id
        WHERE ps.started_at >= $1 AND ps.started_at <= $2
        GROUP BY ps.id
      ) session_counts
    `, [from, to]);

    // Accuracy trend
    const accuracyTrend = await query<{ date: string; accuracy: string }>(`
      SELECT 
        DATE(ps.started_at) as date,
        ROUND(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as accuracy
      FROM practice_answers pa
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2
      GROUP BY DATE(ps.started_at)
      ORDER BY date
    `, [from, to]);

    // Guest vs Registered sessions
    const [guestSessions] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM practice_sessions 
      WHERE guest_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
    `, [from, to]);

    const [registeredSessions] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM practice_sessions 
      WHERE user_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
    `, [from, to]);

    // Average time per question
    const [avgTime] = await query<{ avg: string }>(`
      SELECT AVG(time_ms) as avg
      FROM practice_answers pa
      JOIN practice_sessions ps ON pa.session_id = ps.id
      WHERE ps.started_at >= $1 AND ps.started_at <= $2 AND pa.time_ms IS NOT NULL
    `, [from, to]);

    return NextResponse.json({
      sessionsTrend: sessionsTrend.map(s => ({
        date: s.date,
        count: parseInt(s.count),
      })),
      sessionsByType: sessionsByType.map(s => ({
        type: s.type,
        count: parseInt(s.count),
      })),
      completionRate: {
        total: parseInt(completionRate?.total || '0'),
        completed: parseInt(completionRate?.completed || '0'),
        rate: parseInt(completionRate?.total || '0') > 0 
          ? (parseInt(completionRate?.completed || '0') / parseInt(completionRate?.total || '1') * 100).toFixed(1)
          : 0,
      },
      avgQuestionsPerSession: parseFloat(avgQuestions?.avg || '0').toFixed(1),
      accuracyTrend: accuracyTrend.map(a => ({
        date: a.date,
        accuracy: parseFloat(a.accuracy || '0'),
      })),
      sessionBreakdown: {
        guest: parseInt(guestSessions?.count || '0'),
        registered: parseInt(registeredSessions?.count || '0'),
      },
      avgTimePerQuestion: parseFloat(avgTime?.avg || '0'),
    });
  } catch (error) {
    console.error('Error fetching practice metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

