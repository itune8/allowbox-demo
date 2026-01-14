'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Icon3D } from '../../../../components/ui';
import { Bus, MapPin, Phone, Clock, X } from 'lucide-react';
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-600"
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
          <Icon3D gradient="from-slate-500 to-gray-600" size="lg">
            <Bus className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transport</h1>
            <p className="text-sm text-gray-600 mt-1">
              View your child's transport route and schedule
            </p>
          </div>
        </div>
        <GlassCard hover={false} className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center"
          >
            <Bus className="w-8 h-8 text-slate-400" />
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
          <Icon3D gradient="from-slate-500 to-gray-600" size="lg">
            <Bus className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transport</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View your child's transport route
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
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0 shadow-md"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {assignments.length === 0 ? (
        <GlassCard hover={false} className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center"
          >
            <Bus className="w-8 h-8 text-slate-400" />
          </motion.div>
          <h3 className="font-semibold text-gray-900 mb-2">No Transport Assigned</h3>
          <p className="text-gray-500">
            Your child's transport details will appear here once assigned by the school.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0"
                    >
                      {assignment.studentId?.firstName?.[0]}{assignment.studentId?.lastName?.[0]}
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {assignment.studentId?.firstName} {assignment.studentId?.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center gap-1">
                        <Bus className="w-3 h-3" />
                        Route: {assignment.routeId?.name}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex-shrink-0 ml-2"
                  >
                    Active
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Pickup Stop
                    </div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {assignment.pickupStop}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      Drop Stop
                    </div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {assignment.dropStop}
                    </div>
                  </div>
                </div>

                {assignment.routeId?.vehicleId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border-t border-gray-200 pt-3 sm:pt-4"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                      <Bus className="w-4 h-4 text-slate-600" />
                      Vehicle Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Bus className="w-3.5 h-3.5 text-slate-500" />
                          Vehicle
                        </div>
                        <div className="font-medium text-gray-900">{assignment.routeId.vehicleId.vehicleNumber}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          Driver
                        </div>
                        <div className="font-medium text-gray-900">{assignment.routeId.vehicleId.driverName || 'Not assigned'}</div>
                      </div>
                      {assignment.routeId.vehicleId.driverPhone && (
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                            Driver Phone
                          </div>
                          <div className="font-medium text-gray-900">{assignment.routeId.vehicleId.driverPhone}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {assignment.specialInstructions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-1 text-xs text-yellow-600 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Special Instructions
                    </div>
                    <p className="text-sm text-yellow-800">{assignment.specialInstructions}</p>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
