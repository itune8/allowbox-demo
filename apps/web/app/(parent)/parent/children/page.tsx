'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { timetableService } from '@/lib/services/timetable.service';
import { MinimalCard } from '@repo/ui/cards';
import { EmptyState } from '@repo/ui/data-display';
import { Users, GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function ChildrenPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<User[]>([]);
  const [classTeachers, setClassTeachers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const currentUser = await userService.getUserById(user?.id || '');
      const childrenData = currentUser.children || [];

      if (childrenData.length > 0 && typeof childrenData[0] === 'object' && (childrenData[0] as any).email) {
        const populatedChildren = childrenData.map((child: any) => ({
          ...child,
          id: child._id || child.id,
        }));
        setChildren(populatedChildren as User[]);
      } else {
        const myChildren: User[] = [];
        if (childrenData.length > 0) {
          const allUsers = await userService.getUsers();
          childrenData.forEach(childId => {
            const childIdStr = typeof childId === 'string'
              ? childId
              : (childId as any)?._id || (childId as any)?.toString?.() || childId;

            const child = allUsers.find(u => {
              const userId = u.id || u._id;
              return userId === childIdStr;
            });

            if (child) {
              myChildren.push(child);
            }
          });
        }
        setChildren(myChildren);
      }

      await fetchClassTeachers();
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTeachers = async () => {
    try {
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

      const allUsers = await userService.getUsers();
      const teachers = allUsers.filter(u => u.role === 'teacher');
      const teacherMap = new Map<string, User>();

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Children</h1>
        <p className="text-slate-600 mt-1">View and manage your children's profiles</p>
      </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <MinimalCard padding="lg">
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No children linked yet"
            description={
              user?.roles?.includes('student') || (user as any)?.role === 'student'
                ? 'You are logged in as a student. To view children, please log in with a parent account.'
                : 'Contact your school administrator to link your children\'s accounts to your parent profile.'
            }
          />
          {(user?.roles?.includes('student') || (user as any)?.role === 'student') && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you are a parent, ask the school administrator to:
                <br />
                • Create a parent account for you
                <br />
                • Link your children to your parent account
                <br />
                Then log in with your parent credentials.
              </p>
            </div>
          )}
        </MinimalCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => {
            const teacher = getClassTeacher(child);

            return (
              <MinimalCard
                key={child.id || child._id}
                padding="md"
                hover
                className="cursor-pointer"
                onClick={() => router.push(`/parent/children/${child.id || child._id}`)}
              >
                {/* Child Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {child.firstName?.[0]}{child.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">
                      {typeof child.classId === 'object' && child.classId?.name
                        ? `${child.classId.name}${child.section ? ` - Section ${child.section}` : ''}`
                        : child.section
                        ? `Section ${child.section}`
                        : 'Not assigned'}
                    </p>
                    {child.studentId && (
                      <p className="text-xs text-slate-500 font-mono mt-1 truncate">
                        ID: {child.studentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Child Details */}
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  {child.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 truncate">{child.email}</span>
                    </div>
                  )}
                  {teacher && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600">
                        Teacher: <span className="font-medium text-slate-900">{teacher.firstName} {teacher.lastName}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* View Profile Button */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                    View Full Profile
                  </button>
                </div>
              </MinimalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
