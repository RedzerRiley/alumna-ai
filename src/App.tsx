import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hellWeek, setHellWeek] = useState(false);

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

  return (
    <div className={cn(
      "h-screen w-full overflow-hidden flex transition-colors duration-500",
      hellWeek ? "bg-[#160808]" : "bg-lumina-bg"
    )}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hellWeek={hellWeek}
        onNewSession={() => {
          setActiveTab('chat');
        }}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col ml-0 md:ml-[260px] h-full relative">
        {/* Mobile Header */}
        <header className={cn(
          "md:hidden flex justify-between items-center px-4 h-14 w-full sticky top-0 z-30 backdrop-blur-xl border-b",
          hellWeek ? "bg-[#160808]/70 border-red-900/30" : "bg-lumina-bg/70 border-outline-variant/10"
        )}>
          <span className={cn("font-bold text-base", hellWeek ? "text-red-300" : "text-lumina-primary")} style={{ fontFamily: 'Syne, sans-serif' }}>
            Lumina AI
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-on-surface p-1.5 rounded-lg hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <ChatArea hellWeek={hellWeek} />}
          {activeTab === 'schedule' && (
            <div className="flex items-center justify-center h-full text-on-surface-variant">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-lumina-primary mb-2">Schedule View</p>
                <p className="text-sm text-on-surface-variant">Your study schedule will appear here after the AI generates it.</p>
                <p className="text-xs text-on-surface-variant/50 mt-1 font-mono">Go to AI Assistant and add an assignment to get started.</p>
              </div>
            </div>
          )}
          {activeTab === 'assignments' && (
            <div className="flex items-center justify-center h-full text-on-surface-variant">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-lumina-primary mb-2">Assignments</p>
                <p className="text-sm text-on-surface-variant">Assignments you add via AI Assistant will be tracked here.</p>
              </div>
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
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className={cn(
            "w-[75%] h-full border-r p-6",
            hellWeek ? "bg-[#160808] border-red-900/30" : "bg-lumina-bg border-outline-variant/15"
          )} onClick={e => e.stopPropagation()}>
            <Sidebar
              activeTab={activeTab}
              onTabChange={(t) => { setActiveTab(t); setMobileMenuOpen(false); }}
              hellWeek={hellWeek}
              onNewSession={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
