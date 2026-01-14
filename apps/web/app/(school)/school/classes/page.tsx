'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { CreateClassModal, type ClassFormData } from '@/components/modals/create-class-modal';
import { GlassCard, AnimatedStatCard, Icon3D } from '@/components/ui';
import {
  BookOpen,
  Users,
  Plus,
  ChevronRight,
  Layers,
  Clock,
  Info,
} from 'lucide-react';

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (classData: ClassFormData) => {
    try {
      const newClass = await classService.createClass(classData);
      setClasses([...classes, newClass]);
      setBanner(`Class "${newClass.name}" added successfully with ${newClass.sections.length} section(s)!`);
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to create class:', err);
      throw err;
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const totalSections = classes.reduce((acc, cls) => acc + cls.sections.length, 0);
    const totalCapacity = classes.reduce((acc, cls) => acc + (cls.capacity || 0), 0);
    return { totalClasses, totalSections, totalCapacity };
  }, [classes]);

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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-violet-500 to-purple-500" size="lg">
            <BookOpen className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <p className="text-sm text-gray-500">Manage your school classes and sections</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => setShowAddClass(true)} className="shadow-lg shadow-indigo-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatedStatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon={<BookOpen className="w-5 h-5 text-violet-600" />}
          iconBgColor="bg-violet-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Total Sections"
          value={stats.totalSections}
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
          delay={1}
        />
        <AnimatedStatCard
          title="Total Capacity"
          value={stats.totalCapacity}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          delay={2}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} hover={false} className="p-5">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <GlassCard hover={false} className="py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <BookOpen className="mx-auto w-16 h-16 text-gray-300" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No classes found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first class.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowAddClass(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => {
            const updatedDate = new Date(cls.updatedAt).toLocaleDateString();
            return (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5 h-full flex flex-col group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                        {cls.grade}
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold text-lg group-hover:text-indigo-600 transition-colors">
                          {cls.name}
                        </h3>
                        <span className="text-xs text-gray-500">Grade {cls.grade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span>Sections: {cls.sections.join(', ')}</span>
                    </div>
                    {cls.capacity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>Capacity: {cls.capacity}</span>
                      </div>
                    )}
                    {cls.description && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="line-clamp-2">{cls.description}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Updated: {updatedDate}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all flex items-center justify-center gap-2"
                      onClick={() => router.push(`/school/classes/${cls._id}`)}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal */}
      <CreateClassModal
        isOpen={showAddClass}
        onClose={() => setShowAddClass(false)}
        onSubmit={handleAddClass}
      />
    </motion.section>
  );
}
