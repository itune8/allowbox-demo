'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { SlideSheet, SheetSection } from '../../../components/ui';
import {
  Settings,
  Building2,
  DollarSign,
  Shield,
  Bell,
  CreditCard,
  Sliders,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultPlan: string;
  trialDuration: number;
  studentPricing: number;
  emailNotifications: boolean;
  slackIntegration: boolean;
  autoSuspendNonPayment: boolean;
  suspensionGracePeriod: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxStudentsPerSchool: number;
  apiRateLimit: number;
}

const defaultSettings: PlatformSettings = {
  platformName: 'AllowBox Platform',
  supportEmail: 'support@allowbox.app',
  defaultPlan: 'basic',
  trialDuration: 14,
  studentPricing: 1,
  emailNotifications: true,
  slackIntegration: false,
  autoSuspendNonPayment: true,
  suspensionGracePeriod: 7,
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxStudentsPerSchool: 5000,
  apiRateLimit: 1000,
};

const STORAGE_KEY = 'platform_settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    setHasChanges(false);
    setShowResetConfirm(false);
    setSaveMessage({ type: 'success', text: 'Settings reset to defaults.' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const inputClassName = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Platform Settings</h1>
          <p className="text-slate-500 mt-1">Configure platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
          )}
          <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveMessage.text}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-slate-100">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => updateSetting('platformName', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => updateSetting('supportEmail', e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* Platform Control */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-slate-100">
            <Shield className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Platform Control</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Maintenance Mode</p>
              <p className="text-sm text-slate-500">When enabled, only admins can access the platform</p>
            </div>
            <button
              onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Allow New School Registrations</p>
              <p className="text-sm text-slate-500">Enable or disable new school sign-ups</p>
            </div>
            <button
              onClick={() => updateSetting('allowNewRegistrations', !settings.allowNewRegistrations)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowNewRegistrations ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowNewRegistrations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-slate-100">
            <DollarSign className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Pricing & Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Plan for New Schools</label>
            <select
              value={settings.defaultPlan}
              onChange={(e) => updateSetting('defaultPlan', e.target.value)}
              className={inputClassName}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trial Duration (days)</label>
            <input
              type="number"
              value={settings.trialDuration}
              onChange={(e) => updateSetting('trialDuration', parseInt(e.target.value) || 0)}
              min={0}
              max={90}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Price per Student (USD/month)</label>
            <input
              type="number"
              value={settings.studentPricing}
              onChange={(e) => updateSetting('studentPricing', parseFloat(e.target.value) || 0)}
              step="0.01"
              min={0}
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-slate-100">
            <Sliders className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Platform Limits</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max Students per School</label>
            <input
              type="number"
              value={settings.maxStudentsPerSchool}
              onChange={(e) => updateSetting('maxStudentsPerSchool', parseInt(e.target.value) || 0)}
              min={100}
              step={100}
              className={inputClassName}
            />
            <p className="text-xs text-slate-500 mt-1">Maximum number of students allowed per school</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">API Rate Limit (requests/min)</label>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value) || 0)}
              min={100}
              step={100}
              className={inputClassName}
            />
            <p className="text-xs text-slate-500 mt-1">Maximum API requests per minute per tenant</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Notifications & Integrations</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-500">Receive email alerts for important events</p>
            </div>
            <button
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Slack Integration</p>
              <p className="text-sm text-slate-500">Send notifications to Slack</p>
            </div>
            <button
              onClick={() => updateSetting('slackIntegration', !settings.slackIntegration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.slackIntegration ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.slackIntegration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Billing & Suspension */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-slate-100">
            <CreditCard className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Billing & Suspension</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Auto-suspend for Non-payment</p>
              <p className="text-sm text-slate-500">Automatically suspend schools with overdue payments</p>
            </div>
            <button
              onClick={() => updateSetting('autoSuspendNonPayment', !settings.autoSuspendNonPayment)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoSuspendNonPayment ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSuspendNonPayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-2">Suspension Grace Period (days)</label>
            <input
              type="number"
              value={settings.suspensionGracePeriod}
              onChange={(e) => updateSetting('suspensionGracePeriod', parseInt(e.target.value) || 0)}
              min={0}
              max={30}
              className={inputClassName}
            />
            <p className="text-xs text-slate-500 mt-1">Days before suspension after payment is overdue</p>
          </div>
        </div>
      </div>

      {/* Mobile Save Button */}
      <div className="md:hidden pb-6">
        <Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Reset Confirmation SlideSheet */}
      <SlideSheet
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset to Defaults?"
        subtitle="This will reset all settings to their default values"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Reset Settings
            </Button>
          </div>
        }
      >
        <SheetSection>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-slate-600">
              This action cannot be undone. All your customized settings will be restored to their default values.
            </p>
          </div>
        </SheetSection>
      </SlideSheet>
    </div>
  );
}
