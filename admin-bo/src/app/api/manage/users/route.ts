import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuthApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAuthApi();
  if (authError) return authError;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const premiumFilter = searchParams.get('premium');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | boolean)[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(email ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (premiumFilter !== null && premiumFilter !== '') {
    conditions.push(`is_premium = $${paramIndex}`);
    params.push(premiumFilter === 'true');
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column
  const validSortColumns = ['created_at', 'email', 'display_name', 'is_premium'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  try {
    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].count);

    // Get users with activity stats
    const users = await query<{
      id: string;
      email: string;
      display_name: string | null;
      avatar_url: string | null;
      is_premium: boolean;
      created_at: string;
      practice_count: string;
      exam_count: string;
      last_activity: string | null;
    }>(
      `SELECT 
        u.id,
        u.email,
        u.display_name,
        u.avatar_url,
        u.is_premium,
        u.created_at,
        COALESCE(ps.practice_count, 0) as practice_count,
        COALESCE(ea.exam_count, 0) as exam_count,
        GREATEST(ps.last_practice, ea.last_exam) as last_activity
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as practice_count, MAX(started_at) as last_practice
        FROM practice_sessions
        WHERE user_id IS NOT NULL
        GROUP BY user_id
      ) ps ON u.id = ps.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as exam_count, MAX(created_at) as last_exam
        FROM exam_attempts
        GROUP BY user_id
      ) ea ON u.id = ea.user_id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      users: users.map(u => ({
        ...u,
        practice_count: parseInt(u.practice_count),
        exam_count: parseInt(u.exam_count),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

