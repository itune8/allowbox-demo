'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, Icon3D } from '../../../../components/ui';
import {
  HeartPulse,
  Activity,
  Phone,
  AlertTriangle,
  Stethoscope,
  X,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  healthRecordsService,
  HealthRecord,
} from '../../../../lib/services/health-records.service';
import { userService, User } from '../../../../lib/services/user.service';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

export default function ParentHealthPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild) {
      loadHealthRecordForChild(selectedChild._id || selectedChild.id);
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      setLoading(true);
      setError(null);

      const parentData = await userService.getUserById(authUser!.id);

      if (parentData?.children && parentData.children.length > 0) {
        // Children might be populated objects or just IDs
        const childrenData = await Promise.all(
          parentData.children.map((child: any) => {
            const childId = typeof child === 'string' ? child : (child._id || child.id);
            return userService.getUserById(childId);
          })
        );
        setChildren(childrenData as Child[]);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0] as Child);
        }
      } else {
        const students = await userService.getStudents();
        const myChildren = students.filter(
          (s: User) => s.parents?.includes(parentData._id || parentData.id) || s.parentEmail === authUser?.email
        );
        setChildren(myChildren as Child[]);
        if (myChildren.length > 0) {
          setSelectedChild(myChildren[0] as Child);
        }
      }
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Failed to load children data');
    } finally {
      setLoading(false);
    }
  }

  async function loadHealthRecordForChild(childId: string) {
    try {
      setLoading(true);
      const record = await healthRecordsService.getByStudent(childId);
      setRecords(record ? [record] : []);
    } catch (err: any) {
      // If 404, no record exists yet
      if (err?.response?.status === 404) {
        setRecords([]);
      } else {
        console.error('Failed to load health records:', err);
        setError('Failed to load health records');
      }
    } finally {
      setLoading(false);
    }
  }

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

  if (children.length === 0 && !loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-red-500 to-rose-500" size="lg">
            <HeartPulse className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-600 mt-1">
              View your child's health information
            </p>
          </div>
        </div>
        <GlassCard hover={false} className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center"
          >
            <HeartPulse className="w-8 h-8 text-red-400" />
          </motion.div>
          <h3 className="font-semibold text-gray-900 mb-2">No Children Linked</h3>
          <p className="text-gray-500">
            No children are linked to your account. Please contact the school administrator.
          </p>
        </GlassCard>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Icon3D gradient="from-red-500 to-rose-500" size="lg">
            <HeartPulse className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Health Records</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View your child's health information
            </p>
          </div>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 min-w-0 max-w-[120px] sm:max-w-none"
            value={selectedChild?._id || selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => (c._id || c.id) === e.target.value);
              setSelectedChild(child || null);
            }}
          >
            {children.map((child) => (
              <option key={child._id || child.id} value={child._id || child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedChild && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard hover={false} className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0 shadow-md"
              >
                {selectedChild.firstName?.[0]}
              </motion.div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {selectedChild.firstName} {selectedChild.lastName}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  {selectedChild.classId?.name || 'No class assigned'}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

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

      {records.length === 0 ? (
        <GlassCard hover={false} className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center"
          >
            <HeartPulse className="w-8 h-8 text-red-400" />
          </motion.div>
          <h3 className="font-semibold text-gray-900 mb-2">No Health Records</h3>
          <p className="text-gray-500">
            Health records for your children will appear here once added by the school.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {records.map((record, index) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <GlassCard hover className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                    >
                      {record.studentId?.firstName?.[0]}{record.studentId?.lastName?.[0]}
                    </motion.div>
                    <h3 className="font-semibold text-gray-900">
                      {record.studentId?.firstName} {record.studentId?.lastName}
                    </h3>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                      View Details
                    </Button>
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                      Blood Group
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">{record.bloodGroup || 'Not set'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                      Allergies
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">{record.allergies.length || 'None'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Activity className="w-3.5 h-3.5 text-red-500" />
                      Conditions
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">
                      {record.medicalConditions.filter(c => c.isOngoing).length || 'None'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      Emergency
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{record.emergencyContacts[0]?.name || 'Not set'}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Health Record Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
              <div className="flex items-start justify-between mb-6">
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

            <div className="space-y-6">
              {/* Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
              >
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                    Blood Group
                  </div>
                  <div className="font-semibold text-red-600 text-sm sm:text-base">{selectedRecord.bloodGroup || 'Not set'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Height
                  </div>
                  <div className="font-medium text-sm sm:text-base">{selectedRecord.height ? `${selectedRecord.height} cm` : 'Not set'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Weight
                  </div>
                  <div className="font-medium text-sm sm:text-base">{selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not set'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
                    Physician
                  </div>
                  <div className="font-medium text-xs sm:text-sm truncate">{selectedRecord.primaryPhysician || 'Not set'}</div>
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
                    {selectedRecord.allergies.map((allergy, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        className="bg-orange-50 border border-orange-100 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-medium">{allergy.name}</span>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            {allergy.type}
                          </span>
                          {allergy.severity && (
                            <span className="text-xs text-red-600">({allergy.severity})</span>
                          )}
                        </div>
                        {allergy.notes && <p className="text-sm text-gray-600 mt-1">{allergy.notes}</p>}
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
                    {selectedRecord.medicalConditions.map((condition, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + idx * 0.05 }}
                        className="bg-red-50 border border-red-100 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-red-800">{condition.name}</span>
                          {condition.isOngoing && (
                            <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Ongoing
                            </span>
                          )}
                        </div>
                        {condition.description && (
                          <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                        )}
                        {condition.treatment && (
                          <p className="text-xs text-red-600 mt-1">Treatment: {condition.treatment}</p>
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
                    {selectedRecord.emergencyContacts.map((contact, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium text-emerald-800">{contact.name}</span>
                          <span className="text-emerald-600 ml-2">({contact.relationship})</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                        {contact.alternatePhone && (
                          <p className="text-sm text-gray-500 mt-1">Alt: {contact.alternatePhone}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Vaccinations */}
              {selectedRecord.vaccinations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vaccinations</h4>
                  <div className="space-y-2">
                    {selectedRecord.vaccinations.map((vaccine, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800">{vaccine.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            vaccine.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : vaccine.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {vaccine.status}
                          </span>
                        </div>
                        {vaccine.dateAdministered && (
                          <p className="text-sm text-gray-500 mt-1">
                            Date: {new Date(vaccine.dateAdministered).toLocaleDateString()}
                          </p>
                        )}
                        {vaccine.nextDueDate && (
                          <p className="text-sm text-orange-600 mt-1">
                            Next due: {new Date(vaccine.nextDueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {selectedRecord.specialInstructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{selectedRecord.specialInstructions}</p>
                  </div>
                </div>
              )}

              {/* Insurance Info */}
              {(selectedRecord.insuranceProvider || selectedRecord.insurancePolicyNumber) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Insurance Information</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {selectedRecord.insuranceProvider && (
                      <p><span className="text-gray-500">Provider:</span> {selectedRecord.insuranceProvider}</p>
                    )}
                    {selectedRecord.insurancePolicyNumber && (
                      <p><span className="text-gray-500">Policy #:</span> {selectedRecord.insurancePolicyNumber}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex justify-end mt-6 pt-4 border-t border-gray-200"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
