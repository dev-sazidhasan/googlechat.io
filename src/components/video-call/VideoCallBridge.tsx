import React, { useState, useEffect, useCallback } from 'react';
import { useAgora } from '../../hooks/useAgora';
import { CallContainer } from './CallContainer';
import { Phone, PhoneOff } from 'lucide-react';
import { db } from '../../lib/firebase'; // 💡 আপনার প্রজেক্টের সঠিক ফায়ারবেস কনফিগ পাথটি নিশ্চিত করুন
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface VideoCallBridgeProps {
  roomId: string;
  // বর্তমান ইউজারের আইডি ও নাম (চ্যাট ভিউ অথবা অথ কনটেক্সট থেকে পাস করবেন)
  currentUserId?: string; 
  currentUserName?: string;
}

export const VideoCallBridge: React.FC<VideoCallBridgeProps> = ({ 
  roomId, 
  currentUserId = "User_" + Math.floor(Math.random() * 1000), // ব্যাকআপ আইডি যদি পাস না করা হয়
  currentUserName = "Anonymous"
}) => {
  const { localVideoTrack, remoteUsers, joinState, joinCall, leaveCall } = useAgora();
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [callerName, setCallerName] = useState<string>("Someone");

  // 🧹 কল কেটে দেওয়া বা ক্লিনআপ করার লজিক
  const handleCleanup = useCallback(async () => {
    leaveCall();
    setActiveChannel(null);
    setIncomingCall(false);
    
    // ফায়ারবেস থেকে কল সেশন ডকুমেন্ট মুছে ফেলা
    try {
      await deleteDoc(doc(db, "calls", roomId));
    } catch (error) {
      console.log("Firebase document already deleted or empty.");
    }
  }, [leaveCall, roomId]);

  useEffect(() => {
    // 📡 ১. কলার যখন চ্যাট থেকে কল বাটনে চাপ দেবে (গ্লোবাল ইভেন্ট লিসেনার)
    const handleOutgoingCallTrigger = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { channelName } = customEvent.detail;
      setActiveChannel(channelName);
      
      console.log("Initiating Firebase call session for room:", roomId);

      // ফায়ারবেসে কলের তথ্য পুশ করা (রিসিভার যাতে পপআপ দেখতে পায়)
      await setDoc(doc(db, "calls", roomId), {
        channelName,
        callerId: currentUserId,
        callerName: currentUserName,
        status: "ringing",
        createdAt: new Date(),
      });
      
      // কলার নিজে আগে Agora ইঞ্জিনের চ্যানেলে জয়েন করে বসে থাকবে
      joinCall(channelName);
    };

    window.addEventListener('EXECUTE_VIDEO_CALL_BACKEND', handleOutgoingCallTrigger);

    // 📡 ২. ফায়ারবেস রিয়েল-টাইম লিসেনার (ইনকামিং কল এবং কল স্ট্যাটাস ট্র্যাক করার জন্য)
    const unsubscribeFirebase = onSnapshot(doc(db, "calls", roomId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // যদি অন্য কেউ কল দেয় এবং স্ট্যাটাস "ringing" হয়
        if (data.status === "ringing" && data.callerId !== currentUserId) {
          setActiveChannel(data.channelName);
          setCallerName(data.callerName);
          setIncomingCall(true);
        }
        
        // কলারের জন্য: রিসিভার যখন কল রিসিভ করবে (status: accepted), তখন ট্র্যাক করবে
        if (data.status === "accepted" && data.callerId === currentUserId) {
          console.log("Opponent accepted the call stream!");
        }
      } else {
        // অপর প্রান্তের ইউজার যদি কল কেটে দেয় (ডকুমেন্ট ডিলিট করে), তবে কল অটোমেটিক বন্ধ হবে
        if (joinState || incomingCall) {
          leaveCall();
          setActiveChannel(null);
          setIncomingCall(false);
        }
      }
    });

    return () => {
      window.removeEventListener('EXECUTE_VIDEO_CALL_BACKEND', handleOutgoingCallTrigger);
      unsubscribeFirebase();
    };
  }, [roomId, currentUserId, currentUserName, joinCall, joinState, incomingCall, leaveCall]);

  // 👍 রিসিভার যখন সবুজ কল বাটনে চাপ দিয়ে কল রিসিভ করবে
  const handleAcceptCall = async () => {
    if (activeChannel) {
      // ফায়ারবেসে স্ট্যাটাস আপডেট করে কলারকে জানানো যে আমি কল ধরেছি
      await updateDoc(doc(db, "calls", roomId), {
        status: "accepted"
      });
      
      // Agora চ্যানেলে জয়েন করা
      joinCall(activeChannel);
      setIncomingCall(false);
    }
  };

  // 👎 কল রিজেক্ট করা বা রানিং কল শেষ করা
  const handleEndCall = async () => {
    await handleCleanup();
  };

  return (
    <>
      {/* 🔔 Incoming Call Alert Popup UI Portal Modal overlay */}
      {incomingCall && !joinState && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl text-white">
            
            {/* Pulsing Avatar Animation Effect */}
            <div className="relative flex justify-center my-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase shadow-lg">
                {callerName[0]}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1">{callerName} is calling</h3>
            <p className="text-sm text-neutral-400 mb-6 animate-pulse">Incoming video call session...</p>
            
            <div className="flex justify-center gap-6">
              {/* Accept Button */}
              <button 
                onClick={handleAcceptCall} 
                className="p-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
              >
                <Phone className="w-6 h-6 fill-white" />
              </button>
              
              {/* Reject Button */}
              <button 
                onClick={handleEndCall} 
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📹 Active Call Grid display layers */}
      {joinState && (
        <CallContainer 
          localVideoTrack={localVideoTrack} 
          remoteUsers={remoteUsers} 
          onLeave={handleEndCall} 
        />
      )}
    </>
  );
};