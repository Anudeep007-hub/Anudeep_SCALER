"use client";

import { ArrowLeft, Info, MoreHorizontal, Phone, Search, Video } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { conversationAvatar, conversationTitle } from "@/components/conversation-item";
import { IconButton } from "@/components/icon-button";
import { useChatStore } from "@/store/chat-store";
import { GroupInfoModal } from "@/components/group-info-modal";
import { useState } from "react";

export function ChatHeader() {
  const user = useChatStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const active = conversations.find((conversation) => conversation.id === activeConversationId);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  if (!user || !active) {
    return (
      <header className="flex h-16 shrink-0 items-center border-b border-[var(--border)] bg-[var(--sidebar)] px-4">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--border)]" />
      </header>
    );
  }

  const title = conversationTitle(active, user.id);
  const avatar = conversationAvatar(active, user.id);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton label="Back" className="md:hidden" onClick={() => selectConversation(0)}>
            <ArrowLeft size={20} strokeWidth={2} />
          </IconButton>
          <Avatar user={avatar} label={title} src={active.avatar_url} size="md" showStatus={avatar?.is_online} />
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold leading-[1.3] text-[var(--text)]">{title}</div>
            {active.type === "DIRECT" && avatar?.is_online && <div className="text-[13px] text-[var(--primary)]">Online</div>}
            {active.type === "GROUP" && (
              <div className="truncate text-[13px] text-[var(--muted)]">
                {active.participants.map((p) => p.user?.display_name).join(", ")}
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[var(--muted)]">
          <IconButton label="Video call">
            <Video size={20} strokeWidth={2} />
          </IconButton>
          <IconButton label="Voice call">
            <Phone size={20} strokeWidth={2} />
          </IconButton>
          <IconButton label="Search">
            <Search size={20} strokeWidth={2} />
          </IconButton>
          {active.type === "GROUP" && (
            <IconButton label="Group info" onClick={() => setShowGroupInfo(true)}>
              <Info size={20} strokeWidth={2} />
            </IconButton>
          )}
          <IconButton label="More options">
            <MoreHorizontal size={20} strokeWidth={2} />
          </IconButton>
        </div>
      </header>
      <GroupInfoModal isOpen={showGroupInfo} onClose={() => setShowGroupInfo(false)} />
    </>
  );
}
