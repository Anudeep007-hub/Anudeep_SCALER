import clsx from "clsx";
import { CheckCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatClock } from "@/lib/api";
import type { Conversation, User } from "@/types";

type ConversationItemProps = {
  conversation: Conversation;
  currentUser: User;
  active: boolean;
  onClick: () => void;
};

export function conversationTitle(conversation: Conversation, currentUserId?: number) {
  if (conversation.type === "GROUP") return conversation.name || "Group";
  return conversation.participants.find((participant) => participant.user_id !== currentUserId)?.user.display_name || "Signal User";
}

export function conversationAvatar(conversation: Conversation, userId?: number): User | undefined {
  if (conversation.type === "DIRECT") {
    const other = conversation.participants.find((p) => p.user_id !== userId);
    if (other) {
      return {
        ...other.user,
        is_online: false,
      };
    }
  }
}

export function ConversationItem({ conversation, currentUser, active, onClick }: ConversationItemProps) {
  const title = conversationTitle(conversation, currentUser.id);
  const avatarUser = conversationAvatar(conversation, currentUser.id);
  const last = conversation.last_message;
  const fromSelf = last?.sender_id === currentUser.id;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "grid h-[72px] w-full grid-cols-[48px_1fr_auto] items-center gap-3 px-4 text-left transition duration-150 hover:bg-[var(--hover)]",
        active && "bg-[var(--selection)] hover:bg-[var(--selection)]",
      )}
    >
      <Avatar user={avatarUser} label={title} src={conversation.avatar_url} size="lg" showStatus={avatarUser?.is_online} />
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-semibold leading-[1.3] text-[var(--text)]">{title}</span>
        <span className="mt-1 flex min-w-0 items-center gap-1 text-[14px] text-[var(--muted)]">
          {fromSelf ? <CheckCheck size={16} strokeWidth={2} className="shrink-0" /> : null}
          <span className="truncate">{last?.content || "No messages yet"}</span>
        </span>
      </span>
      <span className="flex h-full min-w-10 flex-col items-end justify-center gap-2">
        <span className="text-[12px] text-[var(--muted)]">{formatClock(last?.created_at || conversation.updated_at)}</span>
        {conversation.unread_count ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[12px] font-semibold text-white">
            {conversation.unread_count}
          </span>
        ) : null}
      </span>
    </button>
  );
}
