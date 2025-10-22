'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { ROLE_DASHBOARDS } from '@repo/config';
import Link from 'next/link';
import { AuthLayout } from '../../../components/auth-layout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Redirect already logged-in users
  useEffect(() => {
    if (user && !authLoading && mounted && !isSubmitting) {
      const userRole = user.roles?.[0] || 'tenant_admin';
      const dashboardPath = ROLE_DASHBOARDS[userRole as keyof typeof ROLE_DASHBOARDS] || '/school';

      console.log('User already logged in. Redirecting to:', dashboardPath);
      router.replace(dashboardPath);
    }
  }, [user, authLoading, mounted, isSubmitting, router]);

  // Redirect after successful login
  useEffect(() => {
    if (shouldRedirect && user && !authLoading) {
      const userRole = user.roles?.[0] || 'tenant_admin';
      const dashboardPath = ROLE_DASHBOARDS[userRole as keyof typeof ROLE_DASHBOARDS] || '/school';

      console.log('Login successful. Redirecting user with role:', userRole, 'to:', dashboardPath);
      router.push(dashboardPath);
    }
  }, [shouldRedirect, user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password, rememberMe);
      // User state will be updated by auth context
      // Trigger redirect via useEffect
      setShouldRedirect(true);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      setIsSubmitting(false);
    }
  };

  // Social login placeholder intentionally removed (unused)

  return (
    <AuthLayout>
      {/* Redirect on successful auth */}
      {user && (
        <Redirector user={user} />
      )}
      <div
        className={`transition-all duration-500 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Login to your account
          </h2>
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-gray-900 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

       

        {/* Email/Password Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/auth/forgot_password"
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 font-medium"
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Test Accounts Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Test Accounts (Mock Mode):</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>Super Admin: admin@allowbox.app</li>
            <li>School Admin: school@example.com</li>
            <li>Teacher: teacher@example.com</li>
            <li>Parent: parent@example.com</li>
          </ul>
          <p className="text-xs italic text-gray-500 mt-2">Password: any</p>
        </div>
      </div>
    </AuthLayout>
  );
}

function Redirector({ user }: { user: { roles: string[] } }) {
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    const primaryRole = user.roles[0] as keyof typeof ROLE_DASHBOARDS;
    const dashboardPath = ROLE_DASHBOARDS[primaryRole] || '/platform';
    router.replace(dashboardPath);
  }, [user, router]);
  return null;
}
