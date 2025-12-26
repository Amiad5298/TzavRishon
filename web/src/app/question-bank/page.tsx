import { Metadata } from 'next';
import QuestionBankClient from './question-bank-client';
export const dynamic = 'force-dynamic';
import LayoutNext from '@/components/LayoutNext';

export const metadata: Metadata = {
  title: 'מאגר שאלות - TzavRishon',
  description: 'מאגר שאלות מתקדם למבחן צו ראשון. חיפוש, סינון ותרגול שאלות לפי קטגוריות, רמת קושי ונושאים.',
  keywords: ['מאגר שאלות', 'בנק שאלות', 'חיפוש שאלות', 'סינון שאלות'],
  openGraph: {
    title: 'מאגר שאלות - TzavRishon',
    description: 'מאגר שאלות מתקדם למבחן צו ראשון',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QuestionBankPage() {
  return (
    <LayoutNext>
      <QuestionBankClient />
    </LayoutNext>
  );
}

