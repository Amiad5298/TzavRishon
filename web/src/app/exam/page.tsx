import { Metadata } from 'next';
import ExamClient from './exam-client';
export const dynamic = 'force-dynamic';
import LayoutNext from '@/components/LayoutNext';

export const metadata: Metadata = {
  title: 'מבחן מלא - TzavRishon',
  description: 'מבחן מלא סימולציה של מבחן צו ראשון. מבחן מתוזמן עם כל הקטגוריות: אנלוגיה צורנית, אנלוגיה מילולית, חשיבה כמותית והוראות וכיוונים.',
  keywords: ['מבחן צו ראשון', 'מבחן מלא', 'סימולציה', 'מבחן מתוזמן', 'דפר'],
  openGraph: {
    title: 'מבחן מלא - TzavRishon',
    description: 'מבחן מלא סימולציה של מבחן צו ראשון עם תזמון אמיתי',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ExamPage() {
  return (
    <LayoutNext>
      <ExamClient />
    </LayoutNext>
  );
}

