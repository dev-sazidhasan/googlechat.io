import React, { useEffect, useRef } from 'react';
import { PhoneOff } from 'lucide-react';

interface CallContainerProps {
  localVideoTrack: any;
  remoteUsers: any[];
  onLeave: () => void;
}

export const CallContainer: React.FC<CallContainerProps> = ({
  localVideoTrack,
  remoteUsers,
  onLeave,
}) => {
  const localVideoRef = useRef<HTMLDivElement>(null);

  // ১. নিজের (Local) ভিডিও প্লে করার লজিক
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
    return () => {
      if (localVideoTrack) localVideoTrack.stop();
    };
  }, [localVideoTrack]);

  // ২. অন্য ইউজারের (Remote) ভিডিও প্লে করার লজিক (রিয়েল-টাইম ডম ট্র্যাকিং সহ)
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        // ডায়নামিক আইডি জেনারেট করে এলিমেন্ট খুঁজে বের করা
        const remoteVideoElement = document.getElementById(`remote-user-${user.uid}`);
        if (remoteVideoElement) {
          user.videoTrack.play(remoteVideoElement);
        }
      }
      if (user.audioTrack) {
        user.audioTrack.play(); // অডিও প্লে করা
      }
    });
  }, [remoteUsers]);

  return (
    <div className="w-full max-w-5xl h-full flex flex-col items-center bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800">
      
      {/* 📹 ভিডিও গ্রিড লেআউট */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden">
        
        {/* Local Camera (নিজের স্ক্রিন) */}
        <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-inner group">
          <div ref={localVideoRef} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-neutral-300">
            You (Local Camera)
          </div>
        </div>

        {/* Remote Camera (অন্য প্রান্তের ইউজারের স্ক্রিন) */}
        <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          {remoteUsers.length === 0 ? (
            <div className="text-center animate-pulse">
              <p className="text-neutral-400 text-sm">Connecting peer stream...</p>
              <span className="text-xs text-neutral-600">Waiting for remote hardware handshake</span>
            </div>
          ) : (
            // প্রতিটা রিমোট ইউজারের জন্য আলাদা আইডি সহ ডম এলিমেন্ট
            remoteUsers.map((user) => (
              <div
                key={user.uid}
                id={`remote-user-${user.uid}`}
                className="w-full h-full object-cover"
              />
            ))
          )}
          
          {remoteUsers.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-neutral-300">
              Remote Peer ({remoteUsers[0]?.uid})
            </div>
          )}
        </div>

      </div>

      {/* 🛑 কল কাটার কন্ট্রোল বাটন */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onLeave}
          className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-red-500/20 flex items-center justify-center group"
        >
          <PhoneOff className="w-6 h-6 group-hover:rotate-135 transition-transform duration-200" />
        </button>
      </div>

    </div>
  );
};