'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { Portal } from '../portal';

interface LinkParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

type ModalMode = 'search' | 'create';

interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export function LinkParentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: LinkParentModalProps) {
  const [mode, setMode] = useState<ModalMode>('search');
  const [parents, setParents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ParentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchParents();
    }
  }, [isOpen]);

  const fetchParents = async () => {
    setLoading(true);
    setError('');
    try {
      const parentUsers = await userService.getUsersByRole('parent');
      setParents(parentUsers);
    } catch (err) {
      console.error('Failed to fetch parents:', err);
      setError('Failed to load parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedParentId) {
      setError('Please select a parent to link.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await userService.linkParentToChild(selectedParentId, studentId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to link parent:', err);
      setError(err.response?.data?.message || 'Failed to link parent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowCredentials = (parentEmail: string, parentName: string) => {
    alert(
      `PASSWORD INFORMATION for ${parentName}\n\n` +
      `Email: ${parentEmail}\n\n` +
      `Default passwords to try:\n` +
      `• parent123 (if created via Link Parent)\n` +
      `• teacher123 (if created via Staff page)\n\n` +
      `If these don't work:\n` +
      `1. Create a new parent account using "Create New Parent"\n` +
      `2. Link the new parent to the student\n` +
      `3. Delete the old parent account if needed`
    );
  };

  const filteredParents = parents.filter(
    (parent) =>
      parent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAndLink = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields (First Name, Last Name, Email).');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const defaultPassword = 'parent123';

      // Create the parent user
      const newParent = await userService.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: 'parent',
        password: defaultPassword,
      });

      // Link the newly created parent to the student
      await userService.linkParentToChild(newParent.id || newParent._id || '', studentId);

      // Show success message with credentials
      alert(
        `✓ Parent created and linked successfully!\n\n` +
        `LOGIN CREDENTIALS:\n` +
        `Email: ${formData.email}\n` +
        `Password: ${defaultPassword}\n\n` +
        `Please share these credentials with the parent.\n` +
        `They should change the password on first login.`
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create and link parent:', err);
      setError(err.response?.data?.message || 'Failed to create parent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMode('search');
    setSearchTerm('');
    setSelectedParentId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start justify-center overflow-y-auto pt-20 pb-20" onClick={handleClose}>
      <div
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Link Parent to {studentName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'search'
                ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Search Existing
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'create'
                ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Create New Parent
          </button>
        </div>

        {mode === 'search' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Parent
              </label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Parent
          </label>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading parents...
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {parents.length === 0
                ? 'No parents found in the system.'
                : 'No parents match your search.'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {filteredParents.map((parent) => (
                <button
                  key={parent.id || parent._id}
                  onClick={() => setSelectedParentId(parent.id || parent._id || '')}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors ${
                    selectedParentId === (parent.id || parent._id)
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {parent.firstName} {parent.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {parent.email}
                      </div>
                      {parent.phoneNumber && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {parent.phoneNumber}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowCredentials(
                            parent.email,
                            `${parent.firstName} ${parent.lastName}`
                          );
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition-colors"
                        title="Show password information"
                      >
                        Show Password
                      </button>
                      {selectedParentId === (parent.id || parent._id) && (
                        <div className="text-indigo-600 dark:text-indigo-400">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLink}
                disabled={!selectedParentId || submitting}
                className="flex-1"
              >
                {submitting ? 'Linking...' : 'Link Parent'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Create New Parent Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  placeholder="parent@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  placeholder="Enter address..."
                />
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <div className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                      Default Login Credentials
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      <strong>Email:</strong> (as entered above)
                      <br />
                      <strong>Password:</strong> <code className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">parent123</code>
                      <br />
                      <span className="text-xs mt-1 inline-block">
                        You'll receive these credentials in a popup after creation. Share them with the parent securely.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAndLink}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Creating...' : 'Create & Link Parent'}
              </Button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
    </Portal>
  );
}
