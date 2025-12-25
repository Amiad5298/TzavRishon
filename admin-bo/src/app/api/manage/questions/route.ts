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
  const typeFilter = searchParams.get('type') || '';
  const difficultyFilter = searchParams.get('difficulty') || '';
  const formatFilter = searchParams.get('format') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(q.prompt_text ILIKE $${paramIndex} OR q.explanation ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (typeFilter) {
    conditions.push(`q.type = $${paramIndex}`);
    params.push(typeFilter);
    paramIndex++;
  }

  if (difficultyFilter) {
    conditions.push(`q.difficulty = $${paramIndex}`);
    params.push(parseInt(difficultyFilter));
    paramIndex++;
  }

  if (formatFilter) {
    conditions.push(`q.format = $${paramIndex}`);
    params.push(formatFilter);
    paramIndex++;
  }

  const poolFilter = searchParams.get('pool') || '';
  if (poolFilter === 'exam') {
    conditions.push(`q.is_exam_question = true`);
  } else if (poolFilter === 'practice') {
    conditions.push(`q.is_exam_question = false`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column
  const validSortColumns = ['created_at', 'type', 'difficulty', 'format'];
  const sortColumn = validSortColumns.includes(sortBy) ? `q.${sortBy}` : 'q.created_at';
  const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  try {
    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM questions q ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].count);

    // Get questions with stats
    const questions = await query<{
      id: string;
      type: string;
      format: string;
      prompt_text: string | null;
      prompt_image_url: string | null;
      explanation: string | null;
      difficulty: number;
      is_exam_question: boolean;
      created_at: string;
      options_count: string;
      times_served: string;
      times_correct: string;
    }>(
      `SELECT
        q.id,
        q.type,
        q.format,
        q.prompt_text,
        q.prompt_image_url,
        q.explanation,
        q.difficulty,
        q.is_exam_question,
        q.created_at,
        COALESCE(opt.options_count, 0) as options_count,
        COALESCE(stats.times_served, 0) as times_served,
        COALESCE(stats.times_correct, 0) as times_correct
      FROM questions q
      LEFT JOIN (
        SELECT question_id, COUNT(*) as options_count
        FROM question_options
        GROUP BY question_id
      ) opt ON q.id = opt.question_id
      LEFT JOIN (
        SELECT question_id,
               COUNT(*) as times_served,
               SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as times_correct
        FROM (
          SELECT question_id, is_correct FROM practice_user_answers
          UNION ALL
          SELECT question_id, is_correct FROM exam_user_answers
        ) all_answers
        GROUP BY question_id
      ) stats ON q.id = stats.question_id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      questions: questions.map(q => ({
        ...q,
        options_count: parseInt(q.options_count),
        times_served: parseInt(q.times_served),
        times_correct: parseInt(q.times_correct),
        accuracy: parseInt(q.times_served) > 0 
          ? (parseInt(q.times_correct) / parseInt(q.times_served) * 100).toFixed(1)
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// Create a new question
export async function POST(request: NextRequest) {
  const authError = await requireAuthApi();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { type, format, prompt_text, prompt_image_url, explanation, difficulty, is_exam_question, options, acceptable_answers } = body;

    // Validate required fields
    if (!type || !format || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields: type, format, difficulty' }, { status: 400 });
    }

    // Validate single correct answer for SINGLE_CHOICE_IMAGE format
    if (format === 'SINGLE_CHOICE_IMAGE') {
      if (!options || !Array.isArray(options) || options.length === 0) {
        return NextResponse.json({
          error: 'SINGLE_CHOICE_IMAGE format requires at least one option'
        }, { status: 400 });
      }

      const correctCount = options.filter(opt => opt.is_correct === true).length;

      if (correctCount === 0) {
        return NextResponse.json({
          error: 'SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found 0 correct answers.'
        }, { status: 400 });
      }

      if (correctCount > 1) {
        return NextResponse.json({
          error: `SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found ${correctCount} correct answers.`
        }, { status: 400 });
      }
    }

    // Insert question
    const questionResult = await query<{ id: string }>(
      `INSERT INTO questions (type, format, prompt_text, prompt_image_url, explanation, difficulty, is_exam_question)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [type, format, prompt_text || null, prompt_image_url || null, explanation || null, difficulty, is_exam_question || false]
    );

    const questionId = questionResult[0].id;

    // Insert options if provided (for SINGLE_CHOICE_IMAGE format)
    if (options && Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await query(
          `INSERT INTO question_options (question_id, text, image_url, is_correct, option_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [questionId, opt.text || null, opt.image_url || null, opt.is_correct || false, i + 1]
        );
      }
    }

    // Insert acceptable answers if provided (for TEXT_INPUT format)
    if (acceptable_answers && Array.isArray(acceptable_answers)) {
      for (const answer of acceptable_answers) {
        await query(
          `INSERT INTO acceptable_answers (question_id, value, numeric_tolerance)
           VALUES ($1, $2, $3)`,
          [questionId, answer.value, answer.numeric_tolerance || null]
        );
      }
    }

    return NextResponse.json({ id: questionId, message: 'Question created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

