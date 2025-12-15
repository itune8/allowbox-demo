'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  transportService,
  StudentTransport,
} from '../../../../lib/services/transport.service';
import { userService, User } from '../../../../lib/services/user.service';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

export default function ParentTransportPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [assignments, setAssignments] = useState<StudentTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild) {
      loadTransportForChild(selectedChild._id || selectedChild.id);
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

  async function loadTransportForChild(childId: string) {
    try {
      setLoading(true);
      const assignment = await transportService.getStudentTransport(childId);
      setAssignments(assignment ? [assignment] : []);
    } catch (err: any) {
      // If 404, no transport assigned yet
      if (err?.response?.status === 404) {
        setAssignments([]);
      } else {
        console.error('Failed to load transport:', err);
        setError('Failed to load transport info');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transport</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your child's transport route and schedule
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Transport</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your child's transport route
          </p>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-w-0 max-w-[120px] sm:max-w-none"
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-base sm:text-lg flex-shrink-0">
              {selectedChild.firstName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                {selectedChild.firstName} {selectedChild.lastName}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
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

      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">🚌</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Transport Assigned</h3>
          <p className="text-gray-500">
            Your child's transport details will appear here once assigned by the school.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                    {assignment.studentId?.firstName} {assignment.studentId?.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Route: {assignment.routeId?.name}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex-shrink-0 ml-2">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3">
                  <div className="text-xs text-gray-500 mb-1">Pickup Stop</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                    {assignment.pickupStop}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3">
                  <div className="text-xs text-gray-500 mb-1">Drop Stop</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                    {assignment.dropStop}
                  </div>
                </div>
              </div>

              {assignment.routeId?.vehicleId && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Vehicle Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Vehicle:</span>{' '}
                      {assignment.routeId.vehicleId.vehicleNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Driver:</span>{' '}
                      {assignment.routeId.vehicleId.driverName || 'Not assigned'}
                    </div>
                    {assignment.routeId.vehicleId.driverPhone && (
                      <div>
                        <span className="text-gray-500">Driver Phone:</span>{' '}
                        {assignment.routeId.vehicleId.driverPhone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {assignment.specialInstructions && (
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <div className="text-xs text-yellow-600 mb-1">Special Instructions</div>
                  <p className="text-sm">{assignment.specialInstructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
