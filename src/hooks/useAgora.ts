import { useState, useEffect, useCallback, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteUser,
} from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID || "";

export const useAgora = () => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);
  const [joinState, setJoinState] = useState<boolean>(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    }

    const client = clientRef.current;

    const handleUserPublished = async (user: IRemoteUser, mediaType: "video" | "audio") => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers((prevUsers) => {
          if (prevUsers.find((u) => u.uid === user.uid)) return prevUsers;
          return [...prevUsers, user];
        });
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IRemoteUser) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    };

    const handleUserLeft = (user: IRemoteUser) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, []);

 const joinCall = useCallback(async (channelName: string) => {
  if (!clientRef.current || !APP_ID) {
    console.error("Agora APP_ID is missing or not configured yet.");
    return;
  }

  // Double trigger request handling filter pattern
  if (clientRef.current.connectionState === "CONNECTING" || clientRef.current.connectionState === "CONNECTED") {
    console.warn("Agora client state is already active. Ignoring repeat request loop.");
    return;
  }

  try {
    // 💡 FORCE TOKEN NULL FOR APP_ID TESTING MODE BYPASS
    await clientRef.current.join(APP_ID, channelName, null, null);
    
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);

    await clientRef.current.publish([audioTrack, videoTrack]);
    setJoinState(true);
  } catch (error) {
    console.error("Agora platform pipeline initialization failed:", error);
  }
}, []);

  const leaveCall = useCallback(async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }

    if (clientRef.current) {
      await clientRef.current.leave();
    }

    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    setJoinState(false);
  }, [localAudioTrack, localVideoTrack]);

  return {
    localVideoTrack,
    remoteUsers,
    joinState,
    joinCall,
    leaveCall,
  };
};