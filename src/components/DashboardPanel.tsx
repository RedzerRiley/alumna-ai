import { X, CalendarDays, Clock, AlertTriangle, CheckCircle2, Circle, Flame } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface Assignment {
  id: string;
  courseCode: string;
  title: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'done' | 'missed';
  priority: 'high' | 'medium' | 'low';
}

export interface ScheduleBlock {
  date: string;
  time: string;
  task: string;
  course: string;
  duration: string;
  rescheduled?: boolean;
}

interface DashboardPanelProps {
  open: boolean;
  onClose: () => void;
  assignments: Assignment[];
  schedule: ScheduleBlock[];
  hellWeek: boolean;
}

function priorityColor(p: string) {
  if (p === 'high') return 'text-red-400 bg-red-900/30 border-red-800/40';
  if (p === 'medium') return 'text-amber-400 bg-amber-900/30 border-amber-800/40';
  return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/40';
}

function statusIcon(s: string) {
  if (s === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (s === 'missed') return <AlertTriangle className="w-4 h-4 text-red-400" />;
  if (s === 'in-progress') return <Clock className="w-4 h-4 text-amber-400" />;
  return <Circle className="w-4 h-4 text-on-surface-variant" />;
}

export default function DashboardPanel({ open, onClose, assignments, schedule, hellWeek }: DashboardPanelProps) {
  if (!open) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const todaySchedule = schedule.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      {/* Panel */}
      <div className={cn(
        "relative w-[360px] h-full flex flex-col shadow-2xl panel-enter pointer-events-auto border-l",
        hellWeek 
          ? "bg-[#160909]/95 border-red-900/30"
          : "bg-lumina-surface/95 border-outline-variant/20"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-5 py-4 border-b",
          hellWeek ? "border-red-900/30" : "border-outline-variant/15"
        )}>
          <div className="flex items-center gap-2">
            {hellWeek ? <Flame className="w-5 h-5 text-red-400" /> : <CalendarDays className="w-5 h-5 text-lumina-primary" />}
            <span className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
              {hellWeek ? "Hell Week Dashboard" : "Study Dashboard"}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Today's Schedule */}
          <section>
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-3">{today} — Schedule</p>
            {todaySchedule.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No study blocks scheduled for today.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {todaySchedule.map((block, i) => (
                  <div key={i} className={cn(
                    "flex gap-3 p-3 rounded-xl border transition-all",
                    block.rescheduled 
                      ? "bg-amber-900/15 border-amber-800/30"
                      : hellWeek 
                        ? "bg-red-900/10 border-red-900/20"
                        : "bg-lumina-surface-low/60 border-outline-variant/20"
                  )}>
                    <div className="flex-shrink-0 text-right">
                      <p className={cn("text-xs font-mono font-semibold", hellWeek ? "text-red-300" : "text-lumina-secondary")}>{block.time}</p>
                      <p className="text-[10px] text-on-surface-variant/60">{block.duration}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{block.task}</p>
                      <p className="text-[11px] text-on-surface-variant">{block.course}</p>
                      {block.rescheduled && <p className="text-[10px] text-amber-400 mt-0.5">Rescheduled</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="h-px bg-outline-variant/10" />

          {/* Assignments */}
          <section>
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-3">Assignments</p>
            {assignments.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No assignments tracked yet. Ask the AI to help plan one.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {assignments.map((a) => (
                  <div key={a.id} className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border",
                    hellWeek ? "bg-red-900/10 border-red-900/20" : "bg-lumina-surface-low/60 border-outline-variant/20"
                  )}>
                    <div className="flex-shrink-0 mt-0.5">{statusIcon(a.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-on-surface leading-tight">{a.title}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{a.courseCode}</p>
                        </div>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-mono flex-shrink-0", priorityColor(a.priority))}>
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant/60 mt-1">Due: {a.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
