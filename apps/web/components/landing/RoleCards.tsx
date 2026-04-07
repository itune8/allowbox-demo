'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { RoleCard } from './RoleCard';

type RoleKey = 'parent' | 'teacher';

interface RoleConfig {
  key: RoleKey;
  label: string;
  description: string;
  email: string;
  dashboardPath: string;
  Icon: typeof Users;
  accentColor: 'amber' | 'emerald';
}

const ROLES: RoleConfig[] = [
  {
    key: 'parent',
    label: 'Parent',
    description: "Track attendance, fees, homework, and your child's progress.",
    email: 'parent@example.com',
    dashboardPath: '/parent',
    Icon: Users,
    accentColor: 'amber',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Take attendance, assign homework, message parents.',
    email: 'teacher@example.com',
    dashboardPath: '/teacher',
    Icon: GraduationCap,
    accentColor: 'emerald',
  },
];

export function RoleCards() {
  const { login } = useAuth();
  const router = useRouter();
  const [expanding, setExpanding] = useState<RoleKey | null>(null);

  const handleEnter = async (role: RoleConfig) => {
    if (expanding) return;
    setExpanding(role.key);

    // Safety timeout: if anything hangs, reset landing after 3s
    const safety = setTimeout(() => {
      console.error('[landing] transition safety timeout fired');
      setExpanding(null);
    }, 3000);

    try {
      // 80ms micro-bounce delay (handled by CSS animate-card-enter),
      // but we kick off login immediately so state is ready by the time we route.
      await login(role.email, 'demo123');
      // Wait for the zoom-fade to complete visually before routing.
      await new Promise((r) => setTimeout(r, 480));
      router.push(role.dashboardPath);
    } finally {
      clearTimeout(safety);
    }
  };

  return (
    <>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-6">
        {ROLES.map((role, i) => (
          <div
            key={role.key}
            className="animate-slide-in-bottom"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
          >
            <RoleCard
              label={role.label}
              description={role.description}
              Icon={role.Icon}
              accentColor={role.accentColor}
              isExpanding={expanding === role.key}
              siblingIsExpanding={expanding !== null && expanding !== role.key}
              onEnter={() => handleEnter(role)}
            />
          </div>
        ))}
      </div>

      {/* Full-screen white transition overlay */}
      {expanding && (
        <div
          className="fixed inset-0 z-50 bg-white pointer-events-none animate-fade-in-700"
          aria-hidden
        />
      )}
    </>
  );
}
