'use client';

import { useState } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { useToast } from '../../../../components/school';
import {
  Settings,
  User,
  Bell,
  Lock,
  Loader2,
} from 'lucide-react';

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Profile
  const [phone, setPhone] = useState('9876543210');
  const [specialization, setSpecialization] = useState('Mathematics, Physics');

  // Preferences
  const [language, setLanguage] = useState('english');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [attendanceReminder, setAttendanceReminder] = useState(true);
  const [homeworkAlerts, setHomeworkAlerts] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  function handleSaveProfile() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('success', 'Profile updated successfully');
    }, 500);
  }

  function handleUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    showToast('success', 'Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';
  const disabledInputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed';

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-[#824ef2]" />
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
        </div>

        {/* Profile Photo */}
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <User className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-[10px] text-slate-400 mt-0.5">Upload</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500">Teacher</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input type="text" className={disabledInputClass} value={`${user?.firstName || ''} ${user?.lastName || ''}`} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" className={disabledInputClass} value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="text" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject Specialization</label>
              <input type="text" className={inputClass} value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Mathematics, Physics" />
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-[#824ef2]" />
          <h2 className="text-base font-semibold text-slate-900">Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
              <select className={`${inputClass} cursor-pointer`} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Format</label>
              <select className={`${inputClass} cursor-pointer`} value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { label: 'Email Notifications', value: emailNotif, setter: setEmailNotif },
                { label: 'SMS Notifications', value: smsNotif, setter: setSmsNotif },
                { label: 'Attendance Reminders', value: attendanceReminder, setter: setAttendanceReminder },
                { label: 'Homework Alerts', value: homeworkAlerts, setter: setHomeworkAlerts },
              ].map((pref) => (
                <label key={pref.label} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm text-slate-600">{pref.label}</span>
                  <button
                    type="button"
                    onClick={() => pref.setter(!pref.value)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${pref.value ? 'bg-[#824ef2]' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${pref.value ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-[#824ef2]" />
          <h2 className="text-base font-semibold text-slate-900">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input type="password" className={inputClass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={handleUpdatePassword}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
