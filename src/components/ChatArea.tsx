import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowUp, LayoutDashboard, Plus, Flame, ClipboardCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import AssignmentModal, { type AssignmentInput } from './AssignmentModal';
import DashboardPanel, { type Assignment, type ScheduleBlock } from './DashboardPanel';
import { Message } from '../App';

function isExamWeek(assignments: Assignment[]): boolean {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const count = assignments.filter(a => {
    const d = new Date(a.deadline);
    return d >= now && d <= in7 && a.status !== 'done';
  }).length;
  return count >= 3;
}

function buildSystemPrompt(assignments: Assignment[], schedule: ScheduleBlock[]): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const assignmentContext = assignments.length > 0
    ? `\n\nCurrent assignments:\n${assignments.map(a => `- ${a.courseCode}: "${a.title}" due ${a.deadline} (${a.status}, ${a.priority} priority)`).join('\n')}`
    : '';
  const scheduleContext = schedule.length > 0
    ? `\n\nCurrent study schedule:\n${schedule.map(s => `- ${s.date} ${s.time}: ${s.task} (${s.course}, ${s.duration})`).join('\n')}`
    : '';
  const hellCtx = isExamWeek(assignments) ? '\n\nNOTE: It is currently exam/hell week. Acknowledge the high-stress period, keep the student focused, and prioritize ruthlessly.' : '';
  return `You are Alumna, an AI academic assistant for students. Today is ${today}.

Your core capabilities:
1. STEP-BY-STEP PLANS: When given an assignment, break it into clear, actionable steps with time estimates.
2. SCHEDULING: Suggest specific study blocks. Format schedule suggestions as JSON blocks starting with \`\`\`schedule and ending with \`\`\` like this:
\`\`\`schedule
[{"date":"YYYY-MM-DD","time":"HH:MM AM/PM","task":"Task name","course":"Course Code","duration":"Xh","rescheduled":false}]
\`\`\`
3. SYLLABUS SUMMARIES: Summarize syllabi concisely when provided.
4. RESCHEDULING: If a student says they missed a study session, automatically suggest a new time for that task.

Keep responses focused, supportive, and practical. Use markdown formatting. Do not use emoji.${assignmentContext}${scheduleContext}${hellCtx}`;
}

interface ChatAreaProps {
  hellWeek: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  schedule: ScheduleBlock[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleBlock[]>>;
  updateSessionTitle: (title: string) => void;
}

export default function ChatArea({ 
  hellWeek, 
  messages, 
  setMessages, 
  assignments, 
  setAssignments, 
  schedule, 
  setSchedule,
  updateSessionTitle
}: ChatAreaProps) {
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hellWeekActive = hellWeek || isExamWeek(assignments);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const parseScheduleFromResponse = (text: string): ScheduleBlock[] => {
    const match = text.match(/```schedule\n([\s\S]*?)```/);
    if (!match) return [];
    try {
      return JSON.parse(match[1]);
    } catch { return []; }
  };

  const sendMessage = async (msgContent: string) => {
    if (!msgContent.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgContent };
    
    // Update local context
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgContent,
          history: newMessages.slice(0, -1),
          systemPrompt: buildSystemPrompt(assignments, schedule)
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const detail = errData.detail || errData.error || `Server error ${res.status}`;
        throw new Error(detail);
      }
      const data = await res.json();
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text };
      setMessages(prev => [...prev, aiMsg]);

