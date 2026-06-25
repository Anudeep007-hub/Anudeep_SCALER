"use client";

import { useState } from "react";
import { Edit3, LogOut, Search, Settings } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ConversationItem } from "@/components/conversation-item";
import { IconButton } from "@/components/icon-button";
import { Input } from "@/components/input";
import { useChatStore } from "@/store/chat-store";
import { NewChatModal } from "@/components/new-chat-modal";
import { SettingsModal } from "@/components/settings-modal";

export function Sidebar() {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = useChatStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const query = useChatStore((state) => state.query);
  const setQuery = useChatStore((state) => state.setQuery);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const signOut = useChatStore((state) => state.signOut);

  if (!user) return null;

  const filtered = conversations.filter((conversation) => {
    const text = `${conversation.name || ""} ${conversation.participants.map((participant) => participant.user.display_name).join(" ")} ${
      conversation.last_message?.content || ""
    }`;
    return text.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <aside className="flex h-dvh w-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)] md:w-[320px] md:shrink-0">
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar user={user} size="md" showStatus />
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold leading-[1.3] text-[var(--text)]">{user.display_name}</div>
            <div className="truncate text-[12px] text-[var(--muted)]">{user.phone}</div>
          </div>
        </div>
        <div className="flex items-center">
          <IconButton label="New chat" onClick={() => setNewChatOpen(true)}>
            <Edit3 size={20} strokeWidth={2} />
          </IconButton>
          <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
            <Settings size={20} strokeWidth={2} />
          </IconButton>
          <IconButton label="Log out" onClick={signOut}>
            <LogOut size={20} strokeWidth={2} />
          </IconButton>
        </div>
      </header>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} strokeWidth={2} />
          <Input
            aria-label="Search conversations"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-11"
            placeholder="Search"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            currentUser={user}
            active={conversation.id === activeConversationId}
            onClick={() => selectConversation(conversation.id)}
          />
        ))}
      </div>
      <NewChatModal isOpen={newChatOpen} onClose={() => setNewChatOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </aside>
  );
}
