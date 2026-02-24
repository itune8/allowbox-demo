'use client';

import { Users, GraduationCap, ArrowLeft } from 'lucide-react';

const classCardColors = [
  { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  { iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
  { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  { iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
  { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  { iconBg: 'bg-red-100', iconText: 'text-red-600' },
];

const sectionColors = [
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
];

interface ClassData {
  id: string;
  name: string;
  sections: string[];
  studentCount: number;
}

interface ClassSectionCardsProps {
  classes: ClassData[];
  totalStudents: number;
  selectedClass: ClassData | null;
  selectedSection: string | null;
  onSelectAll: () => void;
  onSelectClass: (cls: ClassData) => void;
  onSelectSection: (section: string | null) => void;
  onBack: () => void;
}

export function ClassSectionCards({
  classes,
  totalStudents,
  selectedClass,
  selectedSection,
  onSelectAll,
  onSelectClass,
  onSelectSection,
  onBack,
}: ClassSectionCardsProps) {
  if (selectedClass) {
    return (
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">{selectedClass.name}</span>
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            onClick={() => onSelectSection(null)}
            className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
              selectedSection === null
                ? 'border-[#824ef2] bg-[#824ef2]/5'
                : 'border-slate-200 hover:border-[#824ef2]/30 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-[#824ef2]/10">
                <Users className="w-5 h-5 text-[#824ef2]" />
              </div>
              <span className="text-xl font-bold text-[#824ef2]">{selectedClass.studentCount}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">All Students</p>
            <p className="text-xs text-slate-500">All sections</p>
          </div>
          {selectedClass.sections.map((section, idx) => {
            const color = sectionColors[idx % sectionColors.length];
            return (
              <div
                key={section}
                onClick={() => onSelectSection(section)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selectedSection === section
                    ? 'border-[#824ef2] bg-[#824ef2]/5'
                    : 'border-slate-200 hover:border-[#824ef2]/30 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl ${color?.bg || 'bg-slate-100'} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${color?.text || 'text-slate-700'}`}>{section}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">Section {section}</p>
                <p className="text-xs text-slate-500">{selectedClass.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        onClick={onSelectAll}
        className="rounded-xl border-2 border-[#824ef2] bg-[#824ef2]/5 p-4 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-[#824ef2]/10">
            <Users className="w-5 h-5 text-[#824ef2]" />
          </div>
          <span className="text-xl font-bold text-[#824ef2]">{totalStudents}</span>
        </div>
        <p className="text-sm font-semibold text-slate-900">All Students</p>
        <p className="text-xs text-slate-500">View all students</p>
      </div>
      {classes.map((cls, idx) => {
        const color = classCardColors[idx % classCardColors.length];
        return (
          <div
            key={cls.id}
            onClick={() => onSelectClass(cls)}
            className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-[#824ef2]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${color?.iconBg || 'bg-slate-100'}`}>
                <GraduationCap className={`w-5 h-5 ${color?.iconText || 'text-slate-600'}`} />
              </div>
              <span className="text-xl font-bold text-slate-700">{cls.studentCount}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
            <p className="text-xs text-slate-500">{cls.sections.length} sections</p>
          </div>
        );
      })}
    </div>
  );
}
