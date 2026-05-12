import { useState, useEffect } from "react";
import { MessageCircle, Users, Video, History, Settings, HelpCircle, LogOut, Search, Plus, Bell, Shield, Filter, Camera, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../contexts/AppContext";
import ChatView from "./ChatView";
import SettingsView from "./SettingsView";
import HistoryView from "./HistoryView";
import { logOut, db } from "../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { User } from "../types";

type View = 'chat' | 'spaces' | 'meet' | 'history' | 'settings';

export default function Dashboard() {
  const { user, settings } = useApp();
  const [activeView, setActiveView] = useState<View>('chat');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"), where("uid", "!=", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => doc.data() as User);
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'spaces', icon: Users, label: 'Spaces' },
    { id: 'meet', icon: Video, label: 'Meet' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <div className="flex h-screen bg-surface overflow-hidden text-on-surface">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[300px] h-full p-4 gap-2 bg-surface-container-low border-r border-outline-variant/30">
        <div className="px-4 py-6">
          <h1 className="font-display text-2xl font-bold text-primary">Google Chat</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Productivity Suite</p>
        </div>

        <div className="px-4 mb-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/20"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          <div className="px-4 text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-2">Direct Messages</div>
          {filteredUsers.map((u) => (
            <button
              key={u.uid}
              onClick={() => {
                setSelectedUser(u);
                setActiveView('chat');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                selectedUser?.uid === u.uid && activeView === 'chat'
                ? 'bg-secondary-container text-on-secondary-container font-bold' 
                : 'hover:bg-surface-container-high'
              }`}
            >
              <div className="relative">
                {u.photoURL ? (
                  <img src={u.photoURL} alt={u.displayName || ""} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-xs font-bold">
                    {u.displayName?.charAt(0) || u.email?.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></div>
              </div>
              <div className="cursor-pointer flex-1 text-left">
                <p className="text-sm truncate">{u.displayName}</p>
                <p className="text-[10px] text-outline truncate">{u.email}</p>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <p className="px-4 text-xs text-outline py-4 italic">
              {searchTerm ? "No users matching search." : "No other users found."}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as View);
                if (item.id !== 'chat') setSelectedUser(null);
              }}
              className={`cursor-pointer flex items-center gap-4 px-4 py-2 rounded-full transition-all ${
                activeView === item.id && !selectedUser
                ? 'bg-secondary-container text-on-secondary-container font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveView('settings')}
            className={`cursor-pointer flex items-center gap-4 px-4 py-2 rounded-full transition-all ${
              activeView === 'settings' 
              ? 'bg-secondary-container text-on-secondary-container font-bold' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-4 px-4 py-2 text-error hover:bg-error-container/20 transition-all rounded-full mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-14 flex items-center justify-between px-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <span className="md:hidden text-on-surface"><Users className="w-6 h-6" /></span>
            <span className="font-display text-lg font-bold text-on-surface capitalize">
              {selectedUser ? `Chat with ${selectedUser.displayName}` : activeView}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedUser?.uid || activeView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              {activeView === 'chat' && (
                selectedUser ? (
                  <ChatView recipient={selectedUser} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-primary opacity-40" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Select a user to chat</h3>
                      <p className="text-sm text-on-surface-variant max-w-xs">Connecting with your team is just a click away. Select a member from the sidebar to start a conversation.</p>
                    </div>
                  </div>
                )
              )}
              {activeView === 'settings' && <SettingsView />}
              {activeView === 'history' && <HistoryView />}
              {activeView === 'spaces' && <div className="h-full flex items-center justify-center text-on-surface-variant">Spaces view coming soon</div>}
              {activeView === 'meet' && <div className="h-full flex items-center justify-center text-on-surface-variant">Meet view coming soon</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-white shadow-lg border-t border-outline-variant z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id as View);
              setSelectedUser(null);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl h-14 w-16 transition-all ${
              activeView === item.id && !selectedUser ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </button>
        ))}
         <button
            onClick={() => setActiveView('settings')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl h-14 w-16 transition-all ${
              activeView === 'settings' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Settings</span>
          </button>
      </nav>
    </div>
  );
}
