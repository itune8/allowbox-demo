'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@repo/ui/button';

type Section = {
  id: string;
  name: string;
  students: number;
  teacher: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  teacher: string;
  periodsPerWeek: number;
};

type TimetableSlot = {
  day: string;
  period: string;
  subject: string;
  teacher: string;
  room?: string;
};

type Student = {
  id: string;
  name: string;
  rollNo: string;
  section: string;
  attendance: number;
  avgMarks: number;
  parentPhone: string;
  email: string;
};

type AttendanceRecord = {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
};

type MarksRecord = {
  studentId: string;
  subject: string;
  exam: string;
  marks: number;
  maxMarks: number;
};

type TimetableConfig = {
  totalPeriods: number;
  startTime: string;
  endTime: string;
  periodDuration: number;
  breakAfter: number[];
  breakDuration: number;
  lunchAfter: number;
  lunchDuration: number;
};

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.classId as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'subjects' | 'timetable' | 'students'>('overview');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showGenerateTimetable, setShowGenerateTimetable] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState<Student | null>(null);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [showAddMarks, setShowAddMarks] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Timetable configuration
  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>({
    totalPeriods: 6,
    startTime: '08:00',
    endTime: '15:00',
    periodDuration: 45,
    breakAfter: [2],
    breakDuration: 15,
    lunchAfter: 4,
    lunchDuration: 30,
  });

  // Mock data
  const classData = {
    id: classId,
    name: 'Grade 10',
    totalStudents: 120,
    sections: 4,
    subjects: 8,
    classTeacher: 'Mrs. Sarah Johnson',
  };

  const [sections, setSections] = useState<Section[]>([
    { id: 'sec-1', name: 'Section A', students: 30, teacher: 'Mr. John Smith' },
    { id: 'sec-2', name: 'Section B', students: 30, teacher: 'Ms. Emily Davis' },
    { id: 'sec-3', name: 'Section C', students: 30, teacher: 'Mr. David Lee' },
    { id: 'sec-4', name: 'Section D', students: 30, teacher: 'Ms. Maria Garcia' },
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'sub-1', name: 'Mathematics', code: 'MATH101', teacher: 'Dr. Robert Chen', periodsPerWeek: 6 },
    { id: 'sub-2', name: 'English', code: 'ENG101', teacher: 'Ms. Patricia Brown', periodsPerWeek: 5 },
    { id: 'sub-3', name: 'Science', code: 'SCI101', teacher: 'Dr. James Wilson', periodsPerWeek: 6 },
    { id: 'sub-4', name: 'History', code: 'HIST101', teacher: 'Mr. Michael Taylor', periodsPerWeek: 4 },
    { id: 'sub-5', name: 'Geography', code: 'GEO101', teacher: 'Ms. Linda Anderson', periodsPerWeek: 3 },
    { id: 'sub-6', name: 'Physical Education', code: 'PE101', teacher: 'Mr. Thomas Martinez', periodsPerWeek: 2 },
    { id: 'sub-7', name: 'Art', code: 'ART101', teacher: 'Ms. Jennifer White', periodsPerWeek: 2 },
    { id: 'sub-8', name: 'Music', code: 'MUS101', teacher: 'Mr. Christopher Harris', periodsPerWeek: 2 },
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 'stu-1', name: 'Alice Johnson', rollNo: '001', section: 'Section A', attendance: 95, avgMarks: 88, parentPhone: '+1234567890', email: 'alice@school.com' },
    { id: 'stu-2', name: 'Bob Smith', rollNo: '002', section: 'Section A', attendance: 92, avgMarks: 85, parentPhone: '+1234567891', email: 'bob@school.com' },
    { id: 'stu-3', name: 'Charlie Davis', rollNo: '003', section: 'Section B', attendance: 88, avgMarks: 82, parentPhone: '+1234567892', email: 'charlie@school.com' },
    { id: 'stu-4', name: 'Diana Brown', rollNo: '004', section: 'Section B', attendance: 96, avgMarks: 91, parentPhone: '+1234567893', email: 'diana@school.com' },
    { id: 'stu-5', name: 'Eve Wilson', rollNo: '005', section: 'Section C', attendance: 90, avgMarks: 87, parentPhone: '+1234567894', email: 'eve@school.com' },
  ]);

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  // Generate periods based on config
  const generatePeriods = (config: TimetableConfig): string[] => {
    const periods: string[] = [];
    for (let i = 1; i <= config.totalPeriods; i++) {
      periods.push(`Period ${i}`);
      if (config.breakAfter.includes(i)) {
        periods.push('Break');
      }
      if (config.lunchAfter === i) {
        periods.push('Lunch');
      }
    }
    return periods;
  };

  const handleAddSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      name: formData.get('name') as string,
      students: 0,
      teacher: formData.get('teacher') as string,
    };
    setSections([...sections, newSection]);
    setShowAddSection(false);
    setBanner('Section added successfully!');
    setTimeout(() => setBanner(null), 3000);
  };

  const handleAddSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      teacher: formData.get('teacher') as string,
      periodsPerWeek: parseInt(formData.get('periods') as string) || 0,
    };
    setSubjects([...subjects, newSubject]);
    setShowAddSubject(false);
    setBanner('Subject added successfully!');
    setTimeout(() => setBanner(null), 3000);
  };

  const handleGenerateTimetable = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const config: TimetableConfig = {
      totalPeriods: parseInt(formData.get('totalPeriods') as string) || 6,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      periodDuration: parseInt(formData.get('periodDuration') as string) || 45,
      breakAfter: [parseInt(formData.get('breakAfter') as string) || 2],
      breakDuration: parseInt(formData.get('breakDuration') as string) || 15,
      lunchAfter: parseInt(formData.get('lunchAfter') as string) || 4,
      lunchDuration: parseInt(formData.get('lunchDuration') as string) || 30,
    };

    setTimetableConfig(config);

    // Generate timetable
    const newTimetable: TimetableSlot[] = [];
    const periods = generatePeriods(config);
    let subjectIndex = 0;

    DEFAULT_DAYS.forEach((day) => {
      periods.forEach((period) => {
        if (period === 'Break' || period === 'Lunch') {
          newTimetable.push({ day, period, subject: period, teacher: '', room: '' });
        } else {
          const subject = subjects[subjectIndex % subjects.length];
          if (subject) {
            newTimetable.push({
              day,
              period,
              subject: subject.name,
              teacher: subject.teacher,
              room: `Room ${Math.floor(Math.random() * 200) + 100}`,
            });
            subjectIndex++;
          }
        }
      });
    });

    setTimetable(newTimetable);
    setShowGenerateTimetable(false);
    setBanner('Timetable generated successfully!');
    setTimeout(() => setBanner(null), 3000);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                         student.rollNo.includes(studentSearch);
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const periods = generatePeriods(timetableConfig);

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{classData.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Class Teacher: {classData.classTeacher}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowGenerateTimetable(true)}>
            Generate Timetable
          </Button>
          <Button size="sm" onClick={() => setShowAddSection(true)}>
            + Add Section
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{classData.totalStudents}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sections</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{classData.sections}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subjects</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{classData.subjects}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Attendance</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">94.5%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'sections', label: 'Sections' },
            { key: 'subjects', label: 'Subjects' },
            { key: 'timetable', label: 'Timetable' },
            { key: 'students', label: 'Students' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Class Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Performance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Average Score</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">85.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Pass Rate</span>
                      <span className="font-semibold text-green-600">96%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Attendance</span>
                      <span className="font-semibold text-blue-600">94.5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowMarkAttendance(true)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Mark Attendance</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track daily attendance</div>
                    </button>
                    <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Exam Schedule</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View and manage exams</div>
                    </button>
                    <button
                      onClick={() => setShowAddMarks(true)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Add Marks</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Enter student grades</div>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sections</h3>
              <Button size="sm" onClick={() => setShowAddSection(true)}>
                + Add Section
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.name}</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Students: {section.students}</p>
                    <p className="text-gray-600 dark:text-gray-400">Teacher: {section.teacher}</p>
                  </div>
                  <button className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subjects</h3>
              <Button size="sm" onClick={() => setShowAddSubject(true)}>
                + Add Subject
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Teacher</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Periods/Week</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{subject.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{subject.teacher}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{subject.periodsPerWeek}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Class Timetable</h3>
              <Button size="sm" onClick={() => setShowGenerateTimetable(true)}>
                Generate New Timetable
              </Button>
            </div>
            {timetable.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No timetable generated</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by generating a new timetable.</p>
                <div className="mt-6">
                  <Button size="sm" onClick={() => setShowGenerateTimetable(true)}>
                    Generate Timetable
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800">
                        Time
                      </th>
                      {DEFAULT_DAYS.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {periods.map((period) => (
                      <tr key={period}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                          {period}
                        </td>
                        {DEFAULT_DAYS.map((day) => {
                          const slot = timetable.find((s) => s.day === day && s.period === period);
                          return (
                            <td
                              key={`${day}-${period}`}
                              className={`px-4 py-3 text-sm border-r border-gray-200 dark:border-gray-800 ${
                                period === 'Break' || period === 'Lunch'
                                  ? 'bg-gray-100 dark:bg-gray-800/50 text-center font-medium text-gray-500'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              {slot ? (
                                period === 'Break' || period === 'Lunch' ? (
                                  <span>{period}</span>
                                ) : (
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{slot.subject}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{slot.teacher}</div>
                                    {slot.room && <div className="text-xs text-gray-400 dark:text-gray-500">{slot.room}</div>}
                                  </div>
                                )
                              ) : (
                                <div className="text-gray-400 dark:text-gray-600 text-center">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Students</h3>
              <div className="flex gap-2">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.name}>{section.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <Button size="sm" onClick={() => setShowMarkAttendance(true)}>
                  Mark Attendance
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Section</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Attendance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Avg Marks</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{student.rollNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.section}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.attendance >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          student.attendance >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {student.attendance}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.avgMarks}%</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setShowStudentDetail(student)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Section</h3>
              <button onClick={() => setShowAddSection(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSection} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Section E"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Teacher</label>
                <input
                  type="text"
                  name="teacher"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Mr. John Doe"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddSection(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Section</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Subject</h3>
              <button onClick={() => setShowAddSubject(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher</label>
                <input
                  type="text"
                  name="teacher"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periods per Week</label>
                <input
                  type="number"
                  name="periods"
                  required
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddSubject(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Subject</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Timetable Modal */}
      {showGenerateTimetable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full my-8">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generate Timetable</h3>
              <button onClick={() => setShowGenerateTimetable(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleGenerateTimetable} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Periods per Day <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalPeriods"
                    defaultValue={timetableConfig.totalPeriods}
                    required
                    min="4"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Period Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="periodDuration"
                    defaultValue={timetableConfig.periodDuration}
                    required
                    min="30"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={timetableConfig.startTime}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={timetableConfig.endTime}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Break Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Break After Period
                    </label>
                    <input
                      type="number"
                      name="breakAfter"
                      defaultValue={timetableConfig.breakAfter[0]}
                      min="1"
                      max="8"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="breakDuration"
                      defaultValue={timetableConfig.breakDuration}
                      min="10"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Lunch Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lunch After Period
                    </label>
                    <input
                      type="number"
                      name="lunchAfter"
                      defaultValue={timetableConfig.lunchAfter}
                      min="2"
                      max="8"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lunch Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="lunchDuration"
                      defaultValue={timetableConfig.lunchDuration}
                      min="20"
                      max="60"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ The timetable will be generated automatically based on your subjects and configuration. You can edit individual slots after generation.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowGenerateTimetable(false)}>
                  Cancel
                </Button>
                <Button type="submit">Generate Timetable</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showStudentDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Details</h3>
              <button onClick={() => setShowStudentDetail(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{showStudentDetail.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Roll No</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{showStudentDetail.rollNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Section</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{showStudentDetail.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{showStudentDetail.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Parent Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{showStudentDetail.parentPhone}</p>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{showStudentDetail.attendance}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Marks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{showStudentDetail.avgMarks}%</p>
                  </div>
                </div>
              </div>

              {/* Subject-wise Marks */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subject-wise Performance</h4>
                <div className="space-y-2">
                  {subjects.slice(0, 5).map((subject) => {
                    const marks = Math.floor(Math.random() * 30) + 70; // Mock data
                    return (
                      <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{subject.name}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{marks}/100</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" onClick={() => setShowStudentDetail(null)}>
                  Close
                </Button>
                <Button onClick={() => {/* Navigate to full profile */}}>
                  View Full Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal - Placeholder */}
      {showMarkAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mark Attendance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Attendance marking feature will be implemented here.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowMarkAttendance(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Marks Modal - Placeholder */}
      {showAddMarks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Marks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Marks entry feature will be implemented here.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowAddMarks(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
