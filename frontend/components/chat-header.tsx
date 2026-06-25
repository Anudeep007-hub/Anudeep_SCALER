"use client";

import { ArrowLeft, Info, MoreHorizontal, Phone, Search, Video } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { conversationAvatar, conversationTitle } from "@/components/conversation-item";
import { IconButton } from "@/components/icon-button";
import { useChatStore } from "@/store/chat-store";

export function ChatHeader() {
  const user = useChatStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const active = conversations.find((conversation) => conversation.id === activeConversationId);

  if (!user || !active) {
    return <header className="h-16 shrink-0 border-b border-[var(--border)] bg-[var(--sidebar)]" />;
  }

  const title = conversationTitle(active, user.id);
  const avatar = conversationAvatar(active, user.id);
  const subtitle =
    active.type === "GROUP"
      ? `${active.participants.length} members`
      : avatar?.is_online
        ? "Online"
        : avatar?.last_seen
          ? "Last seen recently"
          : "Offline";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton label="Back" className="md:hidden" onClick={() => selectConversation(0)}>
          <ArrowLeft size={20} strokeWidth={2} />
        </IconButton>
        <Avatar user={avatar} label={title} src={active.avatar_url} size="md" showStatus={avatar?.is_online} />
        <div className="min-w-0">
          <div className="truncate text-[16px] font-semibold leading-[1.3] text-[var(--text)]">{title}</div>
          <div className="truncate text-[12px] text-[var(--muted)]">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center">
        <IconButton label="Search">
          <Search size={20} strokeWidth={2} />
        </IconButton>
        <IconButton label="Voice call">
          <Phone size={20} strokeWidth={2} />
        </IconButton>
        <IconButton label="Video call">
          <Video size={20} strokeWidth={2} />
        </IconButton>
        <IconButton label="Conversation info">
          <Info size={20} strokeWidth={2} />
        </IconButton>
        <IconButton label="More">
          <MoreHorizontal size={20} strokeWidth={2} />
        </IconButton>
      </div>
    </header>
  );
}
