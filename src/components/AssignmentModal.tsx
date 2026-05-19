import { useState } from 'react';
import { X, Upload, Calendar, BookOpen, FileText, ClipboardCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentInput) => void;
  hellWeek: boolean;
}

export interface AssignmentInput {
  courseCode: string;
  courseName: string;
  courseDesc: string;
  assignmentTitle: string;
  instructions: string;
  rubric: string;
  deadline: string;
  dateAssigned: string;
  syllabus: string;
}

const inputClass = "w-full bg-lumina-surface-low/60 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-lumina-accent/60 focus:ring-1 focus:ring-lumina-accent/30 transition-colors resize-none";

export default function AssignmentModal({ open, onClose, onSubmit, hellWeek }: AssignmentModalProps) {
  const [form, setForm] = useState<AssignmentInput>({
    courseCode: '', courseName: '', courseDesc: '', assignmentTitle: '',
    instructions: '', rubric: '', deadline: '', dateAssigned: '', syllabus: ''
  });

  if (!open) return null;

  const set = (k: keyof AssignmentInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.assignmentTitle || !form.deadline) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={cn(
        "relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl",
        hellWeek ? "bg-[#170a0a] border-red-900/40" : "bg-lumina-surface border-outline-variant/20"
      )}>
        {/* Header */}
        <div className={cn("flex items-center justify-between px-6 py-4 border-b", hellWeek ? "border-red-900/30" : "border-outline-variant/15")}>
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className={cn("w-5 h-5", hellWeek ? "text-red-300" : "text-lumina-primary")} />
            <span className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>Add Assignment</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Course Info */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> Course Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Course Code (e.g. CS 101)" value={form.courseCode} onChange={set('courseCode')} />
              <input className={inputClass} placeholder="Course Name" value={form.courseName} onChange={set('courseName')} />
              <textarea className={cn(inputClass, "col-span-2")} placeholder="Course Description (optional)" rows={2} value={form.courseDesc} onChange={set('courseDesc')} />
            </div>
          </div>

          {/* Assignment Info */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-3 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Assignment Details
            </p>
            <div className="flex flex-col gap-3">
              <input className={inputClass} placeholder="Assignment Title *" value={form.assignmentTitle} onChange={set('assignmentTitle')} />
              <textarea className={inputClass} placeholder="Instructions / Assignment Brief *" rows={3} value={form.instructions} onChange={set('instructions')} />
              <textarea className={inputClass} placeholder="Rubric / Grading Criteria (optional)" rows={2} value={form.rubric} onChange={set('rubric')} />
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-3 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Timeline
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Date Assigned</label>
                <input type="date" className={inputClass} value={form.dateAssigned} onChange={set('dateAssigned')} />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Deadline *</label>
                <input type="date" className={inputClass} value={form.deadline} onChange={set('deadline')} />
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-3 flex items-center gap-1.5">
              <Upload className="w-3 h-3" /> Syllabus (Optional)
            </p>
            <textarea className={inputClass} placeholder="Paste your syllabus content here..." rows={3} value={form.syllabus} onChange={set('syllabus')} />
          </div>
        </div>

        {/* Footer */}
        <div className={cn("px-6 py-4 border-t flex items-center justify-end gap-3", hellWeek ? "border-red-900/30" : "border-outline-variant/15")}>
          <button onClick={onClose} className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.assignmentTitle || !form.deadline}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              form.assignmentTitle && form.deadline
                ? hellWeek
                  ? "bg-red-800/70 text-red-200 hover:bg-red-700/70"
                  : "bg-lumina-primary text-on-primary hover:opacity-90"
                : "bg-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed"
            )}
          >
            Add & Plan with AI
          </button>
        </div>
      </div>
    </div>
  );
}
