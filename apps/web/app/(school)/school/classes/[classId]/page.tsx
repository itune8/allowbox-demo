'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { classService, type Class } from '@/lib/services/class.service';
import { userService, type User } from '@/lib/services/user.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { SchoolStatCard, SchoolStatusBadge } from '../../../../../components/school';
import { Users, BookOpen, Layers, BarChart3 } from 'lucide-react';

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.classId as string;

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'subjects' | 'students'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Data
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, [classId]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch class data
      const fetchedClass = await classService.getClassById(classId);
      setClassData(fetchedClass);

      // Fetch all users and filter students in this class
      const allUsers = await userService.getUsers();
      const classStudents = allUsers.filter(user =>
        user.role === 'student' &&
        user.classId &&
        (typeof user.classId === 'string' ? user.classId : user.classId._id) === classId
      );
      setStudents(classStudents);

      // Fetch all subjects and filter by class
      const allSubjects = await subjectService.getSubjects();
      // Filter subjects that are either assigned to this class or not assigned to any class (legacy subjects)
      const classSubjects = allSubjects.filter(subject =>
        !subject.classes ||
        subject.classes.length === 0 ||
        subject.classes.includes(classId)
      );
      setSubjects(classSubjects);

    } catch (err) {
      console.error('Failed to fetch class data:', err);
      setError('Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.studentId?.includes(studentSearch);
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Calculate stats
  const stats = {
    totalStudents: students.length,
    sections: classData?.sections?.length || 0,
    subjects: subjects.length,
    activeStudents: students.filter(s => s.isActive).length,
  };

  // Group students by section
  const studentsBySection = classData?.sections?.reduce((acc, section) => {
    acc[section] = students.filter(s => s.section === section);
    return acc;
  }, {} as Record<string, User[]>) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#824ef2] mx-auto"></div>
          <div className="text-slate-500">Loading class details...</div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg">
          {error || 'Class not found'}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="animate-fade-in">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg flex items-center gap-2">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {classData.name} - Grade {classData.grade}
            </h1>
            {classData.description && (
              <p className="text-sm text-slate-600">{classData.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/school/classes/${classId}/timetable`)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Timetable
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="blue"
          label="Total Students"
          value={stats.totalStudents}
          subtitle={`${stats.activeStudents} active`}
        />
        <SchoolStatCard
          icon={<Layers className="w-5 h-5" />}
          color="purple"
          label="Sections"
          value={stats.sections}
          subtitle={classData.sections?.join(', ')}
        />
        <SchoolStatCard
          icon={<BookOpen className="w-5 h-5" />}
          color="green"
          label="Subjects Available"
          value={stats.subjects}
        />
        <SchoolStatCard
          icon={<BarChart3 className="w-5 h-5" />}
          color="amber"
          label="Capacity"
          value={classData.capacity || 'N/A'}
          subtitle={classData.capacity ? `${Math.round((stats.totalStudents / classData.capacity) * 100)}% filled` : ''}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'sections', label: 'Sections' },
            { key: 'subjects', label: 'Subjects' },
            { key: 'students', label: 'Students' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-[#824ef2] text-[#824ef2]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Class Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Class Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Grade</span>
                      <span className="font-semibold text-slate-900">{classData.grade}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Total Sections</span>
                      <span className="font-semibold text-slate-900">{stats.sections}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Enrollment</span>
                      <span className="font-semibold text-slate-900">
                        {stats.totalStudents}/{classData.capacity || 'Unlimited'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Status</span>
                      <SchoolStatusBadge value={classData.isActive ? 'active' : 'inactive'} />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/school/students?classId=${classId}`)}
                      className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-slate-900 text-sm">View All Students</div>
                      <div className="text-xs text-slate-500 mt-0.5">Browse {stats.totalStudents} students</div>
                    </button>
                    <button
                      onClick={() => router.push(`/school/classes/${classId}/timetable`)}
                      className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-slate-900 text-sm">Class Timetable</div>
                      <div className="text-xs text-slate-500 mt-0.5">View and manage schedule</div>
                    </button>
                    <button
                      onClick={() => router.push(`/school/reports?classId=${classId}`)}
                      className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-slate-900 text-sm">Class Reports</div>
                      <div className="text-xs text-slate-500 mt-0.5">Performance analytics</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Sections</h3>
            </div>
            {classData.sections && classData.sections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classData.sections.map((section) => {
                  const sectionStudents = studentsBySection[section] || [];
                  return (
                    <div
                      key={section}
                      className="p-5 border border-slate-200 rounded-lg hover:shadow-md transition-all hover:border-[#824ef2]/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 text-lg">
                          Section {section}
                        </h4>
                        <span className="w-10 h-10 rounded-full bg-purple-100 text-[#824ef2] grid place-items-center font-semibold">
                          {section}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Students</span>
                          <span className="font-medium text-slate-900">{sectionStudents.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Active</span>
                          <span className="font-medium text-emerald-600">
                            {sectionStudents.filter(s => s.isActive).length}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSection(section);
                          setActiveTab('students');
                        }}
                        className="mt-4 w-full text-sm text-[#824ef2] hover:text-[#6b3fd4] font-medium text-center py-2 border border-purple-200 rounded-md hover:bg-purple-50 transition-colors"
                      >
                        View Students
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                No sections defined for this class
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Subjects ({subjects.length})</h3>
              <button
                onClick={() => router.push('/school/settings')}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Manage Subjects
              </button>
            </div>
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">No subjects available</p>
                <button
                  onClick={() => router.push('/school/settings')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
                >
                  Add Subjects in Settings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-[#824ef2] hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">
                      {subject.name}
                    </h4>
                    <p className="text-sm text-slate-500 font-mono mb-3">
                      {subject.code}
                    </p>
                    {subject.description && (
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    <div className="flex gap-2 text-xs">
                      {subject.maxMarks && (
                        <span className="px-2 py-1 bg-slate-100 rounded">
                          Max: {subject.maxMarks}
                        </span>
                      )}
                      {subject.passingMarks && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                          Pass: {subject.passingMarks}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Students ({filteredStudents.length})
              </h3>
              <div className="flex gap-2">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                >
                  <option value="all">All Sections</option>
                  {classData.sections?.map((section) => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">
                  {studentSearch || selectedSection !== 'all'
                    ? 'No students found matching your filters'
                    : 'No students enrolled in this class yet'}
                </p>
                <button
                  onClick={() => router.push('/school/students')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
                >
                  Go to Students Page
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Student ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Section</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm text-slate-900 font-mono">
                          {student.studentId || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.section || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <SchoolStatusBadge value={student.isActive ? 'active' : 'inactive'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
