'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  HeartPulse,
  Users,
  AlertTriangle,
  Plus,
  X,
  Filter,
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
  Sparkles,
  Save,
} from 'lucide-react';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
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

  // Calculate stats
  const totalRecords = records.length;
  const medicalAlerts = records.filter(
    (r) => r.allergies.length > 0 || r.medicalConditions.some((c) => c.isOngoing)
  ).length;
  const withEmergencyContacts = records.filter((r) => r.emergencyContacts.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-10 w-10 border-4 border-red-200 border-t-red-500"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-red-500 to-rose-500" size="lg">
            <HeartPulse className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage student health records and medical information
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Health Record
          </Button>
        </motion.div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatedStatCard
          title="Total Records"
          value={totalRecords}
          icon={<FileText className="w-5 h-5 text-red-600" />}
          iconBgColor="bg-red-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Medical Alerts"
          value={medicalAlerts}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          delay={1}
          trend={medicalAlerts > 0 ? { value: 'Requires attention', isPositive: false } : undefined}
        />
        <AnimatedStatCard
          title="Emergency Contacts"
          value={withEmergencyContacts}
          icon={<Phone className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          delay={2}
        />
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
            <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filter === 'all'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          All Records
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFilter('alerts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filter === 'alerts'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Medical Alerts
        </motion.button>
      </div>

      {/* Records Table */}
      <GlassCard hover={false} className="overflow-hidden">
        {records.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center text-gray-500"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center"
            >
              <HeartPulse className="w-8 h-8 text-red-400" />
            </motion.div>
            <p className="text-lg font-medium text-gray-600">No health records found</p>
            <p className="text-sm text-gray-400 mt-1">Add a health record to get started</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="py-4 px-4 font-semibold">Student</th>
                  <th className="py-4 px-4 font-semibold">Blood Group</th>
                  <th className="py-4 px-4 font-semibold">Allergies</th>
                  <th className="py-4 px-4 font-semibold">Conditions</th>
                  <th className="py-4 px-4 font-semibold">Emergency Contact</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record, index) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="group cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                        >
                          {record.studentId?.firstName?.[0]}{record.studentId?.lastName?.[0]}
                        </motion.div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.studentId?.firstName} {record.studentId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{record.studentId?.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {record.bloodGroup && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${bloodGroupColors[record.bloodGroup] || 'bg-gray-100'}`}
                        >
                          {record.bloodGroup}
                        </motion.span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {record.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {record.allergies.slice(0, 2).map((a, i) => (
                            <motion.span
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {a.name}
                            </motion.span>
                          ))}
                          {record.allergies.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">+{record.allergies.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {record.medicalConditions.filter(c => c.isOngoing).length > 0 ? (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
                        >
                          <Activity className="w-3 h-3" />
                          {record.medicalConditions.filter(c => c.isOngoing).length} Active
                        </motion.span>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm">{record.emergencyContacts[0]?.name || 'Not set'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                          className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* View Record Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedRecord(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  >
                    {selectedRecord.studentId?.firstName?.[0]}{selectedRecord.studentId?.lastName?.[0]}
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedRecord.studentId?.firstName} {selectedRecord.studentId?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Health Record Details</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              <div className="space-y-5 text-sm">
                {/* Basic Info Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-red-500" />
                    <span className="text-gray-500">Blood Group:</span>
                    <span className="font-medium text-gray-900">{selectedRecord.bloodGroup || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-500">Height:</span>
                    <span className="font-medium text-gray-900">{selectedRecord.height ? `${selectedRecord.height} cm` : 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-500">Weight:</span>
                    <span className="font-medium text-gray-900">{selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-500">Physician:</span>
                    <span className="font-medium text-gray-900">{selectedRecord.primaryPhysician || 'Not set'}</span>
                  </div>
                </motion.div>

                {/* Allergies */}
                {selectedRecord.allergies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Allergies
                    </h4>
                    <div className="space-y-2">
                      {selectedRecord.allergies.map((a, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="bg-orange-50 p-3 rounded-lg border border-orange-100"
                        >
                          <span className="font-medium text-orange-800">{a.name}</span>
                          <span className="text-orange-600 ml-2">({a.type})</span>
                          {a.severity && (
                            <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs">
                              {a.severity}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Medical Conditions */}
                {selectedRecord.medicalConditions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <Activity className="w-4 h-4 text-red-500" />
                      Medical Conditions
                    </h4>
                    <div className="space-y-2">
                      {selectedRecord.medicalConditions.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.05 }}
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Emergency Contacts */}
                {selectedRecord.emergencyContacts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      Emergency Contacts
                    </h4>
                    <div className="space-y-2">
                      {selectedRecord.emergencyContacts.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Special Instructions */}
                {selectedRecord.specialInstructions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Special Instructions
                    </h4>
                    <p className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800">
                      {selectedRecord.specialInstructions}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => handleEdit(selectedRecord)} className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Edit Record
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Form Modal - Enhanced UI */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => { setShowForm(false); resetForm(); }}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
            >
              {/* Glass morphism container */}
              <div className="bg-white/95 backdrop-blur-xl border border-white/20 overflow-y-auto max-h-[90vh]">
                {/* Gradient Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="relative overflow-hidden"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

                  {/* Animated background elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"
                    />
                  </div>

                  {/* Header content */}
                  <div className="relative px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* 3D Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="relative"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                          <motion.div
                            animate={{
                              rotateY: [0, 10, -10, 0],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <HeartPulse className="w-7 h-7 text-white drop-shadow-lg" />
                          </motion.div>
                        </div>
                        {/* Sparkle effect */}
                        <motion.div
                          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="absolute -top-1 -right-1"
                        >
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                        </motion.div>
                      </motion.div>

                      <div>
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-xl font-bold text-white drop-shadow-md"
                        >
                          {editingRecord ? 'Edit Health Record' : 'Add Health Record'}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-sm text-white/80"
                        >
                          {editingRecord ? 'Update student medical information' : 'Enter student medical information'}
                        </motion.p>
                      </div>
                    </div>

                    {/* Close button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm border border-white/30 transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                  {/* Section: Student Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon3D gradient="from-blue-500 to-indigo-500" size="sm">
                        <User className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-800">Student Information</h4>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl p-1 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <select
                          className="w-full pl-10 pr-4 py-3 text-sm bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 appearance-none cursor-pointer"
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
                    </div>
                  </motion.div>

                  {/* Section: Basic Health Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-red-500 to-rose-500" size="sm">
                        <HeartPulse className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-800">Basic Health Information</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Blood Group */}
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-red-500" />
                          Blood Group
                        </label>
                        <div className="relative">
                          <select
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300 transition-all duration-200 appearance-none cursor-pointer hover:border-red-300"
                            value={formData.bloodGroup}
                            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                          >
                            <option value="">Select</option>
                            {Object.values(BloodGroup).map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Height */}
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5 text-blue-500" />
                          Height (cm)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all duration-200 hover:border-blue-300"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : '' })}
                            placeholder="e.g., 150"
                          />
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-emerald-500" />
                          Weight (kg)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all duration-200 hover:border-emerald-300"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : '' })}
                            placeholder="e.g., 45"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Section: Allergies */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-100/80 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon3D gradient="from-orange-500 to-amber-500" size="sm">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-800">Allergies</h4>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, x: 3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addAllergy}
                        className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1.5 font-medium bg-orange-100/80 hover:bg-orange-200/80 px-3 py-1.5 rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" /> Add Allergy
                      </motion.button>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {formData.allergies.length === 0 ? (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-orange-600/60 text-center py-3"
                        >
                          No allergies added yet
                        </motion.p>
                      ) : (
                        formData.allergies.map((allergy, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-2 mb-2"
                          >
                            <select
                              className="border border-orange-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200"
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
                              className="flex-1 border border-orange-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200"
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
                              className="w-24 border border-orange-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200"
                              placeholder="Severity"
                              value={allergy.severity || ''}
                              onChange={(e) => {
                                const newAllergies = [...formData.allergies];
                                newAllergies[index] = { ...allergy, severity: e.target.value };
                                setFormData({ ...formData, allergies: newAllergies });
                              }}
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeAllergy(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-xl transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Section: Emergency Contacts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/80 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                          <Phone className="w-3.5 h-3.5" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-800">Emergency Contacts</h4>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, x: 3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addEmergencyContact}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 font-medium bg-emerald-100/80 hover:bg-emerald-200/80 px-3 py-1.5 rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" /> Add Contact
                      </motion.button>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {formData.emergencyContacts.map((contact, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-2 mb-2"
                        >
                          <div className="relative flex-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                            <input
                              type="text"
                              className="w-full pl-9 pr-3 border border-emerald-200 rounded-xl py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
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
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                            <input
                              type="text"
                              className="w-full pl-9 pr-3 border border-emerald-200 rounded-xl py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
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
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                            <input
                              type="tel"
                              className="w-full pl-9 pr-3 border border-emerald-200 rounded-xl py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
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
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeEmergencyContact(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-xl transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Section: Medical Provider Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-purple-50/80 to-violet-50/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100/80 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-purple-500 to-violet-500" size="sm">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-800">Medical Provider</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
                          Primary Physician
                        </label>
                        <input
                          type="text"
                          className="w-full border border-purple-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all duration-200 hover:border-purple-300"
                          value={formData.primaryPhysician}
                          onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                          placeholder="Doctor name"
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-purple-500" />
                          Physician Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full border border-purple-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all duration-200 hover:border-purple-300"
                          value={formData.physicianPhone}
                          onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Section: Insurance Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                        <Shield className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-800">Insurance Information</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all duration-200 hover:border-blue-300"
                          value={formData.insuranceProvider}
                          onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                          placeholder="Insurance company"
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                          Policy Number
                        </label>
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all duration-200 hover:border-blue-300"
                          value={formData.insurancePolicyNumber}
                          onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                          placeholder="Policy number"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Section: Special Instructions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/80 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-amber-500 to-yellow-500" size="sm">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-800">Special Instructions</h4>
                    </div>

                    <div className="relative">
                      <textarea
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all duration-200 hover:border-amber-300 resize-none"
                        rows={3}
                        value={formData.specialInstructions}
                        onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                        placeholder="Any special medical instructions or notes..."
                      />
                    </div>
                  </motion.div>

                  {/* Footer Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-200/80"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(243, 244, 246, 1)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl border border-gray-200 transition-all duration-200 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className="relative px-6 py-2.5 text-sm font-medium text-white rounded-xl overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {/* Button gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

                      {/* Animated shine effect */}
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />

                      <span className="relative flex items-center gap-2">
                        {submitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            {editingRecord ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingRecord ? 'Update Record' : 'Create Record'}
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
