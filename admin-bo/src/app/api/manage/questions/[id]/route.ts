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
    const question = await queryOne<{
      id: string;
      type: string;
      format: string;
      prompt_text: string | null;
      prompt_image_url: string | null;
      explanation: string | null;
      difficulty: number;
      is_exam_question: boolean;
      created_at: string;
    }>(
      `SELECT id, type, format, prompt_text, prompt_image_url, explanation, difficulty, is_exam_question, created_at
       FROM questions WHERE id = $1`,
      [id]
    );

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Get options
    const options = await query<{
      id: string;
      text: string | null;
      image_url: string | null;
      is_correct: boolean;
      option_order: number;
    }>(
      `SELECT id, text, image_url, is_correct, option_order
       FROM question_options WHERE question_id = $1 ORDER BY option_order`,
      [id]
    );

    // Get acceptable answers
    const acceptableAnswers = await query<{
      id: string;
      value: string;
      numeric_tolerance: number | null;
    }>(
      `SELECT id, value, numeric_tolerance
       FROM acceptable_answers WHERE question_id = $1`,
      [id]
    );

    // Get usage stats
    const stats = await queryOne<{
      times_served: string;
      times_correct: string;
      avg_time_ms: string;
    }>(
      `SELECT 
        COUNT(*) as times_served,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as times_correct,
        AVG(time_ms) as avg_time_ms
      FROM (
        SELECT is_correct, time_ms FROM practice_answers WHERE question_id = $1
        UNION ALL
        SELECT is_correct, time_ms FROM exam_answers WHERE question_id = $1
      ) all_answers`,
      [id]
    );

    return NextResponse.json({
      question,
      options,
      acceptableAnswers,
      stats: stats ? {
        timesServed: parseInt(stats.times_served),
        timesCorrect: parseInt(stats.times_correct || '0'),
        avgTimeMs: parseFloat(stats.avg_time_ms || '0'),
        accuracy: parseInt(stats.times_served) > 0 
          ? (parseInt(stats.times_correct || '0') / parseInt(stats.times_served) * 100).toFixed(1)
          : null,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuthApi();
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const { type, format, prompt_text, prompt_image_url, explanation, difficulty, is_exam_question, options, acceptable_answers } = body;

    // Update question
    await query(
      `UPDATE questions SET type = $1, format = $2, prompt_text = $3, prompt_image_url = $4,
       explanation = $5, difficulty = $6, is_exam_question = $7 WHERE id = $8`,
      [type, format, prompt_text || null, prompt_image_url || null, explanation || null, difficulty, is_exam_question ?? false, id]
    );

    // Update options - delete existing and insert new
    if (options !== undefined) {
      await query(`DELETE FROM question_options WHERE question_id = $1`, [id]);
      if (Array.isArray(options)) {
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          await query(
            `INSERT INTO question_options (question_id, text, image_url, is_correct, option_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, opt.text || null, opt.image_url || null, opt.is_correct || false, i + 1]
          );
        }
      }
    }

    // Update acceptable answers
    if (acceptable_answers !== undefined) {
      await query(`DELETE FROM acceptable_answers WHERE question_id = $1`, [id]);
      if (Array.isArray(acceptable_answers)) {
        for (const answer of acceptable_answers) {
          await query(
            `INSERT INTO acceptable_answers (question_id, value, numeric_tolerance)
             VALUES ($1, $2, $3)`,
            [id, answer.value, answer.numeric_tolerance || null]
          );
        }
      }
    }

    return NextResponse.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

