'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Portal } from '../../../components/portal';
import { CustomSelect, CustomDateInput } from '../../../components/platform';
import {
  Globe,
  Calendar,
  Shield,
  SlidersHorizontal,
  Receipt,
  Bell,
  Upload,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Ban,
  Send,
  Smartphone,
  FileText,
  Mail,
  X,
  AlertCircle,
  Tag,
  Landmark,
  Save,
  Pencil,
  Trash2,
} from 'lucide-react';

/* ---------- Types ---------- */
interface PlanData {
  id: string;
  name: string;
  price: number;
  trial: number;
  maxStudents: string;
  popular: boolean;
}

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  logoFile: string;
  currentSession: string;
  sessionStartDate: string;
  sessionEndDate: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxUsersPerSchool: number;
  maxStudentsPerSchool: number;
  apiRateLimit: number;
  autoSuspendNonPayment: boolean;
  gracePeriod: number;
  suspensionDelay: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  billingAlerts: boolean;
}

const defaultSettings: PlatformSettings = {
  platformName: 'AllowBox Platform',
  supportEmail: 'support@allowbox.app',
  logoFile: 'Current Logo.png',
  currentSession: '2024-2025',
  sessionStartDate: '2024-09-01',
  sessionEndDate: '2025-06-30',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false,
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxUsersPerSchool: 50,
  maxStudentsPerSchool: 5000,
  apiRateLimit: 1000,
  autoSuspendNonPayment: false,
  gracePeriod: 7,
  suspensionDelay: 3,
  emailNotifications: true,
  smsNotifications: false,
  billingAlerts: true,
};

const defaultPlans: PlanData[] = [
  { id: '1', name: 'Basic Plan', price: 29, trial: 14, maxStudents: '500', popular: false },
  { id: '2', name: 'Pro Plan', price: 59, trial: 30, maxStudents: '2,000', popular: true },
  { id: '3', name: 'Enterprise', price: 99, trial: 45, maxStudents: 'Unlimited', popular: false },
];

const PLANS_STORAGE_KEY = 'platform_plans_v1';

