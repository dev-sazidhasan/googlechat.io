import { useEffect, useState } from "react";
import { db } from "@/firebase"; // আপনার ফায়ারবেস কনফিগ পাথ
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface CallSession {
  callerId: string;
  callerName: string;
  channelName: string;
  status: "ringing" | "accepted" | "rejected";
}

export const useCallSignaling = (currentUserId: string, currentUserName: string) => {
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);

  // ১. ইনকামিং কল লিসেন করা (রিসিভারের জন্য)
  useEffect(() => {
    if (!currentUserId) return;

    // নিজের ইউজার আইডির ডকুমেন্ট ট্র্যাক করা
    const unsubscribe = onSnapshot(doc(db, "calls", currentUserId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CallSession;
        
        if (data.status === "ringing") {
          setIncomingCall(data);
        } else if (data.status === "accepted") {
          setActiveCall(data);
          setIncomingCall(null);
        }
      } else {
        // ডকুমেন্ট ডিলিট হয়ে গেলে সব স্টেট রিসেট (কল কেটে দিলে)
        setIncomingCall(null);
        setActiveCall(null);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // ২. কল দেওয়া (কলারের জন্য)
  const startCall = async (receiverId: string, channelName: string) => {
    const sessionData: CallSession = {
      callerId: currentUserId,
      callerName: currentUserName,
      channelName,
      status: "ringing",
    };

    // রিসিভারের আইডিতে কল সেশন তৈরি করা
    await setDoc(doc(db, "calls", receiverId), sessionData);
    setActiveCall(sessionData);

    // কলার নিজেও ট্র্যাক করবে যে রিসিভার কল ধরলো কি না
    const checkStatusUnsubscribe = onSnapshot(doc(db, "calls", receiverId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CallSession;
        if (data.status === "accepted") {
          setActiveCall(data);
          checkStatusUnsubscribe();
        }
      }
    });
  };

  // ৩. কল রিসিভ করা (রিসিভারের জন্য)
  const acceptCall = async () => {
    if (!currentUserId) return;
    await updateDoc(doc(db, "calls", currentUserId), {
      status: "accepted",
    });
  };

  // ৪. কল রিজেক্ট বা কেটে দেওয়া
  const endCall = async (receiverId: string) => {
    // রিসিভার বা কলার যে কেউ কাটলে ডকুমেন্ট ডিলিট হবে
    const targetId = receiverId || currentUserId;
    await deleteDoc(doc(db, "calls", targetId));
    setIncomingCall(null);
    setActiveCall(null);
  };

  return { incomingCall, activeCall, startCall, acceptCall, endCall };
};