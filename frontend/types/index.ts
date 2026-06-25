export type ConversationType = "DIRECT" | "GROUP";
export type ParticipantRole = "ADMIN" | "MEMBER";
export type MessageType = "TEXT" | "IMAGE" | "FILE";
export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ";

export type User = {
  id: number;
  phone: string;
  username?: string | null;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  is_online: boolean;
  last_seen?: string | null;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: number;
  conversation_id: number;
  user_id: number;
  role: ParticipantRole;
  joined_at: string;
  user: User;
};

export type Reaction = {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
};

export type Receipt = {
  id: number;
  message_id: number;
  user_id: number;
  delivered_at?: string | null;
  read_at?: string | null;
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  reply_to?: number | null;
  content: string;
  attachment_url?: string | null;
  message_type: MessageType;
  status: MessageStatus;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  sender?: User | null;
  reactions: Reaction[];
  receipts: Receipt[];
  optimistic?: boolean;
};

export type Conversation = {
  id: number;
  type: ConversationType;
  name?: string | null;
  avatar_url?: string | null;
  created_by?: number | null;
  last_message_id?: number | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  last_message?: Message | null;
  unread_count: number;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type Toast = {
  id: string;
  text: string;
  tone?: "success" | "error" | "neutral";
};
