'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { authService } from '@/lib/services/auth.service';
import { Portal } from '../portal';

interface FirstLoginResetPasswordModalProps {
  email: string;
  currentPassword: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function FirstLoginResetPasswordModal({
  email,
  currentPassword,
  onSuccess,
  onCancel,
}: FirstLoginResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setError(null);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from the current password');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email,
        oldPassword: currentPassword,
        newPassword,
      });

      alert('Password reset successfully! You can now use your new password to login.');
      onSuccess();
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 overflow-y-auto pt-20 pb-20" onClick={onCancel}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-zoom-in" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-600">
            This is your first login. Please set a new password to continue.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleResetPassword();
                }
              }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Password Requirements:</strong>
              <br />• At least 8 characters long
              <br />• Must be different from your current password
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-center text-gray-500">
          For security reasons, you must change your password on first login
        </p>
      </div>
    </div>
    </Portal>
  );
}
