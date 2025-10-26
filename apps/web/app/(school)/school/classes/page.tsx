'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { userService } from '@/lib/services/user.service';
import { CreateClassModal, type ClassFormData } from '@/components/modals/create-class-modal';

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
      throw err; // Let modal handle the error
    }
  };

  const getStudentCount = async (classId: string) => {
    try {
      const users = await userService.getUsers();
      return users.filter(u => u.role === 'student' && u.classId === classId).length;
    } catch (err) {
      console.error('Failed to count students:', err);
      return 0;
    }
  };

  return (
    <section className="animate-slide-in-bottom space-y-6">
      {/* Banner */}
      {banner && (
        <div className="animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {banner}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Classes</h2>
        <Button size="sm" onClick={() => setShowAddClass(true)}>
          + Add Class
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No classes found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first class.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowAddClass(true)}>
              + Add Class
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const updatedDate = new Date(cls.updatedAt).toLocaleDateString();
            return (
              <div
                key={cls._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                    {cls.name}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Grade {cls.grade}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Sections: {cls.sections.join(', ')}
                  </div>
                  {cls.capacity && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      Capacity: {cls.capacity}
                    </div>
                  )}
                  {cls.description && (
                    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <svg className="w-3.5 h-3.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="line-clamp-2">{cls.description}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Updated: {updatedDate}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    className="w-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-all flex items-center justify-center gap-2"
                    onClick={() => router.push(`/school/classes/${cls._id}`)}
                  >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
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
    </section>
  );
}
