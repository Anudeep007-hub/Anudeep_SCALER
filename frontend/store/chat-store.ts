"use client";

import { create } from "zustand";
import { api, socketUrl } from "@/lib/api";
import type { Conversation, Message, Toast, User } from "@/types";

const OTP = "123456";
const TOKEN_KEY = "signal_token";
const USER_KEY = "signal_user";

type ChatState = {
  user: User | null;
  token: string | null;
  conversations: Conversation[];
  messages: Record<number, Message[]>;
  activeConversationId: number | null;
  query: string;
  loading: boolean;
  sending: boolean;
  toasts: Toast[];
  typingUser: string | null;
  socket: WebSocket | null;
  boot: () => Promise<void>;
  signIn: (payload: { phone: string; displayName: string }) => Promise<void>;
  signOut: () => void;
  setQuery: (query: string) => void;
  selectConversation: (conversationId: number) => Promise<void>;
  sendMessage: (content: string, replyTo?: number | null) => Promise<void>;
  react: (messageId: number, emoji: string) => Promise<void>;
  pushToast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
};

function auth(state: ChatState) {
  return { token: state.token, userId: state.user?.id };
}

function sortConversations(conversations: Conversation[]) {
  return [...conversations].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

function otherParticipant(conversation: Conversation, userId?: number) {
  return conversation.participants.find((participant) => participant.user_id !== userId)?.user;
}

export const useChatStore = create<ChatState>((set, get) => ({
  user: null,
  token: null,
  conversations: [],
  messages: {},
  activeConversationId: null,
  query: "",
  loading: true,
  sending: false,
  toasts: [],
  typingUser: null,
  socket: null,

  async boot() {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const stored = window.localStorage.getItem(USER_KEY);
    if (!token || !stored) {
      set({ loading: false });
      return;
    }
    try {
      const user = await api.me({ token });
      set({ token, user });
      await get().selectConversation(0);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, loading: false });
    }
  },

  async signIn({ phone, displayName }) {
    set({ loading: true });
    try {
      const username = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || undefined;
      const result = await api.register({
        phone,
        display_name: displayName,
        username,
        otp: OTP,
      });
      window.localStorage.setItem(TOKEN_KEY, result.access_token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      set({ token: result.access_token, user: result.user });
      await get().selectConversation(0);
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Unable to sign in", "error");
      set({ loading: false });
    }
  },

  signOut() {
    get().socket?.close();
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    set({
      user: null,
      token: null,
      conversations: [],
      messages: {},
      activeConversationId: null,
      socket: null,
    });
  },

  setQuery(query) {
    set({ query });
  },

  async selectConversation(conversationId) {
    const state = get();
    set({ loading: true });
    try {
      const conversations = sortConversations(await api.conversations(auth(state), state.query));
      const nextId = conversationId || conversations[0]?.id || null;
      const messages = nextId ? await api.messages(auth(state), nextId) : [];
      if (nextId) {
        await api.markRead(auth(state), nextId).catch(() => undefined);
      }

      state.socket?.close();
      const socket = nextId ? new WebSocket(socketUrl(nextId)) : null;
      if (socket && nextId) {
        const socketConversationId = nextId;
        socket.onmessage = async (event) => {
          const packet = JSON.parse(event.data);
          if (packet.type === "typing") {
            const active = get().conversations.find((item) => item.id === socketConversationId);
            const name = active ? otherParticipant(active, get().user?.id)?.display_name || "Someone" : "Someone";
            set({ typingUser: packet.payload.state === "stopped" ? null : name });
            return;
          }
          const latest = await api.messages(auth(get()), socketConversationId);
          const freshConversations = sortConversations(await api.conversations(auth(get()), get().query));
          set((current) => ({
            messages: { ...current.messages, [socketConversationId]: latest },
            conversations: freshConversations,
          }));
        };
      }

      set((current) => ({
        conversations,
        activeConversationId: nextId,
        messages: nextId ? { ...current.messages, [nextId]: messages } : current.messages,
        socket,
        loading: false,
      }));
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Unable to load conversations", "error");
      set({ loading: false });
    }
  },

  async sendMessage(content, replyTo) {
    const state = get();
    const conversationId = state.activeConversationId;
    if (!conversationId || !state.user || !content.trim()) return;

    const now = new Date().toISOString();
    const tempId = Date.now() * -1;
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: state.user.id,
      reply_to: replyTo ?? null,
      content: content.trim(),
      message_type: "TEXT",
      status: "SENDING",
      created_at: now,
      updated_at: now,
      sender: state.user,
      receipts: [],
      reactions: [],
      optimistic: true,
    };

    set((current) => ({
      sending: true,
      messages: {
        ...current.messages,
        [conversationId]: [...(current.messages[conversationId] || []), optimistic],
      },
    }));

    try {
      const saved = await api.sendMessage(auth(get()), conversationId, { content, reply_to: replyTo });
      const conversations = sortConversations(await api.conversations(auth(get()), get().query));
      set((current) => ({
        sending: false,
        conversations,
        messages: {
          ...current.messages,
          [conversationId]: (current.messages[conversationId] || []).map((message) => (message.id === tempId ? saved : message)),
        },
      }));
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Message failed", "error");
      set((current) => ({
        sending: false,
        messages: {
          ...current.messages,
          [conversationId]: (current.messages[conversationId] || []).map((message) =>
            message.id === tempId ? { ...message, status: "SENT", optimistic: false } : message,
          ),
        },
      }));
    }
  },

  async react(messageId, emoji) {
    try {
      await api.react(auth(get()), messageId, emoji);
      const conversationId = get().activeConversationId;
      if (conversationId) {
        const messages = await api.messages(auth(get()), conversationId);
        set((current) => ({ messages: { ...current.messages, [conversationId]: messages } }));
      }
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Reaction failed", "error");
    }
  },

  pushToast(text, tone = "neutral") {
    const id = crypto.randomUUID();
    set((current) => ({ toasts: [...current.toasts, { id, text, tone }] }));
    window.setTimeout(() => get().dismissToast(id), 2600);
  },

  dismissToast(id) {
    set((current) => ({ toasts: current.toasts.filter((toast) => toast.id !== id) }));
  },
}));
