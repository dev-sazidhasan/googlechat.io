import { useState, useEffect, useRef } from "react";
import {
  Send,
  PlusCircle,
  Smile,
  Paperclip,
  Search,
  Video,
  Info,
} from "lucide-react";

import { io, Socket } from "socket.io-client";
import { useApp } from "../contexts/AppContext";
import { Message, User } from "../types";
import { VideoCallBridge } from '../components/video-call/VideoCallBridge';

import { db } from "./../lib/firebase";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatView({
  recipient,
}: {
  recipient: User;
}) {
  const { user } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ROOM ID GENERATION
  const getRoomId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  const roomId = user
    ? getRoomId(user.uid, recipient.uid)
    : recipient.uid;

  // =======================================================================
  // ⚡ VIDEO CALL CORE ENGINE TRIGGER PIPELINE (CONNECTED DIRECT TO BRIDGE)
  // =======================================================================
  const executeCallPipeline = () => {
    if (!roomId) return;
    const channelName = `call_${roomId}`;
    
    // Broadcast dispatch to alert active listeners dynamically across file systems
    const event = new CustomEvent('EXECUTE_VIDEO_CALL_BACKEND', {
      detail: { channelName }
    });
    window.dispatchEvent(event);
  };

  // =========================
  // LOAD FIREBASE MESSAGES & SOCKET PIPELINE
  // =========================
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

      localStorage.setItem(
        `chat_history_${roomId}`,
        JSON.stringify(fetchedMessages)
      );
    });

    // SOCKET INITIALIZATION CONFIGURATION (Using proxy node pipeline reference)
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit("join-room", roomId);

    return () => {
      unsubscribe();
      newSocket.disconnect();
    };
  }, [roomId, user]);

  // AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // SEND MESSAGE
  // =========================
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
      // SAVE RECENT CHAT HISTORY
      const recentChats = JSON.parse(
        localStorage.getItem(`recent_chats_${user.uid}`) || "[]"
      );

      const updatedRecentChats = [
        {
          uid: recipient.uid,
          name: recipient.displayName || "Unknown User",
          photoURL: recipient.photoURL || "",
          lastMessage: inputText,
          lastTime: new Date().toLocaleString(),
          online: true,
        },
        ...recentChats.filter((chat: any) => chat.uid !== recipient.uid),
      ];

      localStorage.setItem(
        `recent_chats_${user.uid}`,
        JSON.stringify(updatedRecentChats)
      );

      // SAVE FIREBASE MESSAGE
      await addDoc(collection(db, "messages"), messageData);

      // SOCKET MESSAGE EMIT
      if (socket) {
        socket.emit("send-message", {
          room: roomId,
          ...messageData,
        });
      }

      setInputText("");
    } catch (error) {
      console.error("Message could not be sent:", error);
    }
  };

  return (
    <div className="flex h-full relative bg-white">

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-white">

        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              {recipient.photoURL ? (
                <img
                  src={recipient.photoURL}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
                  {recipient.displayName?.charAt(0) || recipient.email?.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-white"></div>
            </div>

            <div>
              <h2 className="text-sm font-bold leading-tight text-on-surface">
                {recipient.displayName}
              </h2>
              <span className="text-[10px] text-secondary font-medium">
                Active now
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-surface-container transition">
              <Search className="w-5 h-5 text-on-surface-variant" />
            </button>

            {/* 🔥 APNAR EXACT BUTTON - DESIGN REMAINS 100% UNTOUCHED WITH ACTION PIPELINE INTEGRATION */}
            <button 
              onClick={executeCallPipeline}
              className="p-2 rounded-full hover:bg-surface-container transition"
            >
              <Video className="w-5 h-5 text-on-surface-variant" />
            </button>

            <div className="hidden lg:block w-px h-4 bg-outline-variant/30 mx-1"></div>

            <button className="p-2 rounded-full hover:bg-surface-container transition">
              <Info className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#f8fafc]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-60 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 shadow-sm">
                <Send className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-semibold text-on-surface">
                Say hello to {recipient.displayName}!
              </p>
            </div>
          )}

          {messages.map((ms) => (
            <div
              key={ms.id}
              className={`flex ${
                ms.senderId === user?.uid ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col max-w-[80%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                    ms.senderId === user?.uid
                      ? "bg-primary text-on-primary rounded-br-md"
                      : "bg-white border border-outline-variant/20 text-on-surface rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {ms.text}
                  </p>
                </div>

                <span
                  className={`text-[10px] mt-1 px-1 text-outline ${
                    ms.senderId === user?.uid ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(ms.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          <div ref={scrollRef} />
        </div>

        {/* FOOTER */}
        <footer className="p-4 border-t border-outline-variant/10 bg-white">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-surface-container-low border border-outline-variant/20 rounded-3xl px-3 py-2 shadow-sm">
            <button className="p-2 rounded-full hover:bg-surface-container-high transition">
              <PlusCircle className="w-5 h-5 text-on-surface-variant" />
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSend())
              }
              placeholder="Type a message..."
              rows={1}
              className="
                flex-1
                resize-none
                rounded-2xl
                border border-gray-200
                bg-white
                px-4 py-3
                text-sm text-gray-800
                placeholder:text-gray-400
                outline-none
                transition-all
                duration-200
                focus:border-primary
                focus:ring-4
                focus:ring-primary/10
                max-h-32
                min-h-[48px]
              "
            />

            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-surface-container-high transition">
                <Smile className="w-5 h-5 text-on-surface-variant" />
              </button>

              <button className="p-2 rounded-full hover:bg-surface-container-high transition">
                <Paperclip className="w-5 h-5 text-on-surface-variant" />
              </button>

              <button
                onClick={handleSend}
                className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:shadow-lg transition-all active:scale-95"
              >
                <Send className="w-5 h-5 fill-white" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[300px] border-l border-outline-variant/10 bg-white p-6">
        <div className="flex flex-col items-center text-center">
          {recipient.photoURL ? (
            <img
              src={recipient.photoURL}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary/10 p-1"
              alt="Avatar"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-on-primary text-4xl font-bold mb-4">
              {recipient.displayName?.charAt(0) || recipient.email?.charAt(0)}
            </div>
          )}

          <h3 className="text-lg font-bold text-on-surface">
            {recipient.displayName}
          </h3>

          <p className="text-xs text-on-surface-variant mt-1">
            {recipient.email}
          </p>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 🚀 THE BACKGROUND INTERPRETER BRIDGE CORE CONTROLLER */}
      {/* ======================================================== */}
      <VideoCallBridge roomId={roomId} socket={socket} />
    </div>
  );
}