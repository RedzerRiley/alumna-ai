import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { cn } from './lib/utils';
import { Assignment, ScheduleBlock } from './components/DashboardPanel';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
}

const defaultMessage: Message = {
  id: '0',
  role: 'assistant',
  content: "Hello. I'm Alumna, your academic AI assistant.\n\nI can help you:\n- **Plan assignments** step by step\n- **Build and manage your study schedule**\n- **Summarize your syllabus**\n- **Reschedule missed sessions automatically**\n\nStart by adding an assignment using the **+** button, or just tell me what you're working on."
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hellWeek, setHellWeek] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Lifted Application State
  const [sessions, setSessions] = useState<Session[]>([{ id: 'default', title: 'New Session', messages: [defaultMessage] }]);
  const [activeSessionId, setActiveSessionId] = useState('default');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Future: Fetch user's saved sessions, assignments, and schedule from Firestore here
      }
    });
    return () => unsubscribe();
  }, []);

  // For demo: press H to toggle hell week
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'H' && e.shiftKey) setHellWeek(h => !h);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (hellWeek) {
      document.body.classList.add('hell-week');
    } else {
      document.body.classList.remove('hell-week');
    }
  }, [hellWeek]);

  const handleNewSession = () => {
    const newId = Date.now().toString();
    setSessions(prev => [{ id: newId, title: 'New Session', messages: [defaultMessage] }, ...prev]);
    setActiveSessionId(newId);
    setActiveTab('chat');
  };

  const handleDeleteSession = (idToDelete: string) => {
    setSessions(prev => {
      const updatedSessions = prev.filter(s => s.id !== idToDelete);
      
      // If we deleted the last session, create a fresh one automatically
      if (updatedSessions.length === 0) {
        const newId = Date.now().toString();
        setActiveSessionId(newId);
        return [{ id: newId, title: 'New Session', messages: [defaultMessage] }];
      }
      
      // If we deleted the currently active session, switch to the top one
      if (activeSessionId === idToDelete) {
        setActiveSessionId(updatedSessions[0].id);
      }
      
      return updatedSessions;
    });
  };

  const activeMessages = sessions.find(s => s.id === activeSessionId)?.messages || [];

  return (
    <div className={cn("h-screen w-full overflow-hidden flex transition-colors duration-500", hellWeek ? "bg-[#160808]" : "bg-lumina-bg")}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hellWeek={hellWeek}
        onNewSession={handleNewSession}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 flex flex-col ml-0 md:ml-[260px] h-full relative">
        <header className={cn(
          "flex justify-between items-center px-4 h-14 w-full sticky top-0 z-30 backdrop-blur-xl border-b",
          hellWeek ? "bg-[#160808]/70 border-red-900/30" : "bg-lumina-bg/70 border-outline-variant/10"
        )}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface p-1.5 rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className={cn("font-bold text-base md:hidden", hellWeek ? "text-red-300" : "text-lumina-primary")} style={{ fontFamily: 'Syne, sans-serif' }}>
              Alumna AI
            </span>
          </div>
          
          <div className="flex gap-2 ml-auto">
            {user ? (
               <button onClick={logout} className="p-2 rounded-lg hover:bg-white/5 text-on-surface-variant flex items-center gap-2 text-sm">
                 <LogOut className="w-4 h-4"/> <span className="hidden sm:inline">Logout</span>
               </button>
            ) : (
               <button onClick={loginWithGoogle} className="p-2 rounded-lg hover:bg-white/5 text-lumina-primary flex items-center gap-2 text-sm font-medium">
                 <LogIn className="w-4 h-4"/> Login
               </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatArea 
              hellWeek={hellWeek} 
              messages={activeMessages}
              setMessages={(newMessages) => {
                setSessions(prev => prev.map(s => s.id === activeSessionId ? { 
                  ...s, 
                  messages: typeof newMessages === 'function' ? newMessages(s.messages) : newMessages 
                } : s));
              }}
              assignments={assignments}
              setAssignments={setAssignments}
              schedule={schedule}
              setSchedule={setSchedule}
              updateSessionTitle={(title) => {
                setSessions(prev => prev.map(s => s.id === activeSessionId && s.title === 'New Session' ? { ...s, title } : s));
              }}
            />
          )}
          {activeTab === 'schedule' && (
             <div className="h-full overflow-y-auto p-8">
               <h2 className={cn("text-2xl font-bold mb-6 font-display", hellWeek ? "text-red-300" : "text-lumina-primary")}>Your Schedule</h2>
               {schedule.length === 0 ? (
                 <p className="text-on-surface-variant">No study blocks scheduled yet. Ask the AI to plan an assignment.</p>
               ) : (
                 <div className="grid gap-4 max-w-3xl">
                   {schedule.map((block, i) => (
                     <div key={i} className={cn("p-4 border rounded-xl flex justify-between items-center", hellWeek ? "bg-red-900/10 border-red-900/20" : "bg-lumina-surface border-outline-variant/20")}>
                       <div>
                         <p className="font-bold text-on-surface">{block.task}</p>
                         <p className="text-sm text-on-surface-variant">{block.course} • {block.duration}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-mono text-sm font-semibold">{block.date}</p>
                         <p className="text-xs text-on-surface-variant">{block.time}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}
          {activeTab === 'assignments' && (
            <div className="h-full overflow-y-auto p-8">
              <h2 className={cn("text-2xl font-bold mb-6 font-display", hellWeek ? "text-red-300" : "text-lumina-primary")}>Active Assignments</h2>
              {assignments.length === 0 ? (
                <p className="text-on-surface-variant">No assignments added yet.</p>
              ) : (
                <div className="grid gap-4 max-w-3xl">
                  {assignments.map(a => (
                    <div key={a.id} className={cn("p-4 border rounded-xl flex justify-between items-start", hellWeek ? "bg-red-900/10 border-red-900/20" : "bg-lumina-surface border-outline-variant/20")}>
                      <div>
                        <p className="font-bold text-on-surface">{a.title}</p>
                        <p className="text-sm text-on-surface-variant">{a.courseCode}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className="text-xs font-mono border px-2 py-1 rounded-full text-on-surface-variant">{a.status}</span>
                         <p className="text-xs text-on-surface-variant">Due: {a.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'syllabi' && (
            <div className="flex items-center justify-center h-full text-on-surface-variant">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-lumina-primary mb-2">Syllabi</p>
                <p className="text-sm text-on-surface-variant">Paste syllabi into the AI Assistant for summaries and planning.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className={cn("w-[75%] h-full border-r p-6", hellWeek ? "bg-[#160808] border-red-900/30" : "bg-lumina-bg border-outline-variant/15")} onClick={e => e.stopPropagation()}>
            <Sidebar
              activeTab={activeTab}
              onTabChange={(t) => { setActiveTab(t); setMobileMenuOpen(false); }}
              hellWeek={hellWeek}
              onNewSession={() => { handleNewSession(); setMobileMenuOpen(false); }}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => { setActiveSessionId(id); setMobileMenuOpen(false); }}
              onDeleteSession={handleDeleteSession}
            />
          </div>
        </div>
      )}
    </div>
  );
}