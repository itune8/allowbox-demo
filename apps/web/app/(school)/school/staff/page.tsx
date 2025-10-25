'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { userService } from '../../../../lib/services/user.service';
import { CreateUserModal, type UserFormData } from '../../../../components/modals/create-user-modal';

type Staff = { id: string; name: string; role: string };

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showStaffModal, setShowStaffModal] = useState<Staff | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const handleCreateStaff = async (userData: UserFormData) => {
    try {
      await userService.createUser(userData);
      setBanner('Staff member created successfully!');
      setTimeout(() => setBanner(null), 1500);
      setIsStaffModalOpen(false);
      // Optionally refresh the staff list here
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  return (
    <section className="animate-slide-in-left">
      {banner && (
        <div className="mb-4 animate-fade-in">
          <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded">{banner}</div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Staff</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-900 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400"
            >
              <option value="">All Roles</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <Button size="sm" onClick={() => setIsStaffModalOpen(true)}>
            + Add Staff
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 animate-fadeIn">
        <ul className="divide-y text-sm">
          {staff.filter((s) => !roleFilter || s.role.includes(roleFilter)).map((t) => (
            <li
              key={t.id}
              className="py-2 px-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-all duration-200 cursor-pointer"
              onClick={() => setShowStaffModal(t)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center font-semibold">
                  {t.name.slice(0, 1)}
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{t.name}</span>
              </div>
              <div className="inline-flex items-center gap-2 text-gray-700">
                <span className="w-4 h-4 rounded-sm bg-gray-300" />
                <span>{t.role}</span>
              </div>
            </li>
          ))}
        </ul>
        {staff.filter((s) => !roleFilter || s.role.includes(roleFilter)).length === 0 && (
          <div className="py-10 text-center text-gray-500">No staff yet</div>
        )}
      </div>

      {/* Staff details modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowStaffModal(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-3">Staff Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-900">{showStaffModal.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role</span>
                <span className="font-medium text-gray-900">{showStaffModal.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Join Date</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-4 text-right">
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
    </section>
  );
}
