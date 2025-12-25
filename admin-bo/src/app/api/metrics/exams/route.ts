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
    // Exam attempts trend
    const attemptsTrend = await query<{ date: string; count: string }>(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM exam_attempts
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [from, to]);

    // Completion rate
    const [completionRate] = await query<{ total: string; completed: string }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed
      FROM exam_attempts
      WHERE created_at >= $1 AND created_at <= $2
    `, [from, to]);

    // Score distribution
    const scoreDistribution = await query<{ range: string; count: string }>(`
      SELECT 
        CASE 
          WHEN total_score_90 < 30 THEN '0-29'
          WHEN total_score_90 < 50 THEN '30-49'
          WHEN total_score_90 < 70 THEN '50-69'
          WHEN total_score_90 < 85 THEN '70-84'
          ELSE '85-90'
        END as range,
        COUNT(*) as count
      FROM exam_attempts
      WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2
      GROUP BY range
      ORDER BY range
    `, [from, to]);

    // Average score trend
    const scoreTrend = await query<{ date: string; avg_score: string }>(`
      SELECT DATE(created_at) as date, AVG(total_score_90) as avg_score
      FROM exam_attempts
      WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [from, to]);

    // Section performance
    const sectionPerformance = await query<{ type: string; avg_score: string; total: string; correct: string }>(`
      SELECT 
        es.type::text,
        AVG(es.score_section) as avg_score,
        COUNT(ea.id) as total,
        SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct
      FROM exam_sections es
      LEFT JOIN exam_answers ea ON es.id = ea.section_id
      JOIN exam_attempts et ON es.attempt_id = et.id
      WHERE et.created_at >= $1 AND et.created_at <= $2
      GROUP BY es.type
    `, [from, to]);

    // Average exam duration
    const [avgDuration] = await query<{ avg: string }>(`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg
      FROM exam_attempts
      WHERE completed_at IS NOT NULL AND created_at >= $1 AND created_at <= $2
    `, [from, to]);

    // Repeat exam takers
    const [repeatTakers] = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM (
        SELECT user_id FROM exam_attempts
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY user_id
        HAVING COUNT(*) > 1
      ) repeaters
    `, [from, to]);

    return NextResponse.json({
      attemptsTrend: attemptsTrend.map(a => ({
        date: a.date,
        count: parseInt(a.count),
      })),
      completionRate: {
        total: parseInt(completionRate?.total || '0'),
        completed: parseInt(completionRate?.completed || '0'),
        rate: parseInt(completionRate?.total || '0') > 0 
          ? (parseInt(completionRate?.completed || '0') / parseInt(completionRate?.total || '1') * 100).toFixed(1)
          : 0,
      },
      scoreDistribution: scoreDistribution.map(s => ({
        range: s.range,
        count: parseInt(s.count),
      })),
      scoreTrend: scoreTrend.map(s => ({
        date: s.date,
        avgScore: parseFloat(s.avg_score || '0').toFixed(1),
      })),
      sectionPerformance: sectionPerformance.map(s => ({
        type: s.type,
        avgScore: parseFloat(s.avg_score || '0').toFixed(1),
        total: parseInt(s.total),
        correct: parseInt(s.correct),
        accuracy: parseInt(s.total) > 0 ? (parseInt(s.correct) / parseInt(s.total) * 100).toFixed(1) : 0,
      })),
      avgDurationSeconds: parseFloat(avgDuration?.avg || '0'),
      repeatTakers: parseInt(repeatTakers?.count || '0'),
    });
  } catch (error) {
    console.error('Error fetching exam metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

