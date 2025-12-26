import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/index.css';

export const metadata: Metadata = {
  title: {
    default: 'הכנה לצו ראשון - TzavRishon',
    template: '%s | TzavRishon',
  },
  description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון. תרגול שאלות, מבחנים מלאים, ומעקב התקדמות אישי.',
  keywords: ['צו ראשון', 'הכנה למבחן', 'אנלוגיה צורנית', 'אנלוגיה מילולית', 'חשיבה כמותית', 'הוראות וכיוונים'],
  authors: [{ name: 'TzavRishon' }],
  creator: 'TzavRishon',
  publisher: 'TzavRishon',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tzavrishonplus.co.il'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: '/',
    title: 'הכנה לצו ראשון - TzavRishon',
    description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון. תרגול שאלות, מבחנים מלאים, ומעקב התקדמות אישי.',
    siteName: 'TzavRishon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'הכנה לצו ראשון - TzavRishon',
    description: 'פלטפורמה מתקדמת להכנה למבחן צו ראשון',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification if available
    // google: 'your-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

