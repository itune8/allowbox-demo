'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'AllowBox Platform',
    supportEmail: 'support@allowbox.app',
    defaultPlan: 'basic',
    trialDuration: 14,
    studentPricing: 1,
    emailNotifications: true,
    slackIntegration: false,
    autoSuspendNonPayment: true,
    suspensionGracePeriod: 7,
  });

  const handleSave = () => {
    alert('Settings saved successfully! (This is a demo)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          General Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Pricing & Plans
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Plan for New Schools
            </label>
            <select
              value={settings.defaultPlan}
              onChange={(e) => setSettings({ ...settings, defaultPlan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trial Duration (days)
            </label>
            <input
              type="number"
              value={settings.trialDuration}
              onChange={(e) => setSettings({ ...settings, trialDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price per Student (USD/month)
            </label>
            <input
              type="number"
              value={settings.studentPricing}
              onChange={(e) => setSettings({ ...settings, studentPricing: parseFloat(e.target.value) })}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notifications & Integrations
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive email alerts for important events</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Slack Integration</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Send notifications to Slack</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, slackIntegration: !settings.slackIntegration })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.slackIntegration ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Billing & Suspension
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-suspend for Non-payment</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically suspend schools with overdue payments</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoSuspendNonPayment: !settings.autoSuspendNonPayment })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoSuspendNonPayment ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSuspendNonPayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suspension Grace Period (days)
            </label>
            <input
              type="number"
              value={settings.suspensionGracePeriod}
              onChange={(e) => setSettings({ ...settings, suspensionGracePeriod: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
