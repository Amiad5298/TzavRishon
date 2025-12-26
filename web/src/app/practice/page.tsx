import { Metadata } from 'next';
import PracticeClient from './practice-client';
import LayoutNext from '@/components/LayoutNext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'תרגול - TzavRishon',
  description: 'תרגול שאלות למבחן צו ראשון. בחרו קטגוריה והתחילו לתרגל: אנלוגיה צורנית, אנלוגיה מילולית, חשיבה כמותית והוראות וכיוונים.',
  keywords: ['תרגול צו ראשון', 'שאלות תרגול', 'אנלוגיה צורנית', 'אנלוגיה מילולית', 'חשיבה כמותית'],
  openGraph: {
    title: 'תרגול - TzavRishon',
    description: 'תרגול שאלות למבחן צו ראשון בכל הקטגוריות',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PracticePage() {
  return (
    <LayoutNext>
      <PracticeClient />
    </LayoutNext>
  );
}

