'use client';

import { useState, useEffect } from 'react';
import { tenantService, type TenantData } from '@/lib/services/tenant.service';
import {
  Settings,
  Building,
  Mail,
  Globe,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Clock,
  Languages,
  DollarSign,
  Bell,
  Copy,
  Camera,
  ImageIcon,
  Check,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { useToast } from '../../../../components/school';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);

  // School profile state
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  // Regional settings
  const [regionalSettings, setRegionalSettings] = useState({
    timezone: 'UTC+0',
    currency: 'USD',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    loginAlerts: true,
    autoLogoutMinutes: '30',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    attendance: true,
    fees: true,
    reports: true,
    system: false,
  });

  useEffect(() => {
    fetchSchoolInfo();
  }, []);

  const fetchSchoolInfo = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getCurrentTenant();
      setSchoolInfo({
        name: data.schoolName || '',
        code: data.schoolCode || '',
        email: data.contactEmail || '',
        phone: data.contactPhone || '',
        address: data.address || '',
        website: '',
      });
    } catch (err) {
      console.error('Failed to fetch school info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showToast('success', 'School information updated successfully!');
      await fetchSchoolInfo();
    } catch (err) {
      console.error('Failed to update school info:', err);
      showToast('error', 'Failed to update school information');
    }
  };

  const handleSaveRegional = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Regional settings saved successfully!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (securitySettings.newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    showToast('success', 'Password changed successfully!');
    setSecuritySettings(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(schoolInfo.code);
    setCodeCopied(true);
    showToast('success', 'School code copied to clipboard');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDateFormatExample = (format: string) => {
    switch (format) {
      case 'MM/DD/YYYY': return '12/31/2024';
      case 'DD/MM/YYYY': return '31/12/2024';
      case 'YYYY-MM-DD': return '2024-12-31';
      default: return '';
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] bg-white text-slate-900 transition-all text-sm';
  const selectClass = 'w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] bg-white text-slate-900 transition-all text-sm appearance-none';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      {/* ─── Section 1: School Profile ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">School Profile</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage your school&apos;s public information and branding.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Public Visible
          </span>
        </div>

        {/* Logo Upload Area */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#824ef2] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#6b3fd4] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">School Logo</p>
            <p className="text-xs text-slate-500 mt-0.5">Recommended size 400×400px. JPG, PNG or SVG. Max 2MB.</p>
            <div className="flex items-center gap-3 mt-2">
              <button className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors">
                Upload New
              </button>
              <button className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* School Name + School Code row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">School Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  required
                  className={`${inputClass} pl-10`}
                  placeholder="Enter school name"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">School Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={schoolInfo.code}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, code: e.target.value })}
                  className={`${inputClass} pr-10`}
                  placeholder="e.g. SCH001"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#824ef2] transition-colors"
                  title="Copy to clipboard"
                >
                  {codeCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
            <textarea
              value={schoolInfo.address}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Enter full school address"
            />
          </div>

          {/* Website URL + Contact Email row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={schoolInfo.website}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })}
                  placeholder="https://www.yourschool.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={schoolInfo.email}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                  placeholder="admin@yourschool.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => fetchSchoolInfo()}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* ─── Section 2: Regional & System ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Regional & System</h2>
          <p className="text-sm text-slate-500 mt-0.5">Configure timezones, currencies and localization.</p>
        </div>

        <form onSubmit={handleSaveRegional} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Timezone</span>
              </label>
              <select
                value={regionalSettings.timezone}
                onChange={(e) => setRegionalSettings({ ...regionalSettings, timezone: e.target.value })}
                className={selectClass}
              >
                <option value="UTC-12">UTC-12:00</option>
                <option value="UTC-8">UTC-08:00 (Pacific)</option>
                <option value="UTC-5">UTC-05:00 (Eastern)</option>
                <option value="UTC+0">UTC+00:00 (GMT)</option>
                <option value="UTC+1">UTC+01:00 (CET)</option>
                <option value="UTC+3">UTC+03:00 (EAT)</option>
                <option value="UTC+5.5">UTC+05:30 (IST)</option>
                <option value="UTC+8">UTC+08:00 (CST)</option>
                <option value="UTC+9">UTC+09:00 (JST)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">Current time: {getCurrentTime()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Default Currency</span>
              </label>
              <select
                value={regionalSettings.currency}
                onChange={(e) => setRegionalSettings({ ...regionalSettings, currency: e.target.value })}
                className={selectClass}
              >
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="KES">KES - Kenyan Shilling (KSh)</option>
                <option value="NGN">NGN - Nigerian Naira (₦)</option>
                <option value="INR">INR - Indian Rupee (₹)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">Used for fee collection and financial reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Platform Language</span>
              </label>
              <select
                value={regionalSettings.language}
                onChange={(e) => setRegionalSettings({ ...regionalSettings, language: e.target.value })}
                className={selectClass}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="Swahili">Swahili</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
              <select
                value={regionalSettings.dateFormat}
                onChange={(e) => setRegionalSettings({ ...regionalSettings, dateFormat: e.target.value })}
                className={selectClass}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY ({getDateFormatExample('MM/DD/YYYY')})</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY ({getDateFormatExample('DD/MM/YYYY')})</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD ({getDateFormatExample('YYYY-MM-DD')})</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* ─── Section 3: Security Settings ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage password policies and authentication methods.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Secure Mode Active
          </span>
        </div>

        {/* Change Admin Password */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-slate-600" /> Change Admin Password
          </h3>
          <form onSubmit={handleChangePassword}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={securitySettings.currentPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securitySettings.confirmPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-3 text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Security Toggles */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to admin accounts</p>
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={securitySettings.twoFactorAuth}
                onChange={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
              />
              <span
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  securitySettings.twoFactorAuth ? 'bg-[#824ef2]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                    securitySettings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </label>
          </div>

          {/* Unrecognized Login Alerts */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Unrecognized Login Alerts</p>
                <p className="text-xs text-slate-500 mt-0.5">Get notified when someone logs in from a new device or location</p>
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={securitySettings.loginAlerts}
                onChange={() => setSecuritySettings(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
              />
              <span
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  securitySettings.loginAlerts ? 'bg-[#824ef2]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                    securitySettings.loginAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </label>
          </div>

          {/* Auto-Logout Timer */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Timer className="w-4.5 h-4.5 text-[#824ef2]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Auto-Logout Timer</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically log out after a period of inactivity</p>
              </div>
            </div>
            <select
              value={securitySettings.autoLogoutMinutes}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, autoLogoutMinutes: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="120">2 Hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Section 4: Notification Preferences ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
          <p className="text-sm text-slate-500 mt-0.5">Configure how and when you receive notifications.</p>
        </div>

        <div className="space-y-4">
          {([
            { key: 'email' as const, label: 'Email Notifications', description: 'Receive important updates via email', icon: Mail, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
            { key: 'sms' as const, label: 'SMS Notifications', description: 'Get text messages for urgent alerts', icon: Bell, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
            { key: 'attendance' as const, label: 'Attendance Alerts', description: 'Notify when attendance drops below threshold', icon: Clock, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
            { key: 'fees' as const, label: 'Fee Reminders', description: 'Send automatic fee payment reminders', icon: DollarSign, iconBg: 'bg-purple-100', iconColor: 'text-[#824ef2]' },
            { key: 'reports' as const, label: 'Report Cards', description: 'Notify parents when report cards are available', icon: Building, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
            { key: 'system' as const, label: 'System Updates', description: 'Get notified about platform updates', icon: Settings, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
          ]).map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={notifications[item.key]}
                  onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                />
                <span
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    notifications[item.key] ? 'bg-[#824ef2]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                      notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={() => showToast('success', 'Notification preferences saved!')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </section>
  );
}
