'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  healthRecordsService,
  HealthRecord,
  BloodGroup,
  AllergyType,
  Allergy,
  EmergencyContact,
} from '../../../../lib/services/health-records.service';
import { userService, User } from '../../../../lib/services/user.service';

interface FormData {
  studentId: string;
  bloodGroup: BloodGroup | '';
  height: number | '';
  weight: number | '';
  allergies: Allergy[];
  emergencyContacts: EmergencyContact[];
  primaryPhysician: string;
  physicianPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  specialInstructions: string;
}

const initialFormData: FormData = {
  studentId: '',
  bloodGroup: '',
  height: '',
  weight: '',
  allergies: [],
  emergencyContacts: [{ name: '', relationship: '', phone: '' }],
  primaryPhysician: '',
  physicianPhone: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  specialInstructions: '',
};

export default function SchoolHealthPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'alerts'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const [recordsData, studentsData] = await Promise.all([
        filter === 'alerts' ? healthRecordsService.getMedicalAlerts() : healthRecordsService.getAll(),
        userService.getStudents(),
      ]);
      setRecords(recordsData);
      setStudents(studentsData);
    } catch (err) {
      setError('Failed to load health records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingRecord(null);
  }

  function handleEdit(record: HealthRecord) {
    setEditingRecord(record);
    setFormData({
      studentId: record.studentId._id,
      bloodGroup: record.bloodGroup || '',
      height: record.height || '',
      weight: record.weight || '',
      allergies: record.allergies || [],
      emergencyContacts: record.emergencyContacts.length > 0 ? record.emergencyContacts : [{ name: '', relationship: '', phone: '' }],
      primaryPhysician: record.primaryPhysician || '',
      physicianPhone: record.physicianPhone || '',
      insuranceProvider: record.insuranceProvider || '',
      insurancePolicyNumber: record.insurancePolicyNumber || '',
      specialInstructions: record.specialInstructions || '',
    });
    setShowForm(true);
    setSelectedRecord(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.studentId) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        bloodGroup: formData.bloodGroup || undefined,
        height: formData.height || undefined,
        weight: formData.weight || undefined,
        emergencyContacts: formData.emergencyContacts.filter(c => c.name && c.phone),
      };

      if (editingRecord) {
        await healthRecordsService.update(editingRecord._id, payload);
      } else {
        await healthRecordsService.create(payload);
      }
      await loadData();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save health record');
    } finally {
      setSubmitting(false);
    }
  }

  function addAllergy() {
    setFormData({
      ...formData,
      allergies: [...formData.allergies, { type: AllergyType.OTHER, name: '', severity: '' }],
    });
  }

  function removeAllergy(index: number) {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== index),
    });
  }

  function addEmergencyContact() {
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, { name: '', relationship: '', phone: '' }],
    });
  }

  function removeEmergencyContact(index: number) {
    setFormData({
      ...formData,
      emergencyContacts: formData.emergencyContacts.filter((_, i) => i !== index),
    });
  }

  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-100 text-red-700',
    'A-': 'bg-red-100 text-red-700',
    'B+': 'bg-blue-100 text-blue-700',
    'B-': 'bg-blue-100 text-blue-700',
    'AB+': 'bg-purple-100 text-purple-700',
    'AB-': 'bg-purple-100 text-purple-700',
    'O+': 'bg-green-100 text-green-700',
    'O-': 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health Records</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage student health records and medical information
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Add Health Record</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          All Records
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'alerts'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Medical Alerts
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">🏥</div>
            <p>No health records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Conditions</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {record.studentId?.firstName} {record.studentId?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{record.studentId?.studentId}</div>
                    </td>
                    <td className="py-3 px-4">
                      {record.bloodGroup && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${bloodGroupColors[record.bloodGroup] || 'bg-gray-100'}`}>
                          {record.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {record.allergies.slice(0, 2).map((a, i) => (
                            <span key={i} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                              {a.name}
                            </span>
                          ))}
                          {record.allergies.length > 2 && (
                            <span className="text-xs text-gray-500">+{record.allergies.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.medicalConditions.filter(c => c.isOngoing).length > 0 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                          {record.medicalConditions.filter(c => c.isOngoing).length} Active
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {record.emergencyContacts[0]?.name || 'Not set'}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRecord(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Health Record - {selectedRecord.studentId?.firstName} {selectedRecord.studentId?.lastName}
            </h3>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Blood Group:</span>{' '}
                  {selectedRecord.bloodGroup || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Height:</span>{' '}
                  {selectedRecord.height ? `${selectedRecord.height} cm` : 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Weight:</span>{' '}
                  {selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Primary Physician:</span>{' '}
                  {selectedRecord.primaryPhysician || 'Not set'}
                </div>
              </div>

              {selectedRecord.allergies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Allergies</h4>
                  <div className="space-y-2">
                    {selectedRecord.allergies.map((a, i) => (
                      <div key={i} className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                        <span className="font-medium">{a.name}</span> ({a.type})
                        {a.severity && <span className="ml-2 text-orange-600">- {a.severity}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.medicalConditions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Medical Conditions</h4>
                  <div className="space-y-2">
                    {selectedRecord.medicalConditions.map((c, i) => (
                      <div key={i} className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <span className="font-medium">{c.name}</span>
                        {c.isOngoing && <span className="ml-2 text-red-600">(Ongoing)</span>}
                        {c.treatment && <p className="text-xs mt-1">Treatment: {c.treatment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.emergencyContacts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Emergency Contacts</h4>
                  <div className="space-y-2">
                    {selectedRecord.emergencyContacts.map((c, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span className="font-medium">{c.name}</span> ({c.relationship})
                        <div className="text-xs text-gray-600">{c.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.specialInstructions && (
                <div>
                  <h4 className="font-medium mb-2">Special Instructions</h4>
                  <p className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    {selectedRecord.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
              <Button onClick={() => handleEdit(selectedRecord)}>Edit Record</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => { setShowForm(false); resetForm(); }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingRecord ? 'Edit Health Record' : 'Add Health Record'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Student *</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  disabled={!!editingRecord}
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                  >
                    <option value="">Select</option>
                    {Object.values(BloodGroup).map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : '' })}
                    placeholder="e.g., 150"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : '' })}
                    placeholder="e.g., 45"
                  />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allergies</label>
                  <button type="button" onClick={addAllergy} className="text-sm text-indigo-600 hover:underline">+ Add</button>
                </div>
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900"
                      value={allergy.type}
                      onChange={(e) => {
                        const newAllergies = [...formData.allergies];
                        newAllergies[index] = { ...allergy, type: e.target.value as AllergyType };
                        setFormData({ ...formData, allergies: newAllergies });
                      }}
                    >
                      {Object.values(AllergyType).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900"
                      placeholder="Allergy name"
                      value={allergy.name}
                      onChange={(e) => {
                        const newAllergies = [...formData.allergies];
                        newAllergies[index] = { ...allergy, name: e.target.value };
                        setFormData({ ...formData, allergies: newAllergies });
                      }}
                    />
                    <input
                      type="text"
                      className="w-24 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900"
                      placeholder="Severity"
                      value={allergy.severity || ''}
                      onChange={(e) => {
                        const newAllergies = [...formData.allergies];
                        newAllergies[index] = { ...allergy, severity: e.target.value };
                        setFormData({ ...formData, allergies: newAllergies });
                      }}
                    />
                    <button type="button" onClick={() => removeAllergy(index)} className="text-red-500 hover:text-red-700">X</button>
                  </div>
                ))}
              </div>

              {/* Emergency Contacts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contacts</label>
                  <button type="button" onClick={addEmergencyContact} className="text-sm text-indigo-600 hover:underline">+ Add</button>
                </div>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index] = { ...contact, name: e.target.value };
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                    />
                    <input
                      type="text"
                      className="w-28 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900"
                      placeholder="Relationship"
                      value={contact.relationship}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index] = { ...contact, relationship: e.target.value };
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                    />
                    <input
                      type="tel"
                      className="w-32 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900"
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index] = { ...contact, phone: e.target.value };
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                    />
                    {index > 0 && (
                      <button type="button" onClick={() => removeEmergencyContact(index)} className="text-red-500 hover:text-red-700">X</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Medical Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Primary Physician</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
                    value={formData.primaryPhysician}
                    onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                    placeholder="Doctor name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Physician Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
                    value={formData.physicianPhone}
                    onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    placeholder="Insurance company"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Policy Number</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    placeholder="Policy number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Special Instructions</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
                  rows={2}
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  placeholder="Any special medical instructions..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingRecord ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