const planIcons: Record<number, { icon: React.ReactNode; iconBg: string; iconColor: string }> = {
  0: { icon: <Send className="w-5 h-5" />, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
  1: { icon: <Tag className="w-5 h-5" />, iconBg: 'bg-[#824ef2]', iconColor: 'text-white' },
  2: { icon: <Landmark className="w-5 h-5" />, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
};

type SidebarSection = 'branding' | 'academic' | 'security' | 'control' | 'billing';

const sidebarItems: { key: SidebarSection; label: string; icon: React.ReactNode }[] = [
  { key: 'branding', label: 'Branding', icon: <Globe className="w-4 h-4" /> },
  { key: 'academic', label: 'Academic Year', icon: <Calendar className="w-4 h-4" /> },
  { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { key: 'control', label: 'Platform Control', icon: <SlidersHorizontal className="w-4 h-4" /> },
  { key: 'billing', label: 'Billing & Suspension', icon: <Receipt className="w-4 h-4" /> },
];

const STORAGE_KEY = 'platform_settings_v2';

/* ---------- Toggle Component ---------- */
function Toggle({ enabled, onChange, color = 'purple' }: { enabled: boolean; onChange: () => void; color?: 'purple' | 'red' }) {
  const bgOn = color === 'red' ? 'bg-red-500' : 'bg-[#824ef2]';
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? bgOn : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

/* ---------- Section Card Wrapper ---------- */
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-6">
      {children}
    </div>
  );
}

/* ---------- Reset Confirmation Modal ---------- */
function ResetConfirmModal({ isOpen, onClose, onReset }: { isOpen: boolean; onClose: () => void; onReset: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Reset to Defaults?</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">This will reset all settings to their default values</p>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-slate-200">
            <button onClick={onClose} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onReset} className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Reset Settings</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ---------- Plan Modal (Create/Edit) ---------- */
function PlanModal({
  isOpen,
  onClose,
  onSubmit,
  plan,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PlanData, 'id'> & { id?: string }) => void;
  plan?: PlanData | null;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [trial, setTrial] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [popular, setPopular] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (plan) {
      setName(plan.name);
      setPrice(String(plan.price));
      setTrial(String(plan.trial));
      setMaxStudents(plan.maxStudents);
      setPopular(plan.popular);
    } else {
      setName('');
      setPrice('');
      setTrial('');
      setMaxStudents('');
      setPopular(false);
    }
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [isOpen, plan, onClose]);

  if (!isOpen) return null;

  const isEdit = !!plan;
  const canSubmit = name.trim() && price.trim() && trial.trim() && maxStudents.trim();

  return (
    <Portal>
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[480px] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Plan' : 'Create New Plan'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Plan Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pro Plan"
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($/mo per user)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="59"
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Trial Duration (Days)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={trial}
                  onChange={(e) => setTrial(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="30"
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Students</label>
              <input
                type="text"
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                placeholder="e.g. 2,000 or Unlimited"
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Mark as Popular</p>
                <p className="text-xs text-slate-500">Highlight this plan with a badge</p>
              </div>
              <Toggle enabled={popular} onChange={() => setPopular(!popular)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              onClick={() => {
                if (!canSubmit) return;
                onSubmit({
                  ...(plan ? { id: plan.id } : {}),
                  name: name.trim(),
                  price: parseFloat(price) || 0,
                  trial: parseInt(trial) || 0,
                  maxStudents: maxStudents.trim(),
                  popular,
                });
              }}
              disabled={!canSubmit}
              style={{ backgroundColor: '#824ef2' }}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {isEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ---------- Delete Plan Confirm Modal ---------- */
function DeletePlanModal({ isOpen, planName, onClose, onDelete }: { isOpen: boolean; planName: string; onClose: () => void; onDelete: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Delete Plan</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-50"><AlertCircle className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Are you sure you want to delete &ldquo;{planName}&rdquo;?</p>
                <p className="text-sm text-slate-500">Schools currently on this plan will need to be migrated. This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-slate-200">
            <button onClick={onClose} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onDelete} className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete Plan</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ---------- Main Page ---------- */
export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>('branding');
  const [plans, setPlans] = useState<PlanData[]>(defaultPlans);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [deletePlanModalOpen, setDeletePlanModalOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<PlanData | null>(null);
  const [numericFields, setNumericFields] = useState({
    maxUsersPerSchool: String(defaultSettings.maxUsersPerSchool),
    maxStudentsPerSchool: String(defaultSettings.maxStudentsPerSchool),
    apiRateLimit: String(defaultSettings.apiRateLimit),
    gracePeriod: String(defaultSettings.gracePeriod),
    suspensionDelay: String(defaultSettings.suspensionDelay),
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadSettings = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...defaultSettings, ...JSON.parse(saved) };
        setSettings(parsed);
        setNumericFields({
          maxUsersPerSchool: String(parsed.maxUsersPerSchool || ''),
          maxStudentsPerSchool: String(parsed.maxStudentsPerSchool || ''),
          apiRateLimit: String(parsed.apiRateLimit || ''),
          gracePeriod: String(parsed.gracePeriod || ''),
          suspensionDelay: String(parsed.suspensionDelay || ''),
        });
      }
      const savedPlans = localStorage.getItem(PLANS_STORAGE_KEY);
      if (savedPlans) {
        setPlans(JSON.parse(savedPlans));
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
      await new Promise((r) => setTimeout(r, 500));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasChanges(false);
      setToast({ type: 'success', text: 'Settings saved successfully!' });
    } catch {
      setToast({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    setHasChanges(false);
    setShowResetConfirm(false);
    setToast({ type: 'success', text: 'Settings reset to defaults.' });
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const scrollToSection = (key: SidebarSection) => {
    setActiveSection(key);
    const el = document.getElementById(`section-${key}`);
    if (el) {
      const offset = 80; // sticky header (64px) + gap
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const savePlans = (updated: PlanData[]) => {
    setPlans(updated);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handlePlanSubmit = (data: Omit<PlanData, 'id'> & { id?: string }) => {
    if (data.id) {
      // Edit existing plan
      const updated = plans.map(p => p.id === data.id ? { ...p, ...data, id: data.id } : p);
      savePlans(updated);
      setToast({ type: 'success', text: `"${data.name}" updated successfully!` });
    } else {
      // Create new plan
      const newPlan: PlanData = { ...data, id: String(Date.now()) };
      const updated = [...plans, newPlan];
      savePlans(updated);
      setToast({ type: 'success', text: `"${data.name}" created successfully!` });
    }
    setPlanModalOpen(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = () => {
    if (!deletingPlan) return;
    const updated = plans.filter(p => p.id !== deletingPlan.id);
    savePlans(updated);
    setToast({ type: 'success', text: `"${deletingPlan.name}" deleted successfully.` });
    setDeletePlanModalOpen(false);
    setDeletingPlan(null);
  };

  const inputClassName = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  /* Numeric input props: allows clearing the field, stores parsed int */
  const numProps = (key: 'maxUsersPerSchool' | 'maxStudentsPerSchool' | 'apiRateLimit' | 'gracePeriod' | 'suspensionDelay') => ({
    type: 'text' as const,
    inputMode: 'numeric' as const,
    value: numericFields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      setNumericFields((prev) => ({ ...prev, [key]: raw }));
      setHasChanges(true);
      update(key, raw === '' ? 0 : parseInt(raw));
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your SaaS platform configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          style={{ backgroundColor: '#824ef2' }}
          className="inline-flex items-center gap-2 h-10 px-5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <div className="w-56 flex-shrink-0 hidden lg:block sticky top-20 self-start">
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.key
                    ? 'bg-[#824ef2]/10 text-[#824ef2]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ═══════ BRANDING & IDENTITY ═══════ */}
          <SectionCard id="section-branding">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Branding & Identity</h3>
                <p className="text-sm text-slate-500 mt-0.5">Customize the look and feel of your SaaS platform.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-100">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => update('platformName', e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => update('supportEmail', e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#824ef2] transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] text-slate-400 mt-0.5">Upload</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#824ef2] rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{settings.logoFile}</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <button className="text-sm text-red-500 hover:text-red-700 font-medium ml-auto">Remove</button>
              </div>
            </div>
          </SectionCard>

          {/* ═══════ ACADEMIC YEAR SETTINGS ═══════ */}
          <SectionCard id="section-academic">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Academic Year Settings</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage academic sessions for all schools.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-100">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Current Academic Session</label>
                <CustomSelect
                  value={settings.currentSession}
                  onChange={(v) => update('currentSession', v)}
                  options={[
                    { value: '2024-2025', label: '2024 - 2025' },
                    { value: '2023-2024', label: '2023 - 2024' },
                    { value: '2025-2026', label: '2025 - 2026' },
                  ]}
                  className="min-w-[160px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
                <CustomDateInput
                  value={settings.sessionStartDate}
                  onChange={(v) => update('sessionStartDate', v)}
                  className="min-w-[160px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
                <CustomDateInput
                  value={settings.sessionEndDate}
                  onChange={(v) => update('sessionEndDate', v)}
                  className="min-w-[160px]"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 h-10 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                + Add New
              </button>
            </div>
          </SectionCard>

          {/* ═══════ SECURITY SETTINGS ═══════ */}
          <SectionCard id="section-security">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage admin credentials and authentication.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={settings.newPassword}
                  onChange={(e) => update('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-slate-500">Add an extra layer of security to your admin account.</p>
              </div>
              <Toggle enabled={settings.twoFactorEnabled} onChange={() => update('twoFactorEnabled', !settings.twoFactorEnabled)} />
            </div>
          </SectionCard>

          {/* ═══════ PLATFORM CONTROL ═══════ */}
          <SectionCard id="section-control">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Platform Control</h3>
                <p className="text-sm text-slate-500 mt-0.5">Global settings for platform availability and access.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-100">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="space-y-1">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Maintenance Mode</p>
                    <p className="text-xs text-slate-500">Temporarily disable access for all users except Super Admin.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle enabled={settings.maintenanceMode} onChange={() => update('maintenanceMode', !settings.maintenanceMode)} color="red" />
                  <span className="text-sm text-slate-500 w-12">{settings.maintenanceMode ? 'On' : 'Off'}</span>
                </div>
              </div>

              {/* New School Registrations */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Allow New School Registrations</p>
                    <p className="text-xs text-slate-500">Enable or disable the public registration form for new schools.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle enabled={settings.allowNewRegistrations} onChange={() => update('allowNewRegistrations', !settings.allowNewRegistrations)} />
                  <span className={`text-sm font-medium w-12 ${settings.allowNewRegistrations ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {settings.allowNewRegistrations ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ═══════ PRICING & PLANS ═══════ */}
          <SectionCard id="section-pricing">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pricing & Plans</h3>
                <p className="text-sm text-slate-500 mt-0.5">Configure subscription plans and limits.</p>
              </div>
              <button
                onClick={() => { setEditingPlan(null); setPlanModalOpen(true); }}
                style={{ backgroundColor: '#824ef2' }}
                className="inline-flex items-center gap-1.5 h-9 px-4 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
              >
                + New Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan, index) => {
                const iconSet = planIcons[index] || planIcons[0]!;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 ${plan.popular ? 'border-[#824ef2]' : 'border-slate-200'} p-5 transition-shadow hover:shadow-md`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold text-white bg-[#824ef2]">
                          POPULAR
                        </span>
                      </div>
                    )}

                    {/* Edit / Delete Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={() => { setEditingPlan(plan); setPlanModalOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit plan"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => { setDeletingPlan(plan); setDeletePlanModalOpen(true); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>

                    <div className={`w-10 h-10 rounded-xl ${plan.popular ? 'bg-[#824ef2]' : iconSet.iconBg} flex items-center justify-center mb-4`}>
                      <span className={plan.popular ? 'text-white' : iconSet.iconColor}>{iconSet.icon}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1 mb-4">
                      <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-sm text-slate-500">/mo per user</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Trial Duration</span>
                        <span className="font-medium text-slate-900">{plan.trial} Days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Max Students</span>
                        <span className="font-medium text-slate-900">{plan.maxStudents}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ═══════ PLATFORM LIMITS & API ═══════ */}
          <SectionCard id="section-limits">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Platform Limits & API</h3>
                <p className="text-sm text-slate-500 mt-0.5">Set global constraints and API rate limits.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Users / School</label>
                <div className="relative">
                  <input
                    {...numProps('maxUsersPerSchool')}
                    className={inputClassName + ' pr-16'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Users</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Students / School</label>
                <div className="relative">
                  <input
                    {...numProps('maxStudentsPerSchool')}
                    className={inputClassName + ' pr-20'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Students</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">API Rate Limit</label>
                <div className="relative">
                  <input
                    {...numProps('apiRateLimit')}
                    className={inputClassName + ' pr-20'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Req/min</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ═══════ BILLING & SUSPENSION POLICY ═══════ */}
          <SectionCard id="section-billing">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Billing & Suspension Policy</h3>
                <p className="text-sm text-slate-500 mt-0.5">Configure automated actions for non-payment.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-100">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
            </div>

            {/* Auto-Suspend Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50">
                  <Ban className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Auto-Suspend for Non-Payment</p>
                  <p className="text-xs text-slate-500">Automatically suspend school access when invoices are overdue.</p>
                </div>
              </div>
              <Toggle enabled={settings.autoSuspendNonPayment} onChange={() => update('autoSuspendNonPayment', !settings.autoSuspendNonPayment)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-0.5">Grace Period</label>
                <p className="text-xs text-slate-500 mb-2">Days allowed after due date before suspension warning.</p>
                <div className="relative">
                  <input
                    {...numProps('gracePeriod')}
                    className={inputClassName + ' pr-14'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Days</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-0.5">Suspension Delay</label>
                <p className="text-xs text-slate-500 mb-2">Days after grace period before actual suspension.</p>
                <div className="relative">
                  <input
                    {...numProps('suspensionDelay')}
                    className={inputClassName + ' pr-14'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Days</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ═══════ NOTIFICATION CHANNELS ═══════ */}
          <SectionCard id="section-notifications">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Notification Channels</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage how the system communicates with admins.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
            </div>

            <div className="space-y-1">
              {/* Email */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900">Email Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => update('emailNotifications', !settings.emailNotifications)}
                  className="w-5 h-5 rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]/20 cursor-pointer"
                />
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900">SMS / Phone Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => update('smsNotifications', !settings.smsNotifications)}
                  className="w-5 h-5 rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]/20 cursor-pointer"
                />
              </div>

              {/* Billing Alerts */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900">Billing Alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.billingAlerts}
                  onChange={() => update('billingAlerts', !settings.billingAlerts)}
                  className="w-5 h-5 rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]/20 cursor-pointer"
                />
              </div>
            </div>
          </SectionCard>

          {/* ═══════ FOOTER ═══════ */}
          <div className="text-center py-6 space-y-2 border-t border-slate-200">
            <p className="text-sm text-slate-400">&copy; 2024 AllowBox Platform. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
              <button className="hover:text-slate-600 transition-colors">Privacy Policy</button>
              <button className="hover:text-slate-600 transition-colors">Terms of Service</button>
              <button className="hover:text-slate-600 transition-colors">Support</button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onReset={handleReset}
      />

      {/* Plan Create/Edit Modal */}
      <PlanModal
        isOpen={planModalOpen}
        onClose={() => { setPlanModalOpen(false); setEditingPlan(null); }}
        onSubmit={handlePlanSubmit}
        plan={editingPlan}
      />

      {/* Delete Plan Confirmation Modal */}
      <DeletePlanModal
        isOpen={deletePlanModalOpen}
        planName={deletingPlan?.name || ''}
        onClose={() => { setDeletePlanModalOpen(false); setDeletingPlan(null); }}
        onDelete={handleDeletePlan}
      />
    </div>
  );
}
