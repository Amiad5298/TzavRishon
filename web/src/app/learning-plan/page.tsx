import { Metadata } from 'next';
import LearningPlanClient from './learning-plan-client';
import LayoutNext from '@/components/LayoutNext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'תוכנית למידה אישית - TzavRishon',
  description: 'תוכנית למידה מותאמת אישית למבחן צו ראשון. קבל המלצות מותאמות על סמך הביצועים והתקדמות שלך.',
  keywords: ['תוכנית למידה', 'למידה אישית', 'המלצות', 'תכנון לימודים'],
  openGraph: {
    title: 'תוכנית למידה אישית - TzavRishon',
    description: 'תוכנית למידה מותאמת אישית למבחן צו ראשון',
    type: 'website',
  },
  robots: {
    index: false, // Private page
    follow: true,
  },
};

export default function LearningPlanPage() {
  return (
    <LayoutNext>
      <LearningPlanClient />
    </LayoutNext>
  );
}

