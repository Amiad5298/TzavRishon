import { Metadata } from 'next';
import ProgressClient from './progress-client';
import LayoutNext from '@/components/LayoutNext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'סטטיסטיקות והתקדמות - TzavRishon',
  description: 'מעקב אחר ההתקדמות והביצועים שלך במבחני צו ראשון. צפה בסטטיסטיקות מפורטות, גרפים ודוחות התקדמות אישיים.',
  keywords: ['סטטיסטיקות', 'התקדמות', 'ביצועים', 'דוחות', 'מעקב'],
  openGraph: {
    title: 'סטטיסטיקות והתקדמות - TzavRishon',
    description: 'מעקב אחר ההתקדמות והביצועים שלך במבחני צו ראשון',
    type: 'website',
  },
  robots: {
    index: false, // Private page - no need to index
    follow: true,
  },
};

export default function ProgressPage() {
  return (
    <LayoutNext>
      <ProgressClient />
    </LayoutNext>
  );
}

