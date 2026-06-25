import type { AuthResponse, Conversation, Message, Reaction, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type AuthHeaders = {
  token?: string | null;
  userId?: number | null;
};

async function request<T>(path: string, options: RequestInit = {}, auth: AuthHeaders = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (auth.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  } else if (auth.userId) {
    headers.set("X-User-Id", String(auth.userId));
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Something went wrong");
  }

  return response.json() as Promise<T>;
}

export const api = {
  baseUrl: API_URL,

  register(payload: { phone: string; display_name: string; username?: string; avatar_url?: string; otp: string }) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me(auth: AuthHeaders) {
    return request<User>("/api/auth/me", {}, auth);
  },

  conversations(auth: AuthHeaders, q?: string) {
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    return request<Conversation[]>(`/api/conversations${params}`, {}, auth);
  },

  messages(auth: AuthHeaders, conversationId: number) {
    return request<Message[]>(`/api/conversations/${conversationId}/messages`, {}, auth);
  },

  sendMessage(auth: AuthHeaders, conversationId: number, payload: { content: string; reply_to?: number | null }) {
    return request<Message>(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content: payload.content, reply_to: payload.reply_to ?? null }),
      },
      auth,
    );
  },

  markRead(auth: AuthHeaders, conversationId: number) {
    return request<Message[]>(`/api/conversations/${conversationId}/read`, { method: "POST" }, auth);
  },

  react(auth: AuthHeaders, messageId: number, emoji: string) {
    return request<Reaction>(
      `/api/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: JSON.stringify({ emoji }),
      },
      auth,
    );
  },

  searchUsers(auth: AuthHeaders, q: string) {
    return request<User[]>(`/api/users/search?q=${encodeURIComponent(q)}`, {}, auth);
  },
};

export function socketUrl(conversationId: number) {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `/ws/conversations/${conversationId}`;
  return url.toString();
}

export function formatClock(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
