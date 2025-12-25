export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isPremium: boolean;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
  guestId?: string;
}

export interface Question {
  id: string;
  type: string;
  format: string;
  promptText?: string;
  promptImageUrl?: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text?: string;
  imageUrl?: string;
  optionOrder: number;
}

export interface PracticeSessionResponse {
  sessionId: string;
  type: string;
  questionsAvailable: number;
  limitReached: boolean;
}

export interface AnswerResponse {
  correct: boolean;
  explanation?: string;
}

export interface PracticeSummaryResponse {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeMs: number;
}

export interface ExamAttemptResponse {
  attemptId: string;
  sections: ExamSectionInfo[];
}

export interface ExamSectionInfo {
  sectionId: string;
  type: string;
  orderIndex: number;
  durationSeconds: number;
  locked: boolean;
}

export interface CurrentSectionResponse {
  sectionId: string;
  type: string;
  orderIndex: number;
  remainingTimeSeconds: number;
  expired: boolean;
  questions: Question[];
  answeredQuestionIds: string[];
}

export interface ExamSummaryResponse {
  totalScore90: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSeconds?: number;
  verbalAnalogy?: SectionScore;
  shapeAnalogy?: SectionScore;
  instructionsDirections?: SectionScore;
  quantitative?: SectionScore;
}

export interface SectionScore {
  correct: number;
  total: number;
  accuracy: number;
  timeSpentSeconds?: number;
}

export interface ProgressSummaryResponse {
  totalAttempts: number;
  overallAccuracy: number;
  avgTimePerQuestionMs: number;
  improvementPercent: number;
  statsByType: TypeStats[];
  recentAttempts: AttemptSummary[];
}

export interface TypeStats {
  type: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface AttemptSummary {
  attemptId: string;
  createdAt: string;
  score90: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface TrendResponse {
  trends: TrendPoint[];
}

export interface TrendPoint {
  date: string;
  type: string;
  accuracy: number;
}

export interface PracticeStatsResponse {
  statsByType: Record<string, TypePracticeStats>;
  dailyVolume: DailyPracticeVolume[];
  currentStreak: number;
  overallAccuracy: number;
  totalQuestions: number;
  avgTimePerQuestionMs: number;
}

export interface TypePracticeStats {
  type: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  avgTimeMs: number;
  masteryScore: number;
}

export interface DailyPracticeVolume {
  date: string;
  questionCount: number;
  accuracy: number;
}

export interface ExamAttemptListResponse {
  attempts: ExamAttemptListItem[];
}

export interface ExamAttemptListItem {
  attemptId: string;
  createdAt: string;
  score90: number;
  accuracy: number;
  durationSeconds: number;
  sections: Record<string, SectionBreakdown>;
}

export interface SectionBreakdown {
  answered: number;
  total: number;
  skipped: number;
  flagged: number;
  accuracy: number;
  timeSpentSeconds: number;
}

export type QuestionTypeFilter = 'all' | 'VERBAL_ANALOGY' | 'SHAPE_ANALOGY' | 'INSTRUCTIONS_DIRECTIONS' | 'QUANTITATIVE';

