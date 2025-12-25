import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuthApi } from '@/lib/auth';

interface QuestionInput {
  type: string;
  format: string;
  prompt_text?: string;
  prompt_image_url?: string;
  explanation?: string;
  difficulty: number;
  is_exam_question?: boolean;
  options?: Array<{
    text?: string;
    image_url?: string;
    is_correct: boolean;
  }>;
  acceptable_answers?: Array<{
    value: string;
    numeric_tolerance?: number;
  }>;
}

interface BatchResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

const VALID_TYPES = ['VERBAL_ANALOGY', 'SHAPE_ANALOGY', 'INSTRUCTIONS_DIRECTIONS', 'QUANTITATIVE'];
const VALID_FORMATS = ['TEXT_INPUT', 'SINGLE_CHOICE_IMAGE'];

function validateQuestion(q: QuestionInput, index: number): string | null {
  if (!q.type || !VALID_TYPES.includes(q.type)) {
    return `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`;
  }
  if (!q.format || !VALID_FORMATS.includes(q.format)) {
    return `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}`;
  }
  if (!q.difficulty || q.difficulty < 1 || q.difficulty > 5) {
    return 'Difficulty must be between 1 and 5';
  }
  if (q.format === 'SINGLE_CHOICE_IMAGE' && (!q.options || q.options.length < 2)) {
    return 'SINGLE_CHOICE_IMAGE format requires at least 2 options';
  }
  if (q.format === 'SINGLE_CHOICE_IMAGE') {
    const correctCount = q.options?.filter(o => o.is_correct).length || 0;
    if (correctCount !== 1) {
      return 'Exactly one option must be marked as correct';
    }
  }
  if (q.format === 'TEXT_INPUT' && (!q.acceptable_answers || q.acceptable_answers.length === 0)) {
    return 'TEXT_INPUT format requires at least one acceptable answer';
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authError = await requireAuthApi();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { questions } = body as { questions: QuestionInput[] };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    if (questions.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 questions per batch' }, { status: 400 });
    }

    const result: BatchResult = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // Validate
      const validationError = validateQuestion(q, i);
      if (validationError) {
        result.failed++;
        result.errors.push({ index: i, error: validationError });
        continue;
      }

      try {
        // Insert question
        const questionResult = await query<{ id: string }>(
          `INSERT INTO questions (type, format, prompt_text, prompt_image_url, explanation, difficulty, is_exam_question)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [q.type, q.format, q.prompt_text || null, q.prompt_image_url || null, q.explanation || null, q.difficulty, q.is_exam_question || false]
        );

        const questionId = questionResult[0].id;

        // Insert options
        if (q.options && Array.isArray(q.options)) {
          for (let j = 0; j < q.options.length; j++) {
            const opt = q.options[j];
            await query(
              `INSERT INTO question_options (question_id, text, image_url, is_correct, option_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [questionId, opt.text || null, opt.image_url || null, opt.is_correct || false, j + 1]
            );
          }
        }

        // Insert acceptable answers
        if (q.acceptable_answers && Array.isArray(q.acceptable_answers)) {
          for (const answer of q.acceptable_answers) {
            await query(
              `INSERT INTO acceptable_answers (question_id, value, numeric_tolerance)
               VALUES ($1, $2, $3)`,
              [questionId, answer.value, answer.numeric_tolerance || null]
            );
          }
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({ index: i, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json(result, { status: result.failed > 0 ? 207 : 201 });
  } catch (error) {
    console.error('Error in batch upload:', error);
    return NextResponse.json({ error: 'Failed to process batch upload' }, { status: 500 });
  }
}

