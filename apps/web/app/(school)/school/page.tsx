'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '@repo/config';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import { CreateStudentModal, type StudentFormData } from '../../../components/modals/create-student-modal';
import { CreateUserModal, type UserFormData } from '../../../components/modals/create-user-modal';
import { studentService } from '../../../lib/services/student.service';
import { userService, type User } from '../../../lib/services/user.service';
import { classService, type Class } from '../../../lib/services/class.service';
import { Portal } from '../../../components/portal';
import {
  AnimatedStatCard,
  ActionCard,
  EventCard,
  ActivityItem,
  Marquee,
  MarqueeItem,
  Carousel,
  GlassCard,
} from '@/components/ui';
import {
  Users,
  UserPlus,
  GraduationCap,
  DollarSign,
  Calendar,
  BookOpen,
  FileText,
  HelpCircle,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  Settings,
  X,
  Megaphone,
  Type,
  AlignLeft,
  Send,
  Loader2,
  Tag,
  Zap,
} from 'lucide-react';

// 3D Icon wrapper component for modal sections
const Icon3D = ({ children, gradient, size = 'md' }: { children: React.ReactNode; gradient: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 5 }}
      className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
      style={{ boxShadow: `0 8px 24px -4px rgba(99, 102, 241, 0.3)` }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
      <div className="relative text-white">{children}</div>
    </motion.div>
  );
};

