import { useState, useEffect, useRef } from "react";
import { Send, PlusCircle, Smile, Paperclip, Search, Video, Info, Bell } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useApp } from "../contexts/AppContext";
import { Message, User } from "../types";

import { db } from "./../lib/firebase"; 
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function ChatView({ recipient }: { recipient: User }) {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getRoomId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  const roomId = user ? getRoomId(user.uid, recipient.uid) : recipient.uid;

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("roomId", "==", roomId),
      orderBy("timestamp", "asc")
    );

  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      setMessages(fetchedMessages);
    
      localStorage.setItem(`chat_history_${roomId}`, JSON.stringify(fetchedMessages));
    });

    
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit("join-room", roomId);

    return () => {
      unsubscribe();
      newSocket.disconnect();
    };
  }, [roomId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const messageData = {
      senderId: user.uid,
      senderName: user.displayName || "Unknown",
      text: inputText,
      timestamp: Date.now(), 
      createdAt: serverTimestamp(), 
      roomId,
    };

    try {
     
      await addDoc(collection(db, "messages"), messageData);
      
      if (socket) {
        socket.emit("send-message", { room: roomId, ...messageData });
      }
      
      setInputText("");
    } catch (error) {
      console.error("Message could not be sent:", error);
    }
  };

  return (
    <div className="flex h-full relative">
      <div className="flex-1 flex flex-col h-full bg-white">
        {}
        <header className="h-14 flex items-center justify-between px-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {recipient.photoURL ? (
                <img src={recipient.photoURL} className="w-9 h-9 rounded-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                  {recipient.displayName?.charAt(0) || recipient.email?.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">{recipient.displayName}</h2>
              <span className="text-[10px] text-secondary">Active now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-on-surface-variant cursor-pointer p-1" />
            <Video className="w-5 h-5 text-on-surface-variant cursor-pointer p-1" />
            <div className="hidden lg:block lg:w-px lg:h-4 lg:bg-outline-variant/30 lg:mx-2"></div>
            <Info className="w-5 h-5 text-on-surface-variant cursor-pointer p-1" />
          </div>
        </header>

        {}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-50 grayscale text-center">
               <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                 <Send className="w-8 h-8 text-primary" />
               </div>
               <p className="text-sm font-medium">Say hello to {recipient.displayName}!</p>
            </div>
          )}
          {messages.map((ms) => (
            <div 
              key={ms.id} 
              className={`flex flex-col ${ms.senderId === user?.uid ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  ms.senderId === user?.uid 
                  ? 'bg-primary text-on-primary rounded-tr-none' 
                  : 'bg-surface-variant text-on-surface rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{ms.text}</p>
              </div>
              <span className="text-[9px] text-outline mt-1 px-1">
                {new Date(ms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {}
        <footer className="p-4 border-t border-outline-variant/10">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
             <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
               <PlusCircle className="w-5 h-5" />
             </button>
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
               placeholder="Type a message..."
               className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm max-h-32 min-h-[40px]"
               rows={1}
             />
             <div className="flex items-center gap-1">
                <Smile className="w-5 h-5 text-on-surface-variant cursor-pointer p-1" />
                <Paperclip className="w-5 h-5 text-on-surface-variant cursor-pointer p-1" />
                <button 
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:shadow-lg transition-all active:scale-95"
                >
                  <Send className="w-5 h-5 fill-white" />
                </button>
             </div>
          </div>
        </footer>
      </div>
      
      {}
      <aside className="hidden lg:flex flex-col w-[300px] border-l border-outline-variant/10 bg-white p-6">
        <div className="flex flex-col items-center text-center">
          {recipient.photoURL ? (
            <img src={recipient.photoURL} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary/10 p-1" alt="Avatar" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-on-primary text-4xl font-bold mb-4">
              {recipient.displayName?.charAt(0) || recipient.email?.charAt(0)}
            </div>
          )}
          <h3 className="text-lg font-bold">{recipient.displayName}</h3>
          <p className="text-xs text-on-surface-variant">{recipient.email}</p>
        </div>
      </aside>
    </div>
  );
}