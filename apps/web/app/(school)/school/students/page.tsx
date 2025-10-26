'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { userService, type User } from '../../../../lib/services/user.service';
import { CreateStudentModal, type StudentFormData } from '../../../../components/modals/create-student-modal';
import { LinkParentModal } from '../../../../components/modals/link-parent-modal';
import { Portal } from '../../../../components/portal';

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState<User | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [linkParentModalOpen, setLinkParentModalOpen] = useState(false);
  const [studentToLink, setStudentToLink] = useState<User | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend already filters by tenantId automatically via JWT
      const allUsers = await userService.getUsers();
      const studentList = allUsers.filter(u => u.role === 'student');
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const className = s.classId?.toString() || '';
      const section = s.section || '';
      const studentId = s.studentId || '';
      return (
        fullName.includes(q) ||
        className.includes(q) ||
        section.includes(q) ||
        studentId.toLowerCase().includes(q)
      );
    });
  }, [students, studentQuery]);

  const handleCreateStudent = async (studentData: StudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing student (don't send email - it's not allowed to update)
        await userService.updateUser(editingStudent.id, {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          bloodGroup: studentData.bloodGroup,
          address: studentData.address,
          phoneNumber: studentData.phoneNumber,
          parentEmail: studentData.parentEmail,
          parentPhone: studentData.parentPhone,
          studentId: studentData.studentId,
          classId: studentData.classId,
          section: studentData.section,
        });
        setBanner('Student updated successfully!');
      } else {
        // Create new student
        await userService.createUser({
          email: studentData.email || `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@school.com`,
          password: 'student123', // Default password - should be changed on first login
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          role: 'student',
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          bloodGroup: studentData.bloodGroup,
          address: studentData.address,
          phoneNumber: studentData.phoneNumber,
          parentEmail: studentData.parentEmail,
          parentPhone: studentData.parentPhone,
          studentId: studentData.studentId,
          classId: studentData.classId,
          section: studentData.section,
        });
        setBanner('Student created successfully!');
      }
      setTimeout(() => setBanner(null), 3000);
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      // Refresh the student list
      await fetchStudents();
    } catch (error) {
      console.error('Failed to save student:', error);
      throw error;
    }
  };

  const handleEditStudent = (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await userService.deleteUser(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setBanner('Student deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student. Please try again.');
    }
  };

  const getAge = (dateOfBirth?: Date | string) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleLinkParent = (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentToLink(student);
    setLinkParentModalOpen(true);
  };

  const handleLinkSuccess = async () => {
    setBanner('Parent linked successfully!');
    setTimeout(() => setBanner(null), 3000);
    await fetchStudents();
  };

  const handleBlockUser = async (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to block ${student.firstName} ${student.lastName}? They will not be able to log in.`)) return;

    try {
      await userService.blockUser(student.id);
      setBanner(`Student blocked successfully`);
      setTimeout(() => setBanner(null), 3000);
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to block student:', err);
      alert(err.response?.data?.message || 'Failed to block student. Please try again.');
    }
  };

  const handleUnblockUser = async (student: User, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await userService.unblockUser(student.id);
      setBanner(`Student unblocked successfully`);
      setTimeout(() => setBanner(null), 3000);
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to unblock student:', err);
      alert('Failed to unblock student. Please try again.');
    }
  };

  return (
    <section className="animate-slide-in-right">
      {banner && (
        <div className="mb-4 animate-fade-in">
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

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Students {!loading && `(${students.length})`}
        </h2>
        <form
          className="relative flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setStudentQuery(studentSearch);
          }}
        >
          <input
            placeholder="Search by name, ID, class or section"
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
              <th className="px-4 py-3 text-left">Student ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Class/Section</th>
              <th className="px-4 py-3 text-left">Age</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <div className="text-gray-500">Loading students...</div>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <div className="text-5xl">🎓</div>
                    <div>{students.length === 0 ? 'No students added yet.' : 'No students found.'}</div>
                    <Button onClick={() => setIsStudentModalOpen(true)}>Add Student</Button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-all duration-200 ease-in-out"
                  onClick={() => setShowStudentModal(student)}
                >
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {student.studentId || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {student.classId ? (
                      <span>
                        Class {(student.classId as any)?.grade || 'N/A'}
                        {student.section && ` - ${student.section}`}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {getAge(student.dateOfBirth)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {student.email || student.phoneNumber || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3 text-gray-400">
                      {student.isBlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-medium">
                            Blocked
                          </span>
                          <button
                            title="Unblock User"
                            className="hover:text-green-500"
                            onClick={(e) => handleUnblockUser(student, e)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          title="Block User"
                          className="hover:text-orange-500"
                          onClick={(e) => handleBlockUser(student, e)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </button>
                      )}
                      <button
                        title="View Details"
                        className="hover:text-indigo-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStudentModal(student);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        title="Link Parent"
                        className="hover:text-green-500"
                        onClick={(e) => handleLinkParent(student, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </button>
                      <button
                        title="Edit/Enroll"
                        className="hover:text-indigo-500"
                        onClick={(e) => handleEditStudent(student, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        title="Delete"
                        className="hover:text-red-500"
                        onClick={(e) => handleDeleteStudent(student.id, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <div className="text-gray-500">Loading students...</div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 space-y-3 py-8">
              <div className="text-5xl">🎓</div>
              <div>{students.length === 0 ? 'No students added yet.' : 'No students found.'}</div>
              <Button onClick={() => setIsStudentModalOpen(true)}>Add Student</Button>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
                onClick={() => setShowStudentModal(student)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{student.studentId}</div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {student.classId ? (
                    <span>
                      Class {(student.classId as any)?.grade || 'N/A'}
                      {student.section && ` - Section ${student.section}`}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not assigned to class</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">Age: {getAge(student.dateOfBirth)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Student details modal */}
      {showStudentModal && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start justify-center overflow-y-auto pt-20 pb-20" onClick={() => setShowStudentModal(null)}>
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6 animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Student Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Student ID</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 font-mono">
                  {showStudentModal.studentId || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Name</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStudentModal.firstName} {showStudentModal.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStudentModal.email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Class/Section</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStudentModal.classId
                    ? `Class ${(showStudentModal.classId as any)?.grade || 'N/A'} ${
                        showStudentModal.section ? `- ${showStudentModal.section}` : ''
                      }`
                    : 'Not assigned'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Age</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {getAge(showStudentModal.dateOfBirth)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Gender</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {showStudentModal.gender || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Blood Group</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStudentModal.bloodGroup || 'N/A'}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Address</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%]">
                  {showStudentModal.address || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Parent Email</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStudentModal.parentEmail || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Parent Phone</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStudentModal.parentPhone || 'N/A'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStudentToLink(showStudentModal);
                  setLinkParentModalOpen(true);
                }}
              >
                Link Parent
              </Button>
              <Button variant="outline" onClick={() => setShowStudentModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Create/Edit student modal */}
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleCreateStudent}
        initialData={editingStudent ? {
          firstName: editingStudent.firstName,
          lastName: editingStudent.lastName,
          email: editingStudent.email,
          dateOfBirth: editingStudent.dateOfBirth ? (typeof editingStudent.dateOfBirth === 'string' ? editingStudent.dateOfBirth : new Date(editingStudent.dateOfBirth).toISOString().split('T')[0]) : '',
          gender: editingStudent.gender,
          bloodGroup: editingStudent.bloodGroup,
          address: editingStudent.address,
          phoneNumber: editingStudent.phoneNumber,
          parentEmail: editingStudent.parentEmail,
          parentPhone: editingStudent.parentPhone,
          studentId: editingStudent.studentId,
          classId: typeof editingStudent.classId === 'string' ? editingStudent.classId : editingStudent.classId?.id,
          section: editingStudent.section,
        } : undefined}
      />

      {/* Link parent modal */}
      {studentToLink && (
        <LinkParentModal
          isOpen={linkParentModalOpen}
          onClose={() => {
            setLinkParentModalOpen(false);
            setStudentToLink(null);
          }}
          studentId={studentToLink.id || studentToLink._id || ''}
          studentName={`${studentToLink.firstName} ${studentToLink.lastName}`}
          onSuccess={handleLinkSuccess}
        />
      )}
    </section>
  );
}
