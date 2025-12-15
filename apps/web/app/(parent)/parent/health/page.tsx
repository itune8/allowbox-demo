'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health Records</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your child's health information
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Children Linked</h3>
          <p className="text-gray-500">
            No children are linked to your account. Please contact the school administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health Records</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your child's health information
          </p>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
              {selectedChild.firstName?.[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedChild.firstName} {selectedChild.lastName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedChild.classId?.name || 'No class assigned'}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">🏥</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Health Records</h3>
          <p className="text-gray-500">
            Health records for your children will appear here once added by the school.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <div
              key={record._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {record.studentId?.firstName} {record.studentId?.lastName}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                  View Details
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Blood Group</div>
                  <div className="font-medium">{record.bloodGroup || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Allergies</div>
                  <div className="font-medium">{record.allergies.length || 'None'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Medical Conditions</div>
                  <div className="font-medium">
                    {record.medicalConditions.filter(c => c.isOngoing).length || 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Emergency Contact</div>
                  <div className="font-medium">{record.emergencyContacts[0]?.name || 'Not set'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Health Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedRecord(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Health Record
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedRecord.studentId?.firstName} {selectedRecord.studentId?.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Blood Group</div>
                  <div className="font-semibold text-red-600">{selectedRecord.bloodGroup || 'Not set'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Height</div>
                  <div className="font-medium">{selectedRecord.height ? `${selectedRecord.height} cm` : 'Not set'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Weight</div>
                  <div className="font-medium">{selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not set'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Primary Physician</div>
                  <div className="font-medium text-sm">{selectedRecord.primaryPhysician || 'Not set'}</div>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Allergies</h4>
                {selectedRecord.allergies.length === 0 ? (
                  <p className="text-sm text-gray-500">No allergies recorded</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRecord.allergies.map((allergy, idx) => (
                      <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-medium">{allergy.name}</span>
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                            {allergy.type}
                          </span>
                          {allergy.severity && (
                            <span className="text-xs text-red-600">({allergy.severity})</span>
                          )}
                        </div>
                        {allergy.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{allergy.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Medical Conditions */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Medical Conditions</h4>
                {selectedRecord.medicalConditions.length === 0 ? (
                  <p className="text-sm text-gray-500">No medical conditions recorded</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRecord.medicalConditions.map((condition, idx) => (
                      <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">{condition.name}</span>
                          {condition.isOngoing && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">
                              Ongoing
                            </span>
                          )}
                        </div>
                        {condition.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{condition.description}</p>
                        )}
                        {condition.treatment && (
                          <p className="text-sm text-gray-500 mt-1">Treatment: {condition.treatment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency Contacts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Emergency Contacts</h4>
                {selectedRecord.emergencyContacts.length === 0 ? (
                  <p className="text-sm text-gray-500">No emergency contacts recorded</p>
                ) : (
                  <div className="grid gap-2">
                    {selectedRecord.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-blue-800 dark:text-blue-200">{contact.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({contact.relationship})</span>
                          </div>
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline text-sm">
                            {contact.phone}
                          </a>
                        </div>
                        {contact.alternatePhone && (
                          <p className="text-sm text-gray-500 mt-1">Alt: {contact.alternatePhone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vaccinations */}
              {selectedRecord.vaccinations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Vaccinations</h4>
                  <div className="space-y-2">
                    {selectedRecord.vaccinations.map((vaccine, idx) => (
                      <div key={idx} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800 dark:text-green-200">{vaccine.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            vaccine.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : vaccine.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
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
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Special Instructions</h4>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRecord.specialInstructions}</p>
                  </div>
                </div>
              )}

              {/* Insurance Info */}
              {(selectedRecord.insuranceProvider || selectedRecord.insurancePolicyNumber) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Insurance Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
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

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
