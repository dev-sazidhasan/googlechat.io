import React from "react";
import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallModalProps {
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center text-white">
        {/* Avatar/Pulse Effect */}
        <div className="relative flex justify-center my-6">
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
          <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase shadow-lg">
            {callerName[0]}
          </div>
        </div>

        <h3 className="text-xl font-semibold tracking-wide">{callerName}</h3>
        <p className="text-sm text-slate-400 mt-1 animate-pulse">Incoming Video Call...</p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8 mt-8">
          {/* Reject Button */}
          <button
            onClick={onReject}
            className="p-4 bg-red-500 hover:bg-red-600 active:scale-95 transition-all rounded-full text-white shadow-lg group"
          >
            <PhoneOff className="w-6 h-6 rotate-135 group-hover:animate-shake" />
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="p-4 bg-green-500 hover:bg-green-600 active:scale-95 transition-all rounded-full text-white shadow-lg group"
          >
            <Phone className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};