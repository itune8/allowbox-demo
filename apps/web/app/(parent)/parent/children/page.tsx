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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <div className="text-gray-500">Loading children...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">My Children</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage your linked children's profiles
          </p>
        </div>
      </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-12 text-center">
          <div className="text-3xl sm:text-4xl mb-3">🗂️</div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No children linked yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
            {user?.roles?.includes('student') || (user as any)?.role === 'student'
              ? 'You are logged in as a student. To view children, please log in with a parent account.'
              : 'Contact your school administrator to link your children\'s accounts to your parent profile.'}
          </p>
          {user?.roles?.includes('student') || (user as any)?.role === 'student' ? (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> If you are a parent, ask the school administrator to:
                <br />
                1. Create a parent account for you
                <br />
                2. Link your children to your parent account
                <br />
                Then log in with your parent credentials.
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {children.map((child) => {
            const teacher = getClassTeacher(child);

            return (
              <div
                key={child.id || child._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md active:bg-gray-50 dark:active:bg-gray-800 transition-all touch-manipulation"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold grid place-items-center text-lg sm:text-xl flex-shrink-0">
                    {child.firstName?.[0]}{child.lastName?.[0]}
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {typeof child.classId === 'object' && child.classId?.name
                        ? `${child.classId.name}${child.section ? ` - Section ${child.section}` : ''}`
                        : child.section
                        ? `Section ${child.section}`
                        : 'Not assigned'}
                    </p>
                    {child.studentId && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-0.5 truncate">
                        ID: {child.studentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Teacher Information */}
                {teacher && (
                  <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500 flex-shrink-0">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">Teacher:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {teacher.firstName} {teacher.lastName}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm active:scale-[0.98] transition-transform"
                  onClick={() => router.push(`/parent/children/${child.id || child._id}`)}
                >
                  View Profile
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
