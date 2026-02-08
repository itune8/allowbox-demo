'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../../contexts/auth-context';
import {
  homeworkService,
  Homework,
  Submission,
  HomeworkType,
  SubmissionStatus,
} from '../../../../lib/services/homework.service';
import { userService, User } from '../../../../lib/services/user.service';
import { MinimalCard, StatCard } from '@repo/ui/cards';
import { Badge, EmptyState } from '@repo/ui/data-display';
import { BookOpen, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

export default function ParentHomeworkPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild) {
      loadHomeworkForChild(selectedChild);
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      setLoading(true);
      const parentData = await userService.getUserById(authUser!.id);

      if (parentData?.children && parentData.children.length > 0) {
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
      }
    } catch (err) {
      console.error('Failed to load children:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadHomeworkForChild(child: Child) {
    try {
      setLoading(true);
      const childId = child._id || child.id;
      const classId = child.classId?._id;

      const [homeworkData, submissionsData] = await Promise.all([
        classId ? homeworkService.getClassHomework(classId) : Promise.resolve([]),
        homeworkService.getStudentSubmissions(childId),
      ]);

      setHomework(homeworkData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Failed to load homework:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homework</h1>
          <p className="text-slate-600 mt-1">View and track your child's homework assignments</p>
        </div>
        <MinimalCard padding="lg">
          <EmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No Children Linked"
            description="No children are linked to your account. Please contact the school administrator."
          />
        </MinimalCard>
      </div>
    );
  }

  const pendingHomework = homework.filter(hw => {
    const submission = submissions.find(s => s.homeworkId._id === hw._id);
    const isPastDue = new Date(hw.dueDate) < new Date();
    return !submission || (submission.status === SubmissionStatus.PENDING && !isPastDue);
  }).length;

  const overdueHomework = homework.filter(hw => {
    const submission = submissions.find(s => s.homeworkId._id === hw._id);
    const isPastDue = new Date(hw.dueDate) < new Date();
    return !submission && isPastDue;
  }).length;

  const completedHomework = submissions.filter(s =>
    s.status === SubmissionStatus.SUBMITTED ||
    s.status === SubmissionStatus.GRADED ||
    s.status === SubmissionStatus.RETURNED
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homework</h1>
          <p className="text-slate-600 mt-1">View and track {selectedChild?.firstName}'s homework</p>
        </div>
        {children.length > 1 && (
          <select
            value={selectedChild?._id || selectedChild?.id}
            onChange={(e) => {
              const child = children.find(c => (c._id || c.id) === e.target.value);
              if (child) setSelectedChild(child);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {children.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending"
          value={pendingHomework}
          subtitle="Due Soon"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-100"
        />
        <StatCard
          title="Overdue"
          value={overdueHomework}
          subtitle="Past Deadline"
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          iconBgColor="bg-red-100"
        />
        <StatCard
          title="Completed"
          value={completedHomework}
          subtitle="Submitted"
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
        />
      </div>

      {/* Homework List */}
      <MinimalCard padding="md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Assignments</h3>
        {homework.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No Homework"
            description="No homework assignments found for this class."
          />
        ) : (
          <div className="space-y-3">
            {homework.map((hw) => {
              const submission = submissions.find(s => s.homeworkId._id === hw._id);
              const isPastDue = new Date(hw.dueDate) < new Date();
              const isOverdue = !submission && isPastDue;

              return (
                <div
                  key={hw._id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{hw.title}</h4>
                        {isOverdue && <Badge variant="error" size="sm">Overdue</Badge>}
                        {submission && (
                          <Badge
                            variant={
                              submission.status === SubmissionStatus.GRADED ? 'success' :
                              submission.status === SubmissionStatus.SUBMITTED ? 'info' :
                              'warning'
                            }
                            size="sm"
                          >
                            {submission.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{hw.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(hw.dueDate).toLocaleDateString()}
                        </span>
                        <span>{hw.subjectId?.name}</span>
                        {submission?.score !== undefined && (
                          <span className="font-medium text-green-600">Score: {submission.score}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </MinimalCard>
    </div>
  );
}
