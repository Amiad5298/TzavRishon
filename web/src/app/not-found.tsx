import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'עמוד לא נמצא - 404',
  description: 'העמוד שחיפשת לא נמצא',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center">
        <h1 className="text-9xl font-black text-white/10 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">העמוד לא נמצא</h2>
        <p className="text-white/60 mb-8 text-lg">
          מצטערים, העמוד שחיפשת לא קיים או הוסר
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-accent-600/60 transition-all duration-300"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}

