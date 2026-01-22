'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, SlideSheet } from '@/components/ui';
import {
  Settings,
  Building2,
  DollarSign,
  Shield,
  Bell,
  CreditCard,
  Users,
  Clock,
  Mail,
  Sliders,
  Lock,
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

      // Simulate a small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });

      // Clear message after 3 seconds
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-b-2 border-gray-500"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon3D bgColor="bg-gray-500" size="lg">
            <Settings className="w-6 h-6" />
          </Icon3D>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
            <p className="text-gray-600 mt-1">
              Configure platform settings and preferences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {hasChanges && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-sm text-amber-600 font-medium"
              >
                Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
              Reset to Defaults
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Save Message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {saveMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D bgColor="bg-gray-500" size="md">
              <Building2 className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">
              General Settings
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => updateSetting('platformName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Platform Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D bgColor="bg-gray-500" size="md">
              <Shield className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">
              Platform Control
            </h3>
          </div>
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-600">
                  When enabled, only admins can access the platform
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <motion.span
                  animate={{
                    x: settings.maintenanceMode ? 24 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-block h-4 w-4 rounded-full bg-white"
                />
              </motion.button>
            </motion.div>
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Allow New School Registrations
                </p>
                <p className="text-sm text-gray-600">
                  Enable or disable new school sign-ups
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSetting('allowNewRegistrations', !settings.allowNewRegistrations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowNewRegistrations ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <motion.span
                  animate={{
                    x: settings.allowNewRegistrations ? 24 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-block h-4 w-4 rounded-full bg-white"
                />
              </motion.button>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Pricing Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D bgColor="bg-gray-500" size="md">
              <DollarSign className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">Pricing & Plans</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Plan for New Schools
              </label>
              <select
                value={settings.defaultPlan}
                onChange={(e) => updateSetting('defaultPlan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trial Duration (days)
              </label>
              <input
                type="number"
                value={settings.trialDuration}
                onChange={(e) => updateSetting('trialDuration', parseInt(e.target.value) || 0)}
                min={0}
                max={90}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Student (USD/month)
              </label>
              <input
                type="number"
                value={settings.studentPricing}
                onChange={(e) => updateSetting('studentPricing', parseFloat(e.target.value) || 0)}
                step="0.01"
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D bgColor="bg-gray-500" size="md">
              <Sliders className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">
              Platform Limits
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Students per School
              </label>
              <input
                type="number"
                value={settings.maxStudentsPerSchool}
                onChange={(e) => updateSetting('maxStudentsPerSchool', parseInt(e.target.value) || 0)}
                min={100}
                step={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of students allowed per school</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Rate Limit (requests/min)
              </label>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value) || 0)}
                min={100}
                step={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum API requests per minute per tenant</p>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D bgColor="bg-gray-500" size="md">
              <Bell className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications & Integrations
            </h3>
          </div>
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive email alerts for important events
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <motion.span
                  animate={{
                    x: settings.emailNotifications ? 24 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-block h-4 w-4 rounded-full bg-white"
                />
              </motion.button>
            </motion.div>
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Slack Integration</p>
                <p className="text-sm text-gray-600">Send notifications to Slack</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSetting('slackIntegration', !settings.slackIntegration)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.slackIntegration ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <motion.span
                  animate={{
                    x: settings.slackIntegration ? 24 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-block h-4 w-4 rounded-full bg-white"
                />
              </motion.button>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Billing & Suspension */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <GlassCard className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D bgColor="bg-gray-500" size="md">
              <CreditCard className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">
              Billing & Suspension
            </h3>
          </div>
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Auto-suspend for Non-payment
                </p>
                <p className="text-sm text-gray-600">
                  Automatically suspend schools with overdue payments
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSetting('autoSuspendNonPayment', !settings.autoSuspendNonPayment)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSuspendNonPayment ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <motion.span
                  animate={{
                    x: settings.autoSuspendNonPayment ? 24 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-block h-4 w-4 rounded-full bg-white"
                />
              </motion.button>
            </motion.div>
            <motion.div
              className="max-w-xs"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspension Grace Period (days)
              </label>
              <input
                type="number"
                value={settings.suspensionGracePeriod}
                onChange={(e) => updateSetting('suspensionGracePeriod', parseInt(e.target.value) || 0)}
                min={0}
                max={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Days before suspension after payment is overdue</p>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Mobile Save Button */}
      <motion.div
        className="md:hidden flex justify-end pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>
      </motion.div>

      {/* Reset Confirmation SlideSheet */}
      <SlideSheet
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset to Defaults?"
        subtitle="This will reset all settings to their default values"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                Reset Settings
              </Button>
            </motion.div>
          </div>
        }
      >
        <div className="flex items-center gap-3 mb-4">
          <Icon3D bgColor="bg-gray-500" size="md">
            <AlertCircle className="w-4 h-4" />
          </Icon3D>
          <p className="text-sm text-gray-600">
            This action cannot be undone. All your customized settings will be restored to their default values.
          </p>
        </div>
      </SlideSheet>
    </motion.div>
  );
}