// Enhanced Form Input with icon support
const FormInput = ({
  icon: IconComponent,
  label,
  required,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  delay?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

// Enhanced Form Select with icon support
const FormSelect = ({
  icon: IconComponent,
  label,
  required,
  children,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  delay?: number;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </motion.div>
);

// Enhanced Form Textarea with icon support
const FormTextarea = ({
  icon: IconComponent,
  label,
  required,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  delay?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200 resize-none
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

// Announcement form data interface
interface AnnouncementFormData {
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  icon: string;
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const config: Record<string, { gradient: string; label: string }> = {
    low: { gradient: 'from-gray-400 to-gray-500', label: 'Low' },
    normal: { gradient: 'from-blue-400 to-blue-500', label: 'Normal' },
    high: { gradient: 'from-orange-400 to-orange-500', label: 'High' },
    urgent: { gradient: 'from-red-400 to-red-500', label: 'Urgent' },
  };
  const { gradient, label } = (config[priority] || config.normal)!;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${gradient} text-white text-xs font-medium shadow-lg`}
    >
      <Zap className="w-3 h-3" />
      {label}
    </motion.span>
  );
};

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [banner, setBanner] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementFormData, setAnnouncementFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    priority: 'normal',
    icon: '📢',
  });

  // Real data states
  const [students, setStudents] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Computed stats from real data
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const totalStaff = staff.length;
    const teachers = staff.filter(s => s.role === 'teacher').length;
    const admins = staff.filter(s => s.role === 'tenant_admin').length;
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.isActive).length;
    const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const avgSize = totalClasses > 0 ? Math.round(totalCapacity / totalClasses) : 0;

    return {
      students: { total: totalStudents, active: activeStudents, trend: { value: `${activeStudents} active`, isPositive: true } },
      staff: { total: totalStaff, teachers, admin: admins, trend: { value: `${teachers} teachers`, isPositive: true } },
      classes: { total: totalClasses, active: activeClasses, avgSize },
      fees: { pending: 0, collected: 0, total: 0, trend: { value: 'N/A', isPositive: true } },
      attendance: { today: 0, thisWeek: 0, thisMonth: 0 },
    };
  }, [students, staff, classes]);

  // Announcements for marquee (now as state to allow adding)
  const [announcements, setAnnouncements] = useState<Array<{ id: number; icon: string; text: string; priority: 'low' | 'normal' | 'high' | 'urgent' }>>([
    { id: 1, icon: '📢', text: 'Parent-Teacher Meeting scheduled for tomorrow at 10:00 AM', priority: 'normal' },
    { id: 2, icon: '🎉', text: 'Congratulations to Grade 10 students for outstanding exam results!', priority: 'normal' },
    { id: 3, icon: '📚', text: 'Library will be closed this Saturday for maintenance', priority: 'low' },
    { id: 4, icon: '🏆', text: 'Sports Day registrations are now open - Sign up before Dec 15!', priority: 'high' },
    { id: 5, icon: '💡', text: 'New science lab equipment has arrived - Classes start next week', priority: 'normal' },
  ]);

  // Recent activities
  const recentActivities = [
    { id: 1, type: 'success' as const, icon: '👤', message: 'New student enrolled: Sarah Johnson', time: '2 hours ago' },
    { id: 2, type: 'success' as const, icon: '💰', message: 'Payment received: $1,500 from Grade 10A', time: '4 hours ago' },
    { id: 3, type: 'default' as const, icon: '👨‍🏫', message: 'New teacher onboarded: Mr. David Lee', time: '1 day ago' },
    { id: 4, type: 'warning' as const, icon: '⚠️', message: 'Low attendance alert for Grade 7B', time: '1 day ago' },
    { id: 5, type: 'default' as const, icon: '📝', message: 'Homework submitted by 45 students', time: '2 days ago' },
  ];

  // Upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Tomorrow', time: '10:00 AM', color: 'bg-blue-500' },
    { id: 2, title: 'Mid-term Examinations Begin', date: 'Dec 15, 2024', color: 'bg-purple-500' },
    { id: 3, title: 'Sports Day', date: 'Dec 20, 2024', color: 'bg-emerald-500' },
    { id: 4, title: 'Winter Break Starts', date: 'Dec 23, 2024', color: 'bg-orange-500' },
  ];

  // Quick stats for carousel
  const quickStats = [
    {
      title: 'Attendance Today',
      value: '92%',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
      change: '+3% from yesterday',
      bg: 'from-emerald-50 to-teal-50',
    },
    {
      title: 'Pending Assignments',
      value: '24',
      icon: <BookOpen className="w-8 h-8 text-amber-500" />,
      change: '8 due this week',
      bg: 'from-amber-50 to-orange-50',
    },
    {
      title: 'Fee Collection',
      value: '78%',
      icon: <DollarSign className="w-8 h-8 text-blue-500" />,
      change: '$12,400 this month',
      bg: 'from-blue-50 to-indigo-50',
    },
  ];

  const isSchoolAdmin = useMemo(() => {
    return (user?.roles || []).includes(ROLES.SCHOOL_ADMIN) || (user?.roles || []).includes(ROLES.TENANT_ADMIN);
  }, [user?.roles]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingData(true);
      try {
        const [tenantData, usersData, classesData] = await Promise.all([
          tenantService.getCurrentTenant(),
          userService.getUsers(),
          classService.getClasses(),
        ]);

        setTenantData(tenantData);
        setStudents(usersData.filter(u => u.role === 'student'));
        setStaff(usersData.filter(u => ['teacher', 'tenant_admin', 'accountant'].includes(u.role)));
        setClasses(classesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoadingTenant(false);
        setLoadingData(false);
      }
    };

    if (user?.tenantId) {
      fetchAllData();
    } else {
      setLoadingTenant(false);
      setLoadingData(false);
    }
  }, [user]);

  const handleCreateStudent = async (studentData: StudentFormData) => {
    try {
      await studentService.createStudent(studentData);
      setBanner('Student created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsStudentModalOpen(false);
      const usersData = await userService.getUsers();
      setStudents(usersData.filter(u => u.role === 'student'));
    } catch (error) {
      console.error('Failed to create student:', error);
      throw error;
    }
  };

  const handleCreateStaff = async (userData: UserFormData) => {
    try {
      await userService.createUser(userData);
      setBanner('Staff member created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsStaffModalOpen(false);
      const usersData = await userService.getUsers();
      setStaff(usersData.filter(u => ['teacher', 'tenant_admin', 'accountant'].includes(u.role)));
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementFormData.title.trim() || !announcementFormData.content.trim()) {
      setAnnouncementError('Please fill in all required fields');
      return;
    }

    setAnnouncementSubmitting(true);
    setAnnouncementError('');

    try {
      // Simulate API call (replace with actual service call when available)
      await new Promise(resolve => setTimeout(resolve, 800));

      const newAnnouncement = {
        id: Date.now(),
        icon: announcementFormData.icon,
        text: `${announcementFormData.title}: ${announcementFormData.content}`,
        priority: announcementFormData.priority,
      };

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setBanner('Announcement created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsAnnouncementModalOpen(false);

      // Reset form
      setAnnouncementFormData({
        title: '',
        content: '',
        priority: 'normal',
        icon: '📢',
      });
    } catch (error) {
      console.error('Failed to create announcement:', error);
      setAnnouncementError('Failed to create announcement. Please try again.');
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormData({
      title: '',
      content: '',
      priority: 'normal',
      icon: '📢',
    });
    setAnnouncementError('');
  };

  if (!isSchoolAdmin) {
    return (
      <div className="p-6">
        <GlassCard className="p-6 bg-amber-50/50">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <p>You do not have permission to view this page.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Success Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl p-4 border border-emerald-200 bg-emerald-50/80"
          >
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">{banner}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Marquee with Create Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]"
      >
        <div className="bg-white rounded-xl py-3 flex items-center">
          <div className="flex-1 overflow-hidden">
            <Marquee speed="normal" pauseOnHover>
              {announcements.map((item) => (
                <MarqueeItem key={item.id} className="bg-gray-50 border border-gray-100">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </MarqueeItem>
              ))}
            </Marquee>
          </div>
          <div className="px-4 border-l border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            Dashboard Overview
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-amber-500" />
            </motion.span>
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="font-medium text-gray-700">{user?.firstName}</span>! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsStudentModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </motion.button>
        </div>
      </motion.div>

      {/* School Info Card with Glassmorphism */}
      {tenantData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-2xl"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-white/5 to-transparent rounded-full"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold mb-3"
              >
                {tenantData.schoolName}
              </motion.h2>
              <div className="space-y-2 text-indigo-100">
                {tenantData.contactEmail && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    {tenantData.contactEmail}
                  </motion.p>
                )}
                {tenantData.contactPhone && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    {tenantData.contactPhone}
                  </motion.p>
                )}
                {tenantData.address && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    {tenantData.address}
                  </motion.p>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="glass-dark rounded-2xl p-5 min-w-[140px] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className="text-4xl font-bold"
              >
                {stats.students.total}
              </motion.div>
              <div className="text-sm text-indigo-200 mt-1">Total Students</div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Carousel autoplay autoplayDelay={5000} showArrows showDots>
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 border border-gray-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    {stat.change}
                  </p>
                </div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.icon}
                </motion.div>
              </div>
            </div>
          ))}
        </Carousel>
      </motion.div>

      {/* Key Stats Grid */}
      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="animate-shimmer h-4 rounded w-1/2 mb-3" />
              <div className="animate-shimmer h-8 rounded w-1/3 mb-2" />
              <div className="animate-shimmer h-3 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedStatCard
            title="Total Students"
            value={stats.students.total}
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            trend={stats.students.trend}
            iconBgColor="bg-indigo-100"
            delay={1}
            onClick={() => router.push('/school/students')}
          />
          <AnimatedStatCard
            title="Active Staff"
            value={stats.staff.total}
            icon={<GraduationCap className="w-6 h-6 text-emerald-600" />}
            trend={stats.staff.trend}
            iconBgColor="bg-emerald-100"
            delay={2}
            onClick={() => router.push('/school/staff')}
          />
          <AnimatedStatCard
            title="Total Classes"
            value={stats.classes.total}
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            iconBgColor="bg-blue-100"
            delay={3}
            onClick={() => router.push('/school/classes')}
          />
          <AnimatedStatCard
            title="Fee Collection"
            value={stats.fees.total > 0 ? `${Math.round((stats.fees.collected / stats.fees.total) * 100)}%` : 'N/A'}
            icon={<DollarSign className="w-6 h-6 text-amber-600" />}
            trend={stats.fees.trend}
            iconBgColor="bg-amber-100"
            delay={4}
            onClick={() => router.push('/school/fees')}
          />
        </div>
      )}

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 bg-white/80" hover>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Today's Attendance</h3>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-5 h-5 text-indigo-500" />
            </motion.div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.attendance.today}%</div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Week: {stats.attendance.thisWeek}%
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Month: {stats.attendance.thisMonth}%
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 bg-white/80" hover>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Pending Fees</h3>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${(stats.fees.pending / 1000).toFixed(0)}K
          </div>
          <div className="mt-3 text-xs text-gray-500">
            ${(stats.fees.collected / 1000).toFixed(0)}K collected this month
          </div>
        </GlassCard>

        <GlassCard className="p-5 bg-white/80" hover>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Avg Class Size</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.classes.avgSize}</div>
          <div className="mt-3 text-xs text-gray-500">
            {stats.classes.total} active classes
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6 bg-white/90" hover={false}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <ActionCard
                icon={<UserPlus className="w-7 h-7" />}
                title="Add Student"
                onClick={() => setIsStudentModalOpen(true)}
                color="indigo"
                variant="outline"
                delay={1}
              />
              <ActionCard
                icon={<Plus className="w-7 h-7" />}
                title="Add Staff"
                onClick={() => setIsStaffModalOpen(true)}
                color="green"
                variant="outline"
                delay={2}
              />
              <ActionCard
                icon={<BookOpen className="w-7 h-7" />}
                title="Manage Classes"
                onClick={() => router.push('/school/classes')}
                color="blue"
                delay={3}
              />
              <ActionCard
                icon={<DollarSign className="w-7 h-7" />}
                title="Fee Management"
                onClick={() => router.push('/school/fees')}
                color="amber"
                delay={4}
              />
              <ActionCard
                icon={<FileText className="w-7 h-7" />}
                title="View Reports"
                onClick={() => router.push('/school/reports')}
                color="purple"
                delay={5}
              />
              <ActionCard
                icon={<HelpCircle className="w-7 h-7" />}
                title="Get Support"
                onClick={() => router.push('/school/support')}
                color="red"
                delay={6}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <GlassCard className="p-6 bg-white/90" hover={false}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Upcoming Events
            </h3>
            <div className="space-y-1">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  color={event.color}
                  delay={index + 1}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => router.push('/school/events')}
              className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1"
            >
              View All Events <ArrowRight className="w-4 h-4" />
            </motion.button>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <GlassCard className="p-6 bg-white/90" hover={false}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recentActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                icon={activity.icon}
                message={activity.message}
                time={activity.time}
                type={activity.type}
                delay={index + 1}
              />
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Modals */}
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleCreateStudent}
      />
      <CreateUserModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
}
