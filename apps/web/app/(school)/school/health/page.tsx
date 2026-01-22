'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  HeartPulse,
  Users,
  AlertTriangle,
  Plus,
  X,
  FileText,
  Phone,
  Shield,
  Activity,
  Eye,
  Edit3,
  Stethoscope,
  User,
  Droplets,
  Ruler,
  Scale,
  UserCheck,
  Building2,
  CreditCard,
  ClipboardList,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  healthRecordsService,
  HealthRecord,
  BloodGroup,
  AllergyType,
  Allergy,
  EmergencyContact,
} from '../../../../lib/services/health-records.service';
import { userService, User as UserType } from '../../../../lib/services/user.service';

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
  const [students, setStudents] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'alerts'>('all');
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showFormSheet, setShowFormSheet] = useState(false);
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
    setShowDetailsSheet(false);
    setShowFormSheet(true);
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
      setShowFormSheet(false);
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

  // Calculate stats
  const totalRecords = records.length;
  const medicalAlerts = records.filter(
    (r) => r.allergies.length > 0 || r.medicalConditions.some((c) => c.isOngoing)
  ).length;
  const withEmergencyContacts = records.filter((r) => r.emergencyContacts.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Health Records</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage student health records and medical information
            </p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowFormSheet(true); }} className="flex items-center gap-2 bg-primary hover:bg-primary-dark">
          <Plus className="w-4 h-4" /> Add Health Record
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Records */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Records</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Medical Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Medical Alerts</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{medicalAlerts}</p>
              {medicalAlerts > 0 && (
                <p className="text-xs text-amber-600 mt-1">Requires attention</p>
              )}
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Emergency Contacts</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{withEmergencyContacts}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded transition-colors">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          All Records
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === 'alerts'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Medical Alerts
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <HeartPulse className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-medium text-slate-600">No health records found</p>
            <p className="text-sm text-slate-400 mt-1">Add a health record to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-600">
                  <th className="py-4 px-4 font-semibold">Student</th>
                  <th className="py-4 px-4 font-semibold">Blood Group</th>
                  <th className="py-4 px-4 font-semibold">Allergies</th>
                  <th className="py-4 px-4 font-semibold">Conditions</th>
                  <th className="py-4 px-4 font-semibold">Emergency Contact</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {record.studentId?.firstName?.[0]}{record.studentId?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {record.studentId?.firstName} {record.studentId?.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{record.studentId?.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {record.bloodGroup && (
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${bloodGroupColors[record.bloodGroup] || 'bg-slate-100'}`}>
                          {record.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {record.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {record.allergies.slice(0, 2).map((a, i) => (
                            <span
                              key={i}
                              className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {a.name}
                            </span>
                          ))}
                          {record.allergies.length > 2 && (
                            <span className="text-xs text-slate-500 px-2 py-1">+{record.allergies.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {record.medicalConditions.filter(c => c.isOngoing).length > 0 ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <Activity className="w-3 h-3" />
                          {record.medicalConditions.filter(c => c.isOngoing).length} Active
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm">{record.emergencyContacts[0]?.name || 'Not set'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailsSheet(true);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
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

      {/* View Record Sheet */}
      {selectedRecord && (
        <SlideSheet
          isOpen={showDetailsSheet}
          onClose={() => {
            setShowDetailsSheet(false);
            setSelectedRecord(null);
          }}
          title={`${selectedRecord.studentId?.firstName} ${selectedRecord.studentId?.lastName}`}
          subtitle="Health Record Details"
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowDetailsSheet(false);
                setSelectedRecord(null);
              }}>
                Close
              </Button>
              <Button onClick={() => handleEdit(selectedRecord)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark">
                <Edit3 className="w-4 h-4" /> Edit Record
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Basic Info Section */}
            <SheetSection title="Basic Information" icon={<HeartPulse className="w-4 h-4" />}>
              <div className="space-y-3">
                <SheetDetailRow
                  label="Blood Group"
                  value={selectedRecord.bloodGroup || 'Not set'}
                  icon={<Droplets className="w-4 h-4 text-red-500" />}
                />
                <SheetDetailRow
                  label="Height"
                  value={selectedRecord.height ? `${selectedRecord.height} cm` : 'Not set'}
                  icon={<Ruler className="w-4 h-4 text-blue-500" />}
                />
                <SheetDetailRow
                  label="Weight"
                  value={selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not set'}
                  icon={<Scale className="w-4 h-4 text-emerald-500" />}
                />
                <SheetDetailRow
                  label="Primary Physician"
                  value={selectedRecord.primaryPhysician || 'Not set'}
                  icon={<Stethoscope className="w-4 h-4 text-purple-500" />}
                />
                {selectedRecord.physicianPhone && (
                  <SheetDetailRow
                    label="Physician Phone"
                    value={selectedRecord.physicianPhone}
                    icon={<Phone className="w-4 h-4 text-purple-500" />}
                  />
                )}
              </div>
            </SheetSection>

            {/* Allergies Section */}
            {selectedRecord.allergies.length > 0 && (
              <SheetSection title="Allergies" icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}>
                <div className="space-y-2">
                  {selectedRecord.allergies.map((a, i) => (
                    <div
                      key={i}
                      className="bg-orange-50 p-3 rounded-lg border border-orange-100"
                    >
                      <span className="font-medium text-orange-800">{a.name}</span>
                      <span className="text-orange-600 ml-2">({a.type})</span>
                      {a.severity && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs">
                          {a.severity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SheetSection>
            )}

            {/* Medical Conditions Section */}
            {selectedRecord.medicalConditions.length > 0 && (
              <SheetSection title="Medical Conditions" icon={<Activity className="w-4 h-4 text-red-500" />}>
                <div className="space-y-2">
                  {selectedRecord.medicalConditions.map((c, i) => (
                    <div
                      key={i}
                      className="bg-red-50 p-3 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-800">{c.name}</span>
                        {c.isOngoing && (
                          <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Ongoing
                          </span>
                        )}
                      </div>
                      {c.treatment && (
                        <p className="text-xs text-red-600 mt-1">Treatment: {c.treatment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SheetSection>
            )}

            {/* Emergency Contacts Section */}
            {selectedRecord.emergencyContacts.length > 0 && (
              <SheetSection title="Emergency Contacts" icon={<Phone className="w-4 h-4 text-emerald-500" />}>
                <div className="space-y-2">
                  {selectedRecord.emergencyContacts.map((c, i) => (
                    <div
                      key={i}
                      className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-emerald-800">{c.name}</span>
                        <span className="text-emerald-600 ml-2">({c.relationship})</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-sm">{c.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetSection>
            )}

            {/* Insurance Section */}
            {(selectedRecord.insuranceProvider || selectedRecord.insurancePolicyNumber) && (
              <SheetSection title="Insurance Information" icon={<Shield className="w-4 h-4 text-sky-500" />}>
                <div className="space-y-3">
                  {selectedRecord.insuranceProvider && (
                    <SheetDetailRow
                      label="Insurance Provider"
                      value={selectedRecord.insuranceProvider}
                      icon={<Building2 className="w-4 h-4 text-blue-500" />}
                    />
                  )}
                  {selectedRecord.insurancePolicyNumber && (
                    <SheetDetailRow
                      label="Policy Number"
                      value={selectedRecord.insurancePolicyNumber}
                      icon={<CreditCard className="w-4 h-4 text-blue-500" />}
                    />
                  )}
                </div>
              </SheetSection>
            )}

            {/* Special Instructions Section */}
            {selectedRecord.specialInstructions && (
              <SheetSection title="Special Instructions" icon={<FileText className="w-4 h-4 text-amber-500" />}>
                <p className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-sm">
                  {selectedRecord.specialInstructions}
                </p>
              </SheetSection>
            )}
          </div>
        </SlideSheet>
      )}

      {/* Create/Edit Form Sheet */}
      <SlideSheet
        isOpen={showFormSheet}
        onClose={() => {
          setShowFormSheet(false);
          resetForm();
        }}
        title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}
        subtitle={editingRecord ? 'Update student medical information' : 'Enter student medical information'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowFormSheet(false);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              onClick={handleSubmit}
              className="bg-red-500 hover:bg-red-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingRecord ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section: Student Selection */}
          <SheetSection title="Student Information" icon={<User className="w-4 h-4" />}>
            <SheetField label="Select Student" required>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none cursor-pointer hover:border-slate-300 transition-colors"
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
            </SheetField>
          </SheetSection>

          {/* Section: Basic Health Info */}
          <SheetSection title="Basic Health Information" icon={<HeartPulse className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-4">
              <SheetField label="Blood Group" icon={<Droplets className="w-3.5 h-3.5 text-red-500" />}>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-300 transition-all hover:border-slate-300 appearance-none cursor-pointer"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                >
                  <option value="">Select</option>
                  {Object.values(BloodGroup).map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </SheetField>

              <SheetField label="Height (cm)" icon={<Ruler className="w-3.5 h-3.5 text-blue-500" />}>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all hover:border-slate-300"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder="e.g., 150"
                />
              </SheetField>

              <SheetField label="Weight (kg)" icon={<Scale className="w-3.5 h-3.5 text-emerald-500" />}>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 transition-all hover:border-slate-300"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder="e.g., 45"
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Section: Allergies */}
          <SheetSection
            title="Allergies"
            icon={<AlertTriangle className="w-4 h-4" />}
            action={
              <button
                type="button"
                onClick={addAllergy}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1.5 font-medium bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Allergy
              </button>
            }
          >
            {formData.allergies.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-3">
                No allergies added yet
              </p>
            ) : (
              <div className="space-y-2">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
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
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
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
                      className="w-24 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="Severity"
                      value={allergy.severity || ''}
                      onChange={(e) => {
                        const newAllergies = [...formData.allergies];
                        newAllergies[index] = { ...allergy, severity: e.target.value };
                        setFormData({ ...formData, allergies: newAllergies });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SheetSection>

          {/* Section: Emergency Contacts */}
          <SheetSection
            title="Emergency Contacts"
            icon={<Phone className="w-4 h-4" />}
            action={
              <button
                type="button"
                onClick={addEmergencyContact}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 font-medium bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            }
          >
            <div className="space-y-2">
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 border border-slate-200 rounded-xl py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index] = { ...contact, name: e.target.value };
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                    />
                  </div>
                  <div className="relative w-28">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 border border-slate-200 rounded-xl py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Relation"
                      value={contact.relationship}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index] = { ...contact, relationship: e.target.value };
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                    />
                  </div>
                  <div className="relative w-32">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      className="w-full pl-9 pr-3 border border-slate-200 rounded-xl py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index] = { ...contact, phone: e.target.value };
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SheetSection>

          {/* Section: Medical Provider Information */}
          <SheetSection title="Medical Provider" icon={<Stethoscope className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Primary Physician" icon={<Stethoscope className="w-3.5 h-3.5 text-purple-500" />}>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all hover:border-slate-300"
                  value={formData.primaryPhysician}
                  onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                  placeholder="Doctor name"
                />
              </SheetField>

              <SheetField label="Physician Phone" icon={<Phone className="w-3.5 h-3.5 text-purple-500" />}>
                <input
                  type="tel"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all hover:border-slate-300"
                  value={formData.physicianPhone}
                  onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                  placeholder="Phone number"
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Section: Insurance Information */}
          <SheetSection title="Insurance Information" icon={<Shield className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Insurance Provider" icon={<Building2 className="w-3.5 h-3.5 text-blue-500" />}>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all hover:border-slate-300"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  placeholder="Insurance company"
                />
              </SheetField>

              <SheetField label="Policy Number" icon={<CreditCard className="w-3.5 h-3.5 text-blue-500" />}>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all hover:border-slate-300"
                  value={formData.insurancePolicyNumber}
                  onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                  placeholder="Policy number"
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Section: Special Instructions */}
          <SheetSection title="Special Instructions" icon={<ClipboardList className="w-4 h-4" />}>
            <SheetField label="Medical Notes">
              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 transition-all hover:border-slate-300 resize-none"
                rows={3}
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                placeholder="Any special medical instructions or notes..."
              />
            </SheetField>
          </SheetSection>
        </form>
      </SlideSheet>
    </section>
  );
}
