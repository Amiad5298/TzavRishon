import type { Question } from '@/api/types';
import type { PracticeQuestion, QuestionType, Choice } from '@/components/AdvancedPracticeScreen';

/**
 * Map backend type enum to frontend QuestionType
 */
const mapQuestionType = (backendType: string): QuestionType => {
  const typeMap: Record<string, QuestionType> = {
    'SHAPE_ANALOGY': 'visualAnalogy',
    'VERBAL_ANALOGY': 'verbalAnalogy',
    'QUANTITATIVE': 'quantitative',
    'INSTRUCTIONS_DIRECTIONS': 'directions',
  };
  
  const mappedType = typeMap[backendType];
  if (!mappedType) {
    console.warn(`Unknown question type: ${backendType}, defaulting to verbalAnalogy`);
    return 'verbalAnalogy';
  }
  
  return mappedType;
};

/**
 * Transform backend Question to component's PracticeQuestion interface
 * 
 * @param question - Backend Question object
 * @param correctChoiceId - Optional correct answer ID (for showing results)
 * @param explanation - Optional explanation text
 * @returns PracticeQuestion formatted for AdvancedPracticeScreen
 * @throws Error if question doesn't have exactly 4 choices
 */
export const mapQuestionToPracticeQuestion = (
  question: Question,
  correctChoiceId?: string,
  explanation?: string
): PracticeQuestion => {
  // Validate that we have exactly 4 options
  if (!question.options || question.options.length !== 4) {
    throw new Error(
      `Question ${question.id} must have exactly 4 options, got ${question.options?.length || 0}`
    );
  }

  // Sort options by optionOrder to ensure consistent A-D ordering
  const sortedOptions = [...question.options].sort((a, b) => a.optionOrder - b.optionOrder);

  // Map to Choice format with A-D labels
  const choices: [Choice, Choice, Choice, Choice] = [
    {
      id: 'A',
      label: sortedOptions[0].text,
      imageUrl: sortedOptions[0].imageUrl,
    },
    {
      id: 'B',
      label: sortedOptions[1].text,
      imageUrl: sortedOptions[1].imageUrl,
    },
    {
      id: 'C',
      label: sortedOptions[2].text,
      imageUrl: sortedOptions[2].imageUrl,
    },
    {
      id: 'D',
      label: sortedOptions[3].text,
      imageUrl: sortedOptions[3].imageUrl,
    },
  ];

  // Map correct choice ID if provided
  let mappedCorrectChoiceId: string | undefined;
  if (correctChoiceId) {
    const correctIndex = sortedOptions.findIndex(opt => opt.id === correctChoiceId);
    if (correctIndex !== -1) {
      mappedCorrectChoiceId = ['A', 'B', 'C', 'D'][correctIndex];
    }
  }

  // Handle assets for visual analogy questions
  const assets: string[] | undefined = 
    question.type === 'SHAPE_ANALOGY' && question.promptImageUrl
      ? [question.promptImageUrl]
      : undefined;

  return {
    id: question.id,
    type: mapQuestionType(question.type),
    stem: question.promptText || 'שאלה ללא טקסט',
    assets,
    choices,
    correctChoiceId: mappedCorrectChoiceId,
    explanation,
  };
};

/**
 * Map a choice ID (A-D) back to the backend option ID
 * 
 * @param choiceId - Frontend choice ID ('A', 'B', 'C', or 'D')
 * @param question - Backend Question object
 * @returns Backend option ID
 */
export const mapChoiceIdToOptionId = (choiceId: string, question: Question): string => {
  if (!question.options) {
    throw new Error(`Question ${question.id} has no options`);
  }

  const sortedOptions = [...question.options].sort((a, b) => a.optionOrder - b.optionOrder);
  const choiceIndex = ['A', 'B', 'C', 'D'].indexOf(choiceId);
  
  if (choiceIndex === -1 || choiceIndex >= sortedOptions.length) {
    throw new Error(`Invalid choice ID: ${choiceId}`);
  }

  return sortedOptions[choiceIndex].id;
};

