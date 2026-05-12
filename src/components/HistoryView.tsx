import { Filter, User, Trash2, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface RecentChat {
  uid: string;
  name: string;
  photoURL?: string;
  lastMessage: string;
  lastTime: string;
  online?: boolean;
}

export default function HistoryView() {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current firebase user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);

        const savedChats = localStorage.getItem(
          `recent_chats_${user.uid}`
        );

        if (savedChats) {
          setRecentChats(JSON.parse(savedChats));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Remove single chat
  const removeChat = (uid: string) => {
    const updated = recentChats.filter((chat) => chat.uid !== uid);

    setRecentChats(updated);

    if (currentUser) {
      localStorage.setItem(
        `recent_chats_${currentUser.uid}`,
        JSON.stringify(updated)
      );
    }
  };

  // Clear all history
  const clearHistory = () => {
    setRecentChats([]);

    if (currentUser) {
      localStorage.removeItem(
        `recent_chats_${currentUser.uid}`
      );
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl">

        {/* Main Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">

          {/* Header */}
          <div className="px-8 py-6 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                Recent Chat History
              </h3>

              <p className="text-xs text-on-surface-variant">
                Users you recently chatted with on googlechat.io
              </p>
            </div>

            <Filter className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
          </div>

          {/* Chat List */}
          <div className="divide-y divide-outline-variant/10">

            {recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <div
                  key={chat.uid}
                  className="px-8 py-4 flex items-center justify-between hover:bg-surface-container-low transition-all group"
                >
                  <div className="flex items-center gap-4">

                    {/* Avatar */}
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                        chat.online
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {chat.photoURL ? (
                        <img
                          src={chat.photoURL}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}

                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          chat.online
                            ? "text-on-surface"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {chat.name}
                      </p>

                      <div className="flex items-center gap-1 mt-0.5">
                        <MessageCircle className="w-3 h-3 text-outline" />

                        <p className="text-[10px] text-outline font-medium max-w-[250px] truncate">
                          {chat.lastMessage}
                        </p>
                      </div>

                      <p className="text-[10px] text-outline font-medium mt-1">
                        {chat.lastTime}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeChat(chat.uid)}
                    className="text-error opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-sm font-bold">
                  No Recent Chats
                </h3>

                <p className="text-xs text-on-surface-variant mt-1">
                  Your recent conversations will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recentChats.length > 0 && (
            <div className="p-6 bg-surface-container-low text-center">
              <button
                onClick={clearHistory}
                className="text-primary text-[11px] font-bold uppercase tracking-widest hover:underline transition-all"
              >
                Clear Entire Chat History
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}