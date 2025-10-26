'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import { userService, type User } from '../../../../lib/services/user.service';
import { CreateUserModal, type UserFormData } from '../../../../components/modals/create-user-modal';
import { AssignTeacherModal } from '../../../../components/modals/assign-teacher-modal';

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showStaffModal, setShowStaffModal] = useState<User | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [assignTeacher, setAssignTeacher] = useState<User | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend already filters by tenantId automatically via JWT
      const allUsers = await userService.getUsers();
      // Filter for teachers and admins (staff members)
      const staffList = allUsers.filter(
        u => u.role === 'teacher' || u.role === 'tenant_admin' || u.role === 'accountant'
      );
      setStaff(staffList);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    if (!roleFilter) return staff;
    return staff.filter(s => {
      if (roleFilter === 'teacher') return s.role === 'teacher';
      if (roleFilter === 'tenant_admin') return s.role === 'tenant_admin';
      if (roleFilter === 'accountant') return s.role === 'accountant';
      return true;
    });
  }, [staff, roleFilter]);

  const handleCreateStaff = async (userData: UserFormData) => {
    try {
      await userService.createUser(userData);
      setBanner('Staff member created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsStaffModalOpen(false);
      // Refresh the staff list
      await fetchStaff();
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  const handleDeleteStaff = async (staffId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await userService.deleteUser(staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
      setBanner('Staff member deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete staff:', err);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'teacher': return 'Teacher';
      case 'tenant_admin': return 'Admin';
      case 'accountant': return 'Accountant';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'tenant_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'accountant': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <section className="animate-slide-in-left">
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Staff {!loading && `(${staff.length})`}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="tenant_admin">Admins</option>
              <option value="accountant">Accountants</option>
            </select>
          </div>
          <Button size="sm" onClick={() => setIsStaffModalOpen(true)}>
            + Add Staff
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 animate-fadeIn">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <div className="text-gray-500">Loading staff...</div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-10 text-center text-gray-500 space-y-3">
            <div className="text-5xl">👥</div>
            <div>{staff.length === 0 ? 'No staff members added yet' : 'No staff found with selected filter'}</div>
            <Button onClick={() => setIsStaffModalOpen(true)}>Add Staff Member</Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
            {filteredStaff.map((member) => (
              <li
                key={member.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-all duration-200 cursor-pointer"
                onClick={() => setShowStaffModal(member)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 grid place-items-center font-semibold text-lg">
                    {member.firstName?.charAt(0) || 'U'}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {member.firstName} {member.lastName}
                    </span>
                    {member.email && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{member.email}</span>
                    )}
                    {member.employeeId && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{member.employeeId}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {getRoleDisplay(member.role)}
                  </span>
                  {member.role === 'teacher' && (
                    <button
                      title="Assign Classes & Subjects"
                      className="text-gray-400 hover:text-indigo-500 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignTeacher(member);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  )}
                  <button
                    title="Delete"
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={(e) => handleDeleteStaff(member.id, e)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Staff details modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setShowStaffModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Staff Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Employee ID</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 font-mono">
                  {showStaffModal.employeeId || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Name</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStaffModal.firstName} {showStaffModal.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {showStaffModal.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Role</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(showStaffModal.role)}`}>
                  {getRoleDisplay(showStaffModal.role)}
                </span>
              </div>
              {showStaffModal.phoneNumber && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {showStaffModal.phoneNumber}
                  </span>
                </div>
              )}
              {showStaffModal.qualification && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Qualification</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {showStaffModal.qualification}
                  </span>
                </div>
              )}
              {showStaffModal.joiningDate && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Joining Date</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(showStaffModal.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {showStaffModal.role === 'teacher' && showStaffModal.subjects && showStaffModal.subjects.length > 0 && (
                <div className="flex items-start justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Assigned Subjects</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                    {showStaffModal.subjects.map((subject: any) => (
                      <span
                        key={subject._id || subject}
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs"
                      >
                        {subject.name || subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {showStaffModal.role === 'teacher' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStaffModal(null);
                    setAssignTeacher(showStaffModal);
                  }}
                  className="w-full"
                >
                  Assign Classes & Subjects
                </Button>
              </div>
            )}
            <div className="mt-6 text-right">
              <Button variant="outline" onClick={() => setShowStaffModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create staff modal */}
      <CreateUserModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      {/* Assign teacher modal */}
      {assignTeacher && (
        <AssignTeacherModal
          isOpen={true}
          onClose={() => setAssignTeacher(null)}
          teacher={assignTeacher}
          onSuccess={() => {
            setBanner('Teacher assignments saved successfully!');
            setTimeout(() => setBanner(null), 3000);
            setAssignTeacher(null);
            fetchStaff();
          }}
        />
      )}
    </section>
  );
}
