'use client';

import { useState } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { useToast } from '../../../../components/school';
import {
  Settings,
  User,
  Bell,
  Lock,
  Heart,
  Loader2,
  Users,
  Phone,
  Droplets,
  AlertTriangle,
} from 'lucide-react';

// --- Mock data ---
const MOCK_CHILDREN = [
  {
    id: 'child-1',
    name: 'Aarav Sharma',
    class: 'Grade 5 - Section A',
    allergies: 'Peanuts, Dust',
    bloodGroup: 'B+',
    conditions: 'Mild asthma',
    emergencyContact: '+91 98765 43210',
  },
  {
    id: 'child-2',
    name: 'Ananya Sharma',
    class: 'Grade 3 - Section B',
    allergies: 'None',
    bloodGroup: 'O+',
    conditions: 'None',
    emergencyContact: '+91 98765 43210',
  },
];

export default function ParentSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Profile
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('12, MG Road, Bangalore 560001');

  // Children medical
  const [childrenMedical, setChildrenMedical] = useState(
    MOCK_CHILDREN.map((c) => ({
      ...c,
    }))
  );

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [feeReminders, setFeeReminders] = useState(true);
  const [eventNotif, setEventNotif] = useState(true);
  const [homeworkAlerts, setHomeworkAlerts] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingMedical, setSavingMedical] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';
  const disabledInputClass =
    'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed';

  function handleSaveProfile() {
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      showToast('success', 'Profile updated successfully');
    }, 500);
  }

  function handleSaveMedical() {
    setSavingMedical(true);
    setTimeout(() => {
      setSavingMedical(false);
      showToast('success', 'Medical information saved');
    }, 500);
  }

  function handleSaveNotifications() {
    setSavingNotifs(true);
    setTimeout(() => {
      setSavingNotifs(false);
      showToast('success', 'Notification preferences updated');
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

  function updateChildMedical(index: number, field: string, value: string) {
    setChildrenMedical((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage your profile, children&apos;s medical info, and preferences
          </p>
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
            <p className="text-sm font-semibold text-slate-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500">Parent</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className={disabledInputClass}
                value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                className={disabledInputClass}
                value={user?.email || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home address"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* Children & Medical Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Heart className="w-5 h-5 text-[#824ef2]" />
          <h2 className="text-base font-semibold text-slate-900">
            Children &amp; Medical Information
          </h2>
        </div>

        <div className="space-y-6">
          {childrenMedical.map((child, index) => (
            <div
              key={child.id}
              className="border border-slate-100 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#824ef2] text-white flex items-center justify-center text-sm font-bold">
                  {child.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {child.name}
                  </p>
                  <p className="text-xs text-slate-500">{child.class}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                      Allergies
                    </span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={child.allergies}
                    onChange={(e) =>
                      updateChildMedical(index, 'allergies', e.target.value)
                    }
                    placeholder="e.g., Peanuts, Dust"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-red-500" />
                      Blood Group
                    </span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={child.bloodGroup}
                    onChange={(e) =>
                      updateChildMedical(index, 'bloodGroup', e.target.value)
                    }
                    placeholder="e.g., B+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Medical Conditions
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={child.conditions}
                    onChange={(e) =>
                      updateChildMedical(index, 'conditions', e.target.value)
                    }
                    placeholder="e.g., Asthma, Diabetes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      Emergency Contact
                    </span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={child.emergencyContact}
                    onChange={(e) =>
                      updateChildMedical(
                        index,
                        'emergencyContact',
                        e.target.value
                      )
                    }
                    placeholder="Emergency phone"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveMedical}
            disabled={savingMedical}
            className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingMedical && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Medical Info
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-[#824ef2]" />
          <h2 className="text-base font-semibold text-slate-900">
            Notifications
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              label: 'Email Notifications',
              value: emailNotif,
              setter: setEmailNotif,
            },
            {
              label: 'SMS Notifications',
              value: smsNotif,
              setter: setSmsNotif,
            },
            {
              label: 'Attendance Alerts',
              value: attendanceAlerts,
              setter: setAttendanceAlerts,
            },
            {
              label: 'Fee Reminders',
              value: feeReminders,
              setter: setFeeReminders,
            },
            {
              label: 'Event Notifications',
              value: eventNotif,
              setter: setEventNotif,
            },
            {
              label: 'Homework Alerts',
              value: homeworkAlerts,
              setter: setHomeworkAlerts,
            },
          ].map((pref) => (
            <label
              key={pref.label}
              className="flex items-center justify-between py-2 cursor-pointer"
            >
              <span className="text-sm text-slate-600">{pref.label}</span>
              <button
                type="button"
                onClick={() => pref.setter(!pref.value)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  pref.value ? 'bg-[#824ef2]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    pref.value ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveNotifications}
            disabled={savingNotifs}
            className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingNotifs && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Preferences
          </button>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                className={inputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
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
