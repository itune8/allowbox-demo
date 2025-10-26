'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlatformPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/platform/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
}
