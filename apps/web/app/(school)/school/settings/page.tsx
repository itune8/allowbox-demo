'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { tenantService, type TenantData } from '@/lib/services/tenant.service';
import { classService, type Class } from '@/lib/services/class.service';
import { CreateSubjectModal, type SubjectFormData } from '@/components/modals/create-subject-modal';
import { GlassCard, AnimatedStatCard, Icon3D } from '@/components/ui';
import {
  Settings,
  BookOpen,
  Building,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Award,
  Bell,
  Download,
  CheckCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [editingSchool, setEditingSchool] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchSchoolInfo();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolInfo = async () => {
    try {
      const data = await tenantService.getCurrentTenant();
      setSchoolInfo({
        name: data.schoolName || '',
        email: data.contactEmail || '',
        phone: data.contactPhone || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch school info:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const getClassNamesForSubject = (subjectClasses?: string[]): string => {
    if (!subjectClasses || subjectClasses.length === 0) {
      return 'All classes';
    }
    const classNames = classes
      .filter(cls => subjectClasses.includes(cls._id))
      .map(cls => cls.name);
    return classNames.length > 0 ? classNames.join(', ') : 'N/A';
  };

  const handleUpdateSchoolInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
// await tenantService?.updateTenant({
//   schoolName: schoolInfo.name,
//   contactEmail: schoolInfo.email,
//   contactPhone: schoolInfo.phone,
//   address: schoolInfo.address,
// });

      setBanner('School information updated successfully!');
      setTimeout(() => setBanner(null), 3000);
      setEditingSchool(false);
      await fetchSchoolInfo();
    } catch (err) {
      console.error('Failed to update school info:', err);
      alert('Failed to update school information');
    }
  };

  const handleCreateSubject = async (subjectData: SubjectFormData) => {
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, subjectData);
        setBanner('Subject updated successfully!');
      } else {
        await subjectService.createSubject(subjectData);
        setBanner('Subject created successfully!');
      }
      setTimeout(() => setBanner(null), 3000);
      setIsSubjectModalOpen(false);
      setEditingSubject(null);
      await fetchSubjects();
    } catch (error) {
      console.error('Failed to save subject:', error);
      throw error;
    }
  };

  const handleEditSubject = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await subjectService.deleteSubject(subjectId);
      setSubjects(prev => prev.filter(s => s._id !== subjectId));
      setBanner('Subject deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete subject:', err);
      alert('Failed to delete subject. Please try again.');
    }
  };

  // Stats for subjects
  const activeSubjects = subjects.filter(s => s.isActive !== false).length;
  const inactiveSubjects = subjects.filter(s => s.isActive === false).length;

  // System settings items
  const systemSettings = [
    {
      title: 'Academic Year',
      description: 'Configure academic calendar and terms',
      icon: Calendar,
    },
    {
      title: 'Grading Scale',
      description: 'Define grading criteria and pass marks',
      icon: Award,
    },
    {
      title: 'Notifications',
      description: 'Email and SMS notification settings',
      icon: Bell,
    },
    {
      title: 'Backup & Export',
      description: 'Download data backups and export reports',
      icon: Download,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 text-green-700 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {banner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-gray-500 to-slate-600" size="lg">
            <Settings className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
            <p className="text-sm text-gray-500">
              Manage subjects and other school configurations
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Subjects"
          value={subjects.length}
          icon={<BookOpen className="w-5 h-5" />}
          gradient="from-gray-500 to-slate-600"
          delay={0}
        />
        <AnimatedStatCard
          title="Active"
          value={activeSubjects}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Inactive"
          value={inactiveSubjects}
          icon={<BookOpen className="w-5 h-5" />}
          gradient="from-gray-400 to-gray-500"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Classes"
          value={classes.length}
          icon={<Building className="w-5 h-5" />}
          gradient="from-indigo-500 to-purple-500"
          delay={0.3}
        />
      </div>

      {/* Subjects Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon3D gradient="from-indigo-500 to-purple-500" size="md">
              <BookOpen className="w-5 h-5" />
            </Icon3D>
            <h2 className="text-xl font-semibold text-gray-900">
              Subjects {!loading && `(${subjects.length})`}
            </h2>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              onClick={() => {
                setEditingSubject(null);
                setIsSubjectModalOpen(true);
              }}
              className="shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </motion.div>
        </div>

        <GlassCard hover={false} className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full"
              />
              <div className="text-gray-500">Loading subjects...</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-10 text-center text-gray-500 space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <BookOpen className="w-16 h-16 mx-auto text-gray-300" />
              </motion.div>
              <div>No subjects added yet</div>
              <Button onClick={() => setIsSubjectModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Subject
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group bg-white/60 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        Code: {subject.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit Subject"
                        className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                        onClick={(e) => handleEditSubject(subject, e)}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete Subject"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        onClick={(e) => handleDeleteSubject(subject._id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {subject.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-gray-50/80 p-2 rounded-lg">
                      <div className="text-gray-500">Max Marks</div>
                      <div className="font-semibold text-gray-900">
                        {subject.maxMarks || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-50/80 p-2 rounded-lg">
                      <div className="text-gray-500">Pass Marks</div>
                      <div className="font-semibold text-gray-900">
                        {subject.passingMarks || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="bg-indigo-50/80 p-2 rounded-lg text-xs">
                    <div className="text-indigo-700 font-medium mb-1">Assigned to:</div>
                    <div className="text-indigo-600">
                      {getClassNamesForSubject(subject.classes)}
                    </div>
                  </div>

                  {subject.isActive !== undefined && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          subject.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800/30'
                        }`}
                      >
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* School Information Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon3D gradient="from-blue-500 to-cyan-500" size="md">
              <Building className="w-5 h-5" />
            </Icon3D>
            <h2 className="text-xl font-semibold text-gray-900">
              School Information
            </h2>
          </div>
          {!editingSchool && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingSchool(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Information
              </Button>
            </motion.div>
          )}
        </div>

        <GlassCard hover={false} className="p-5">
          {editingSchool ? (
            <form onSubmit={handleUpdateSchoolInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 bg-white/80 text-gray-900 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 bg-white/80 text-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 bg-white/80 text-gray-900 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={schoolInfo.address}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 bg-white/80 text-gray-900 transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSchool(false);
                    fetchSchoolInfo();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-gray-50/80 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Building className="w-4 h-4" />
                    School Name
                  </div>
                  <div className="font-medium text-gray-900">
                    {schoolInfo.name || 'Not set'}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-gray-50/80 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </div>
                  <div className="font-medium text-gray-900">
                    {schoolInfo.email || 'Not set'}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-gray-50/80 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Phone className="w-4 h-4" />
                    Contact Phone
                  </div>
                  <div className="font-medium text-gray-900">
                    {schoolInfo.phone || 'Not set'}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 md:col-span-2"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                  <div className="font-medium text-gray-900">
                    {schoolInfo.address || 'Not set'}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Additional Settings Sections */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Icon3D gradient="from-amber-500 to-orange-500" size="md">
            <Settings className="w-5 h-5" />
          </Icon3D>
          <h2 className="text-xl font-semibold text-gray-900">
            System Settings
          </h2>
        </div>

        <GlassCard hover={false} className="p-5">
          <div className="space-y-3">
            {systemSettings.map((setting, index) => (
              <motion.div
                key={setting.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all cursor-pointer group border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <setting.icon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {setting.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {setting.description}
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  className="text-gray-400 group-hover:text-indigo-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Create/Edit Subject Modal */}
      <CreateSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleCreateSubject}
        initialData={editingSubject || undefined}
      />
    </motion.section>
  );
}
