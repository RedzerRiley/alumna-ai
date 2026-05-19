import { 
  MessageSquare, 
  CalendarDays, 
  BookOpen, 
  ClipboardList,
  Plus, 
  Settings,
  LayoutDashboard,
  Flame,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Session } from '../App';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hellWeek?: boolean;
}

function NavItem({ icon, label, active, onClick, hellWeek }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left hover:translate-x-0.5",
        active
          ? hellWeek
            ? "bg-red-900/40 text-red-300 font-semibold border border-red-800/40"
            : "bg-lumina-accent/50 text-lumina-primary font-semibold border border-lumina-accent/30"
          : "text-on-surface-variant hover:bg-lumina-surface-bright/20 hover:text-on-surface"
      )}
    >
      <span className="flex-shrink-0 w-4 h-4">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hellWeek: boolean;
  onNewSession: () => void;
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  hellWeek, 
  onNewSession, 
  sessions, 
  activeSessionId, 
  onSelectSession,
  onDeleteSession 
}: SidebarProps) {
  return (
    <nav className={cn(
      "hidden md:flex flex-col p-4 gap-1 backdrop-blur-2xl border-r shadow-2xl fixed left-0 top-0 h-screen w-[260px] z-40 transition-colors duration-500",
      hellWeek 
        ? "bg-[#140808]/90 border-red-900/30" 
        : "bg-lumina-surface/70 border-outline-variant/15"
    )}>
      {/* Brand */}
      <div className="px-3 py-5 flex items-center gap-2.5 mb-1">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center",
          hellWeek ? "bg-red-800/60" : "bg-lumina-accent/70"
        )}>
          {hellWeek 
            ? <Flame className="w-4 h-4 text-red-300" />
            : <LayoutDashboard className="w-4 h-4 text-lumina-primary" />
          }
        </div>
        <span className={cn(
          "text-lg font-bold tracking-tight",
          hellWeek ? "text-red-300" : "text-lumina-primary"
        )} style={{ fontFamily: 'Syne, sans-serif' }}>
          {hellWeek ? "HELL WEEK" : "Alumna AI"}
        </span>
      </div>

      {hellWeek && (
        <div className="mx-3 mb-3 px-3 py-2 bg-red-900/30 border border-red-800/40 rounded-xl">
          <p className="text-red-300 text-xs font-semibold">Exam week detected. Stay focused.</p>
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-col gap-0.5">
        <p className="px-3 pt-1 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50">Main</p>
        <NavItem icon={<MessageSquare className="w-4 h-4" />} label="AI Assistant" active={activeTab === 'chat'} onClick={() => onTabChange('chat')} hellWeek={hellWeek} />
        <NavItem icon={<CalendarDays className="w-4 h-4" />} label="Schedule" active={activeTab === 'schedule'} onClick={() => onTabChange('schedule')} hellWeek={hellWeek} />
        <NavItem icon={<ClipboardList className="w-4 h-4" />} label="Assignments" active={activeTab === 'assignments'} onClick={() => onTabChange('assignments')} hellWeek={hellWeek} />
        <NavItem icon={<BookOpen className="w-4 h-4" />} label="Syllabi" active={activeTab === 'syllabi'} onClick={() => onTabChange('syllabi')} hellWeek={hellWeek} />
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto mt-4 border-t border-outline-variant/10 pt-4 flex flex-col gap-0.5">
        <p className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50">Recent Sessions</p>
        {sessions.map(session => (
          <div key={session.id} className="relative group flex items-center">
            <button
              onClick={() => {
                onSelectSession(session.id);
                onTabChange('chat');
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all text-left truncate pr-8",
                activeSessionId === session.id 
                  ? hellWeek ? "bg-red-900/20 text-red-200" : "bg-lumina-surface-bright/60 text-on-surface font-medium" 
                  : "text-on-surface-variant hover:bg-lumina-surface-bright/20 hover:text-on-surface"
              )}
            >
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{session.title}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className={cn(
                "absolute right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                hellWeek ? "hover:bg-red-900/40 text-red-400" : "hover:bg-lumina-surface-bright text-on-surface-variant hover:text-red-400"
              )}
              title="Delete session"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-4 border-t border-outline-variant/10 flex flex-col gap-1">
        <button
          onClick={onNewSession}
          className={cn(
            "w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex justify-center items-center gap-2 transition-all duration-200",
            hellWeek
              ? "bg-red-800/50 text-red-200 hover:bg-red-700/50 border border-red-700/40"
              : "bg-lumina-primary text-on-primary hover:opacity-90 shadow-[0_0_15px_rgba(197,194,242,0.15)]"
          )}
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
        <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" hellWeek={hellWeek} />
      </div>
    </nav>
  );
}