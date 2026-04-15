'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  readPortalBlob,
  portalLabels,
  portalRoutes,
  type DemoPortalKey,
} from '../../../../lib/demo-storage';

// Maps each portal to the auto-login credentials the existing demo seed uses.
const PORTAL_CREDENTIALS: Record<DemoPortalKey, { email: string; password: string }> = {
  parent: { email: 'parent@example.com', password: 'demo123' },
  teacher: { email: 'teacher@example.com', password: 'demo123' },
  school: { email: 'admin@example.com', password: 'demo123' },
  platform: { email: 'superadmin@example.com', password: 'demo123' },
};

const WELCOME_MS = 2500;

export default function DemoWelcomePage() {
  const params = useParams();
  const router = useRouter();
  const { login, patchUser } = useAuth();
  const portal = params?.portal as DemoPortalKey | undefined;
  const [name, setName] = useState<string | null>(null);

  // Hold login + patchUser in refs so the effect's deps don't churn when auth
  // context re-renders (which would cancel the redirect timeout).
  const loginRef = useRef(login);
  loginRef.current = login;
  const patchRef = useRef(patchUser);
  patchRef.current = patchUser;

  useEffect(() => {
    if (!portal || !portalLabels[portal]) {
      router.replace('/');
      return;
    }

    const blob = readPortalBlob(portal);
    if (!blob) {
      router.replace(`/demo/form/${portal}`);
      return;
    }
    setName(blob.name);

    // Kick off auto-login in parallel so it's ready by the time the animation ends.
    const creds = PORTAL_CREDENTIALS[portal];
    (async () => {
      try {
        await loginRef.current(creds.email, creds.password);
      } catch {
        // If demo login fails the banner will still show but protected routes
        // will redirect. Continue — don't block the animation.
      }
      // Overlay the visitor's typed name on top of the seeded demo user so
      // every dashboard greeting (user.firstName) reads as personalized.
      const parts = blob.name.trim().split(/\s+/);
      patchRef.current({
        firstName: parts[0] || blob.name,
        lastName: parts.slice(1).join(' ') || '',
      } as any);
    })();

    // Use a plain setTimeout that fires regardless of re-renders — deps are
    // intentionally scoped to just portal so we don't cancel mid-animation.
    const t = setTimeout(() => {
      router.replace(portalRoutes[portal]);
    }, WELCOME_MS);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal]);

  if (!portal || !portalLabels[portal]) return null;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#1a0d3d] via-[#2d1464] to-[#1a0d3d] flex items-center justify-center p-6 overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            initial={{ opacity: 0, y: 40, x: Math.random() * 100 - 50 }}
            animate={{ opacity: [0, 1, 0], y: -60 }}
            transition={{
              duration: 2 + Math.random() * 1.5,
              delay: Math.random() * 0.6,
              ease: 'easeOut',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${50 + Math.random() * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mx-auto mb-5 w-14 h-14 rounded-full bg-white/10 grid place-items-center backdrop-blur"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
        >
          Hey{' '}
          <span className="text-[#f7b955]">{name || 'there'}</span>
          ,
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
          className="mt-3 text-lg sm:text-xl text-white/80"
        >
          welcome to your{' '}
          <span className="font-semibold text-white">
            {portalLabels[portal]}
          </span>{' '}
          portal
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-white/60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          Setting things up…
        </motion.div>
      </div>
    </main>
  );
}
