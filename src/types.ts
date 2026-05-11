export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  updatedAt: number;
}

export interface Settings {
  saveHistoryLocally: boolean;
  theme: 'light' | 'dark';
}
