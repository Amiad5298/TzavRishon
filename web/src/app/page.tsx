import { Metadata } from 'next';
import HomeClient from './home-client';
import LayoutNext from '@/components/LayoutNext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'הכנה לצו ראשון - תרגול חכם ותוצאות מהר',
  description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון. תרגול שאלות בחינם באנלוגיה צורנית, אנלוגיה מילולית, חשיבה כמותית והוראות וכיוונים. מבחנים מלאים ומעקב התקדמות אישי.',
  keywords: [
    'צו ראשון',
    'הכנה לצו ראשון',
    'הכנה לצו ראשון בחינם',
    'מבחן צו ראשון',
    'אנלוגיה צורנית',
    'אנלוגיה מילולית',
    'חשיבה כמותית',
    'הוראות וכיוונים',
    'דפר',
    'ציון דפר',
    'מבחן פסיכוטכני',
    'תרגול צו ראשון',
  ],
  openGraph: {
    title: 'הכנה לצו ראשון - תרגול חכם ותוצאות מהר',
    description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון. תרגול שאלות בחינם, מבחנים מלאים ומעקב התקדמות אישי.',
    type: 'website',
    locale: 'he_IL',
    siteName: 'TzavRishon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'הכנה לצו ראשון - תרגול חכם ותוצאות מהר',
    description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון',
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'TzavRishon',
    description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון',
    url: 'https://tzavrishonplus.co.il',
    sameAs: [],
    offers: {
      '@type': 'Offer',
      category: 'Educational',
      priceCurrency: 'ILS',
      price: '0',
      availability: 'https://schema.org/InStock',
    },
    educationalCredentialAwarded: 'Tzav Rishon Preparation',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LayoutNext>
        <HomeClient />
      </LayoutNext>
    </>
  );
}

