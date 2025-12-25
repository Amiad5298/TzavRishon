import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercent(num: number): string {
  return `${(num * 100).toFixed(1)}%`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  VERBAL_ANALOGY: 'Verbal Analogy',
  SHAPE_ANALOGY: 'Shape Analogy',
  INSTRUCTIONS_DIRECTIONS: 'Instructions & Directions',
  QUANTITATIVE: 'Quantitative',
};

export const QUESTION_TYPE_LABELS_HE: Record<string, string> = {
  VERBAL_ANALOGY: 'אנלוגיות מילוליות',
  SHAPE_ANALOGY: 'אנלוגיות צורניות',
  INSTRUCTIONS_DIRECTIONS: 'הוראות וכיוונים',
  QUANTITATIVE: 'כמותי',
};

export const QUESTION_TYPE_COLORS: Record<string, string> = {
  VERBAL_ANALOGY: '#8b5cf6',
  SHAPE_ANALOGY: '#06b6d4',
  INSTRUCTIONS_DIRECTIONS: '#f59e0b',
  QUANTITATIVE: '#10b981',
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

export const QUESTION_FORMAT_LABELS: Record<string, string> = {
  TEXT_INPUT: 'Text Input',
  SINGLE_CHOICE_IMAGE: 'Single Choice (Image)',
};

