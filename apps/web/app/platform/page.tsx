'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PlatformPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/platform/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          duration: 0.5,
          rotate: { duration: 1, repeat: Infinity, ease: 'linear' }
        }}
      >
        <Loader2 className="h-12 w-12 text-indigo-600" />
      </motion.div>
    </div>
  );
}
