'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { attendanceService, type Attendance } from '@/lib/services/attendance.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { timetableService, type TimetableSlot } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { motion } from 'framer-motion';
import { GlassCard, Icon3D } from '@/components/ui';
import { Users, GraduationCap, User as UserIcon } from 'lucide-react';

export default function ChildrenPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<User[]>([]);
  const [childAttendance, setChildAttendance] = useState<Attendance[]>([]);
  const [childInvoices, setChildInvoices] = useState<Invoice[]>([]);
  const [classTeachers, setClassTeachers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      // Fetch current user with populated children field
      const currentUser = await userService.getUserById(user?.id || '');
      console.log('Current user:', currentUser);
      console.log('Children array:', currentUser.children);

      // Get children from the user's children array
      const childrenData = currentUser.children || [];

      // Check if children are already populated (objects with _id, firstName, etc.)
      if (childrenData.length > 0 && typeof childrenData[0] === 'object' && (childrenData[0] as any).email) {
        // Children are already populated, just use them directly
        console.log('Children already populated, using directly');
        const populatedChildren = childrenData.map((child: any) => ({
          ...child,
          id: child._id || child.id,
        }));
        setChildren(populatedChildren as User[]);
      } else {
        // Children are just IDs, need to fetch full details
        console.log('Children are IDs, fetching full details');
        const myChildren: User[] = [];
        if (childrenData.length > 0) {
          const allUsers = await userService.getUsers();
          console.log('All users fetched:', allUsers.length);

          childrenData.forEach(childId => {
            // Handle both ObjectId objects and string IDs
            const childIdStr = typeof childId === 'string'
              ? childId
              : (childId as any)?._id || (childId as any)?.toString?.() || childId;

            console.log('Looking for child with ID:', childIdStr);

            const child = allUsers.find(u => {
              const userId = u.id || u._id;
              return userId === childIdStr;
            });

            if (child) {
              console.log('Found child:', child.firstName, child.lastName);
              myChildren.push(child);
            } else {
              console.warn('Child not found for ID:', childIdStr);
            }
          });
        }
        setChildren(myChildren);
      }

      console.log('Total children found:', children.length);

      // Fetch class teachers for all children
      await fetchClassTeachers();
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTeachers = async () => {
    try {
      // Get unique class IDs from children
      const classIds = children
        .map(child => {
          if (typeof child.classId === 'object' && child.classId?._id) {
            return child.classId._id;
          } else if (typeof child.classId === 'string') {
            return child.classId;
          }
          return null;
        })
        .filter(Boolean) as string[];

      if (classIds.length === 0) return;

      // Fetch all users to find teachers
      const allUsers = await userService.getUsers();
      const teachers = allUsers.filter(u => u.role === 'teacher');

      // Map class to teacher (we'll use the first teacher assigned to teach that class)
      const teacherMap = new Map<string, User>();

      // For now, we'll try to find teachers through timetable
      for (const classId of [...new Set(classIds)]) {
        try {
          const timetable = await timetableService.getSlotsByClass(classId);
          if (timetable.length > 0) {
            const teacherId = timetable[0]?.teacherId;
            const teacher = teachers.find(t => (t.id || t._id) === teacherId);
            if (teacher) {
              teacherMap.set(classId, teacher);
            }
          }
        } catch (err) {
          console.warn(`Could not fetch teacher for class ${classId}`);
        }
   }

      setClassTeachers(teacherMap);
    } catch (err) {
      console.warn('Failed to fetch class teachers:', err);
    }
  };


  const getClassTeacher = (child: User): User | null => {
    const classId = typeof child.classId === 'object' && child.classId?._id
      ? child.classId._id
      : typeof child.classId === 'string'
      ? child.classId
      : null;

    if (!classId) return null;
    return classTeachers.get(classId) || null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[50vh]"
      >
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading children...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Icon3D bgColor="bg-sky-500" size="lg">
          <Users className="w-6 h-6" />
        </Icon3D>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Children</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            View and manage your linked children's profiles
          </p>
        </div>
      </motion.div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-6 sm:p-12 text-center bg-white/80">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl sm:text-4xl mb-3"
            >
              🗂️
            </motion.div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No children linked yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              {user?.roles?.includes('student') || (user as any)?.role === 'student'
                ? 'You are logged in as a student. To view children, please log in with a parent account.'
                : 'Contact your school administrator to link your children\'s accounts to your parent profile.'}
            </p>
            {user?.roles?.includes('student') || (user as any)?.role === 'student' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg text-left"
              >
                <p className="text-xs sm:text-sm text-blue-700">
                  <strong>Note:</strong> If you are a parent, ask the school administrator to:
                  <br />
                  1. Create a parent account for you
                  <br />
                  2. Link your children to your parent account
                  <br />
                  Then log in with your parent credentials.
                </p>
              </motion.div>
            ) : null}
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {children.map((child, index) => {
            const teacher = getClassTeacher(child);

            return (
              <motion.div
                key={child.id || child._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <GlassCard className="p-4 sm:p-6 bg-white/90 hover:shadow-lg transition-all">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-sky-500 text-white font-bold grid place-items-center text-lg sm:text-xl flex-shrink-0 shadow-lg"
                    >
                      {child.firstName?.[0]}{child.lastName?.[0]}
                    </motion.div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {typeof child.classId === 'object' && child.classId?.name
                          ? `${child.classId.name}${child.section ? ` - Section ${child.section}` : ''}`
                          : child.section
                          ? `Section ${child.section}`
                          : 'Not assigned'}
                      </p>
                      {child.studentId && (
                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                          ID: {child.studentId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teacher Information */}
                  {teacher && (
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-gray-600">Teacher:</span>
                        <span className="font-medium text-gray-900 truncate">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-sm"
                      onClick={() => router.push(`/parent/children/${child.id || child._id}`)}
                    >
                      View Profile
                    </Button>
                  </motion.div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
