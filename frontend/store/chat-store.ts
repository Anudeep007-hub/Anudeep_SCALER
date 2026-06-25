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
  replyToMessage: Message | null;
  socket: WebSocket | null;
  boot: () => Promise<void>;
  signIn: (payload: { phone: string; displayName: string }) => Promise<void>;
  signOut: () => void;
  setQuery: (query: string) => void;
  selectConversation: (conversationId: number) => Promise<void>;
  sendMessage: (content: string, options?: { attachment_url?: string; message_type?: string; expires_in_seconds?: number }) => Promise<void>;
  react: (messageId: number, emoji: string) => Promise<void>;
  uploadAttachment: (file: File) => Promise<{ url: string; contentType: string } | null>;
  createDirectChat: (userId: number) => Promise<void>;
  createGroup: (name: string, memberIds: number[]) => Promise<void>;
  renameGroup: (conversationId: number, name: string) => Promise<void>;
  addGroupMember: (conversationId: number, userId: number) => Promise<void>;
  removeGroupMember: (conversationId: number, userId: number) => Promise<void>;
  searchUsers: (q: string) => Promise<User[]>;
  setReplyToMessage: (message: Message | null) => void;
  sendTyping: (state: "started" | "stopped") => void;
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
  replyToMessage: null,
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
      replyToMessage: null,
      socket: null,
    });
  },

  setQuery(query) {
    set({ query });
  },

  setReplyToMessage(message) {
    set({ replyToMessage: message });
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
          try {
            const packet = JSON.parse(event.data);
            if (packet.type === "typing") {
              // Ignore own typing events
              const typingUserId = packet.payload?.user_id || packet.user_id;
              if (typingUserId === get().user?.id) return;
              const typingState = packet.payload?.state || packet.state;
              if (typingState === "stopped") {
                set({ typingUser: null });
              } else {
                const active = get().conversations.find((item) => item.id === socketConversationId);
                const name = active ? otherParticipant(active, get().user?.id)?.display_name || "Someone" : "Someone";
                set({ typingUser: name });
                // Auto-clear typing after 4 seconds
                setTimeout(() => {
                  if (get().typingUser) set({ typingUser: null });
                }, 4000);
              }
              return;
            }
            // Refresh messages and conversations for any other event
            const latest = await api.messages(auth(get()), socketConversationId);
            const freshConversations = sortConversations(await api.conversations(auth(get()), get().query));
            set((current) => ({
              messages: { ...current.messages, [socketConversationId]: latest },
              conversations: freshConversations,
            }));
          } catch {
            // ignore parse errors
          }
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

  async sendMessage(content, options) {
    const state = get();
    const conversationId = state.activeConversationId;
    const replyTo = state.replyToMessage?.id || null;
    if (!conversationId || !state.user || (!content.trim() && !options?.attachment_url)) return;

    const now = new Date().toISOString();
    const tempId = Date.now() * -1;
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: state.user.id,
      reply_to: replyTo ?? null,
      content: content.trim(),
      attachment_url: options?.attachment_url ?? null,
      message_type: (options?.message_type as any) ?? "TEXT",
      expires_at: options?.expires_in_seconds ? new Date(Date.now() + options.expires_in_seconds * 1000).toISOString() : null,
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
      replyToMessage: null,
      messages: {
        ...current.messages,
        [conversationId]: [...(current.messages[conversationId] || []), optimistic],
      },
    }));

    try {
      const saved = await api.sendMessage(auth(get()), conversationId, { 
        content, 
        reply_to: replyTo,
        attachment_url: options?.attachment_url,
        message_type: options?.message_type,
        expires_in_seconds: options?.expires_in_seconds
      });
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

  async createDirectChat(userId) {
    try {
      set({ loading: true });
      const conversation = await api.createDirectChat(auth(get()), userId);
      const conversations = sortConversations(await api.conversations(auth(get()), get().query));
      set({ conversations });
      await get().selectConversation(conversation.id);
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Failed to create conversation", "error");
      set({ loading: false });
    }
  },

  async createGroup(name, memberIds) {
    try {
      set({ loading: true });
      const conversation = await api.createGroup(auth(get()), { name, member_ids: memberIds });
      const conversations = sortConversations(await api.conversations(auth(get()), get().query));
      set({ conversations });
      await get().selectConversation(conversation.id);
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Failed to create group", "error");
      set({ loading: false });
    }
  },

  async renameGroup(conversationId, name) {
    try {
      await api.renameGroup(auth(get()), conversationId, name);
      const conversations = sortConversations(await api.conversations(auth(get()), get().query));
      set({ conversations });
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Failed to rename group", "error");
    }
  },

  async addGroupMember(conversationId, userId) {
    try {
      await api.addGroupMember(auth(get()), conversationId, userId);
      const conversations = sortConversations(await api.conversations(auth(get()), get().query));
      set({ conversations });
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Failed to add member", "error");
    }
  },

  async removeGroupMember(conversationId, userId) {
    try {
      await api.removeGroupMember(auth(get()), conversationId, userId);
      const conversations = sortConversations(await api.conversations(auth(get()), get().query));
      set({ conversations });
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Failed to remove member", "error");
    }
  },

  async uploadAttachment(file) {
    try {
      set({ loading: true });
      const res = await api.uploadAttachment(auth(get()), file);
      set({ loading: false });
      return { url: res.url, contentType: res.content_type };
    } catch (error) {
      set({ loading: false });
      get().pushToast(error instanceof Error ? error.message : "Upload failed", "error");
      return null;
    }
  },

  async searchUsers(q) {
    try {
      return await api.searchUsers(auth(get()), q);
    } catch (error) {
      get().pushToast(error instanceof Error ? error.message : "Search failed", "error");
      return [];
    }
  },

  sendTyping(state) {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Backend expects { type: "typing", state: "started"|"stopped", user_id: N }
      socket.send(JSON.stringify({ type: "typing", state, user_id: get().user?.id }));
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
