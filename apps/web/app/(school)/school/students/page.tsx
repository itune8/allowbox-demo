'use client';

import { useState, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import { studentService } from '../../../../lib/services/student.service';
import { CreateStudentModal, type StudentFormData } from '../../../../components/modals/create-student-modal';

type Student = { id: string; name: string; className: string; age: number };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState<Student | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q));
  }, [students, studentQuery]);

  const handleCreateStudent = async (studentData: StudentFormData) => {
    try {
      await studentService.createStudent(studentData);
      setBanner('Student created successfully!');
      setTimeout(() => setBanner(null), 1500);
      setIsStudentModalOpen(false);
      // Optionally refresh the student list here
    } catch (error) {
      console.error('Failed to create student:', error);
      throw error;
    }
  };

  return (
    <section className="animate-slide-in-right">
      {banner && (
        <div className="mb-4 animate-fade-in">
          <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded">{banner}</div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Students</h2>
        <form
          className="relative flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setStudentQuery(studentSearch);
          }}
        >
          <input
            placeholder="Search by name or class"
            className="h-10 w-64 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-9 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />
          <span className="absolute left-3 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          {studentSearch && (
            <button
              type="button"
              className="absolute right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setStudentSearch('');
                setStudentQuery('');
              }}
            >
              ×
            </button>
          )}
          <Button size="sm" type="submit" className="ml-2">
            Search
          </Button>
          <Button size="sm" type="button" className="ml-2" onClick={() => setIsStudentModalOpen(true)}>
            + Add Student
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fadeIn">
        <table className="min-w-full text-sm hidden md:table">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">Age</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <div className="text-5xl">🎓</div>
                    <div>No students found.</div>
                    <Button onClick={() => setIsStudentModalOpen(true)}>Add Student</Button>
                  </div>
                </td>
              </tr>
            )}
            {filteredStudents.map((s) => (
              <tr
                key={s.id}
                className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-all duration-200 ease-in-out"
                onClick={() => setShowStudentModal(s)}
              >
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium hover:text-gray-900">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.className}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.age}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3 text-gray-400">
                    <button
                      title="Edit"
                      className="hover:text-indigo-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStudentModal(s);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                        <path d="M14.06 4.94l3.75 3.75" />
                      </svg>
                    </button>
                    <button
                      title="Delete"
                      className="hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudents((prev) => prev.filter((x) => x.id !== s.id));
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
              onClick={() => setShowStudentModal(s)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500">Age {s.age}</div>
              </div>
              <div className="text-sm text-gray-700">{s.className}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Student details modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowStudentModal(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-3">Student Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-900">{showStudentModal.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Class</span>
                <span className="font-medium text-gray-900">{showStudentModal.className}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Age</span>
                <span className="font-medium text-gray-900">{showStudentModal.age}</span>
              </div>
            </div>
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setShowStudentModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create student modal */}
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleCreateStudent}
      />
    </section>
  );
}
