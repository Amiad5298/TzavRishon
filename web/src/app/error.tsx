'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-white mb-4">משהו השתבש</h2>
        <p className="text-white/60 mb-8 text-lg">
          מצטערים, אירעה שגיאה בלתי צפויה. אנא נסה שוב.
        </p>
        <button
          onClick={reset}
          className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-accent-600/60 transition-all duration-300"
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
}

