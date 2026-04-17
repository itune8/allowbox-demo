'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function DemoRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Demo error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Something went wrong in the demo
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          The demo environment hit an unexpected error. Try again, or restart
          from the beginning.
        </p>
        {error.digest && (
          <p className="text-[11px] text-slate-400 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-[#824ef2] text-white text-sm font-medium hover:bg-[#6b3dd1] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Restart demo
          </Link>
        </div>
      </div>
    </div>
  );
}
