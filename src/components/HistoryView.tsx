import { Filter, User, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Session {
  id: string;
  user: string;
  timestamp: string;
  device: string;
  isCurrent?: boolean;
}

export default function HistoryView() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('googlechat_history');
    return saved ? JSON.parse(saved) : [
      { id: '1', user: 'Alex Rivera (Current)', timestamp: 'Active 2 minutes ago', device: 'Chrome / MacOS', isCurrent: true },
      { id: '2', user: 'Jordan Smith', timestamp: 'Logged in Oct 24, 2023', device: 'Chrome / MacOS' },
      { id: '3', user: 'S. Henderson', timestamp: 'Logged in Oct 12, 2023', device: 'Chrome / MacOS' },
      { id: '4', user: 'Guest User', timestamp: 'Logged in Sep 30, 2023', device: 'Chrome / MacOS' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('googlechat_history', JSON.stringify(sessions));
  }, [sessions]);

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const clearHistory = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <section className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Browser Session History</h3>
              <p className="text-xs text-on-surface-variant">List of users who have accessed googlechat.io on this specific machine.</p>
            </div>
            <Filter className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="divide-y divide-outline-variant/10">
            {sessions.map((session) => (
              <div key={session.id} className="px-8 py-4 flex items-center justify-between hover:bg-surface-container-low transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.isCurrent ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${session.isCurrent ? 'text-on-surface' : 'text-on-surface-variant'}`}>{session.user}</p>
                    <p className="text-[10px] text-outline font-medium">{session.timestamp} • {session.device}</p>
                  </div>
                </div>
                {session.isCurrent ? (
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-[10px] font-bold">Current Session</span>
                ) : (
                  <button 
                    onClick={() => removeSession(session.id)}
                    className="text-error opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Forget User
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-surface-container-low text-center">
             <button 
               onClick={clearHistory}
               className="text-primary text-[11px] font-bold uppercase tracking-widest hover:underline transition-all"
             >
               Clear Entire Browser History
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}
