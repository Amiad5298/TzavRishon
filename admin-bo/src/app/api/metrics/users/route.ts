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
    // Registration trend (daily)
    const registrationTrend = await query<{ date: string; count: string }>(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [from, to]);

    // DAU trend
    const dauTrend = await query<{ date: string; count: string }>(`
      SELECT date, COUNT(DISTINCT user_id) as count FROM (
        SELECT DATE(started_at) as date, user_id FROM practice_sessions 
        WHERE user_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
        UNION
        SELECT DATE(created_at) as date, user_id FROM exam_attempts 
        WHERE created_at >= $1 AND created_at <= $2
      ) activity
      GROUP BY date
      ORDER BY date
    `, [from, to]);

    // Guest vs Registered activity
    const [guestActivity] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM practice_sessions 
      WHERE guest_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
    `, [from, to]);

    const [registeredActivity] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM (
        SELECT id FROM practice_sessions WHERE user_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
        UNION ALL
        SELECT id FROM exam_attempts WHERE created_at >= $1 AND created_at <= $2
      ) reg_activity
    `, [from, to]);

    // Premium vs Free users
    const [premiumUsers] = await query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE is_premium = true');
    const [freeUsers] = await query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE is_premium = false');

    // User retention (users who returned after first day)
    const retention = await query<{ cohort_date: string; day: number; retained: string }>(`
      WITH first_activity AS (
        SELECT user_id, MIN(DATE(started_at)) as first_date
        FROM practice_sessions
        WHERE user_id IS NOT NULL AND started_at >= $1 AND started_at <= $2
        GROUP BY user_id
      ),
      subsequent_activity AS (
        SELECT ps.user_id, DATE(ps.started_at) as activity_date, fa.first_date
        FROM practice_sessions ps
        JOIN first_activity fa ON ps.user_id = fa.user_id
        WHERE ps.user_id IS NOT NULL
      )
      SELECT 
        first_date as cohort_date,
        (activity_date - first_date) as day,
        COUNT(DISTINCT user_id) as retained
      FROM subsequent_activity
      WHERE (activity_date - first_date) <= 7
      GROUP BY first_date, (activity_date - first_date)
      ORDER BY first_date, day
      LIMIT 100
    `, [from, to]);

    return NextResponse.json({
      registrationTrend: registrationTrend.map(r => ({
        date: r.date,
        count: parseInt(r.count),
      })),
      dauTrend: dauTrend.map(r => ({
        date: r.date,
        count: parseInt(r.count),
      })),
      activityBreakdown: {
        guest: parseInt(guestActivity?.count || '0'),
        registered: parseInt(registeredActivity?.count || '0'),
      },
      userTypes: {
        premium: parseInt(premiumUsers?.count || '0'),
        free: parseInt(freeUsers?.count || '0'),
      },
      retention: retention.map(r => ({
        cohortDate: r.cohort_date,
        day: r.day,
        retained: parseInt(r.retained),
      })),
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