      // Parse and save any schedule blocks
      const newBlocks = parseScheduleFromResponse(data.text);
      if (newBlocks.length > 0) {
        setSchedule(prev => [...prev, ...newBlocks]);
        setShowDashboard(true);
      }
    } catch (error) {
      console.error(error);
      const detail = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: `**Connection error.** ${detail}\n\nMake sure your API key is correct and the server is running.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentSubmit = async (data: AssignmentInput) => {
    // 1. Rename session to match assignment title
    updateSessionTitle(data.assignmentTitle);

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      courseCode: data.courseCode || 'COURSE',
      title: data.assignmentTitle,
      deadline: data.deadline,
      status: 'pending',
      priority: 'medium',
    };
    setAssignments(prev => [...prev, newAssignment]);

    const prompt = [
      `I have a new assignment to plan:`,
      `Course: ${data.courseCode} — ${data.courseName}`,
      data.courseDesc ? `Course Description: ${data.courseDesc}` : '',
      `Assignment: ${data.assignmentTitle}`,
      data.instructions ? `Instructions: ${data.instructions}` : '',
      data.rubric ? `Rubric: ${data.rubric}` : '',
      data.dateAssigned ? `Assigned on: ${data.dateAssigned}` : '',
      `Deadline: ${data.deadline}`,
      data.syllabus ? `Syllabus:\n${data.syllabus}` : '',
      data.pdfFile ? `[Attached PDF File: ${data.pdfFile.name}]` : '',
      `\nPlease: (1) Give me a step-by-step plan to complete this assignment with time estimates, and (2) suggest a study schedule with specific dates and times as a schedule block.`,
    ].filter(Boolean).join('\n');

    await sendMessage(prompt);
    if (isExamWeek([newAssignment, ...assignments])) {
      setShowDashboard(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const cleanContent = (text: string) => text.replace(/```schedule[\s\S]*?```/g, '').trim();

  return (
    <>
      <div className={cn(
        "flex-1 flex flex-col relative overflow-hidden h-full transition-colors duration-500",
        hellWeekActive ? "bg-[#160808]" : "bg-lumina-bg"
      )}>
        {hellWeekActive && <div className="hell-week-overlay" />}

        {/* Top Bar */}
        <div className={cn(
          "relative z-10 flex items-center justify-between px-6 py-3.5 border-b backdrop-blur-md",
          hellWeekActive ? "border-red-900/30 bg-[#160808]/60" : "border-outline-variant/10 bg-lumina-bg/50"
        )}>
          <div className="flex items-center gap-2.5">
            {hellWeekActive 
              ? <Flame className="w-5 h-5 text-red-400" />
              : <Sparkles className="w-5 h-5 text-lumina-primary" />
            }
            <span className={cn("font-bold text-sm", hellWeekActive ? "text-red-300" : "text-lumina-primary")} style={{ fontFamily: 'Syne, sans-serif' }}>
              {hellWeekActive ? "Hell Week Mode — Stay focused." : "AI Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                hellWeekActive
                  ? "bg-red-900/20 border-red-800/40 text-red-300 hover:bg-red-900/30"
                  : "bg-lumina-accent/20 border-lumina-accent/30 text-lumina-primary hover:bg-lumina-accent/30"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Assignment
            </button>
            <button
              onClick={() => setShowDashboard(d => !d)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                showDashboard
                  ? hellWeekActive
                    ? "bg-red-900/30 border-red-700/40 text-red-200"
                    : "bg-lumina-accent/40 border-lumina-accent/40 text-lumina-primary"
                  : "border-outline-variant/20 text-on-surface-variant hover:bg-lumina-surface-bright/20"
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
              {(assignments.length > 0 || schedule.length > 0) && (
                <span className={cn("w-1.5 h-1.5 rounded-full ml-0.5", hellWeekActive ? "bg-red-400" : "bg-lumina-secondary")} />
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8 pb-36">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex items-start gap-3 max-w-3xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border mt-0.5",
                  msg.role === 'assistant'
                    ? hellWeekActive
                      ? "bg-red-900/50 border-red-800/40"
                      : "bg-lumina-accent/60 border-lumina-accent/30"
                    : "bg-lumina-surface-bright/50 border-outline-variant/30"
                )}>
                  {msg.role === 'assistant'
                    ? hellWeekActive
                      ? <Flame className="w-3.5 h-3.5 text-red-300" />
                      : <Sparkles className="w-3.5 h-3.5 text-lumina-primary" />
                    : <div className="w-3.5 h-3.5 rounded-full bg-lumina-secondary/60" />
                  }
                </div>

                {/* Bubble */}
                <div className={cn("flex flex-col gap-0.5", msg.role === 'user' ? "items-end" : "items-start")}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50 px-1">
                    {msg.role === 'assistant' ? 'Alumna' : 'You'}
                  </p>
                  <div className={cn(
                    "px-5 py-4 rounded-2xl border text-sm leading-relaxed",
                    msg.role === 'user'
                      ? hellWeekActive
                        ? "bg-red-900/25 border-red-900/30 text-on-surface rounded-tr-sm"
                        : "bg-lumina-accent/35 border-lumina-accent/20 text-on-surface rounded-tr-sm"
                      : hellWeekActive
                        ? "bg-[#1e0c0c]/80 border-red-900/25 text-on-surface rounded-tl-sm"
                        : "bg-lumina-surface/80 border-outline-variant/20 text-on-surface rounded-tl-sm"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="ai-prose">
                        <ReactMarkdown
                          components={{
                            h3: ({...props}) => <h3 {...props} />,
                            p: ({...props}) => <p {...props} />,
                            ul: ({...props}) => <ul {...props} />,
                            ol: ({...props}) => <ol {...props} />,
                            li: ({...props}) => <li {...props} />,
                            code: ({...props}) => <code {...props} />,
                            strong: ({...props}) => <strong {...props} />,
                            blockquote: ({...props}) => <blockquote {...props} />,
                          }}
                        >
                          {cleanContent(msg.content)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex items-center gap-2.5 ml-10 text-on-surface-variant/60">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                {hellWeekActive ? <Flame className="w-3.5 h-3.5 text-red-400" /> : <Sparkles className="w-3.5 h-3.5" />}
              </motion.div>
              <span className="text-xs font-mono italic">Thinking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-lumina-bg via-lumina-bg/90 to-transparent z-10">
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "flex items-end gap-2 backdrop-blur-xl rounded-2xl border p-2 shadow-2xl",
              hellWeekActive
                ? "bg-[#1a0808]/80 border-red-900/30"
                : "bg-lumina-surface/80 border-outline-variant/20"
            )}>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="p-2 text-on-surface-variant hover:text-lumina-primary rounded-xl hover:bg-white/5 transition-colors flex-shrink-0 mb-0.5"
                title="Add Assignment"
              >
                <ClipboardCheck className="w-4 h-4" />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 px-2 py-1.5 text-sm resize-none min-h-[36px] max-h-[160px] leading-relaxed outline-none"
                placeholder="Ask me to plan an assignment, build your schedule, or summarize your syllabus..."
                rows={1}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className={cn(
                  "p-2 rounded-xl transition-all flex-shrink-0 mb-0.5",
                  input.trim()
                    ? hellWeekActive
                      ? "bg-red-800/60 text-red-200 hover:bg-red-700/60"
                      : "bg-lumina-primary text-on-primary hover:opacity-90 glow-pulse"
                    : "bg-white/5 text-white/20"
                )}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center mt-2 text-[10px] text-on-surface-variant/30 font-mono">
              Alumna is an AI assistant. Verify important academic information.
            </p>
          </div>
        </div>
      </div>

      {/* Modals & Panels */}
      <AssignmentModal
        open={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onSubmit={handleAssignmentSubmit}
        hellWeek={hellWeekActive}
      />

      <DashboardPanel
        open={showDashboard}
        onClose={() => setShowDashboard(false)}
        assignments={assignments}
        schedule={schedule}
        hellWeek={hellWeekActive}
      />
    </>
  );
}