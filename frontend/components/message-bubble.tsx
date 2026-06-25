import clsx from "clsx";
import { Check, CheckCheck, Clock, Reply as ReplyIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatClock } from "@/lib/api";
import type { Conversation, Message, User } from "@/types";

type MessageBubbleProps = {
  message: Message;
  previous?: Message;
  conversation: Conversation;
  currentUser: User;
  replies: Map<number, Message>;
  onReact: (messageId: number, emoji: string) => void;
  onReply: (message: Message) => void;
};

function StatusIcon({ status }: { status: Message["status"] }) {
  switch (status) {
    case "SENDING":
      return <Clock size={14} strokeWidth={2} className="text-white/60" />;
    case "SENT":
      return <Check size={14} strokeWidth={2} />;
    case "DELIVERED":
      return <CheckCheck size={14} strokeWidth={2} />;
    case "READ":
      return <CheckCheck size={14} strokeWidth={2} className="text-[#53bdeb]" />;
    default:
      return <Check size={14} strokeWidth={2} />;
  }
}

export function MessageBubble({ message, previous, conversation, currentUser, replies, onReact, onReply }: MessageBubbleProps) {
  const own = message.sender_id === currentUser.id;
  const startsGroup = !previous || previous.sender_id !== message.sender_id;
  const sender = message.sender || conversation.participants.find((participant) => participant.user_id === message.sender_id)?.user;
  const reply = message.reply_to ? replies.get(message.reply_to) : null;

  return (
    <div
      id={`message-${message.id}`}
      className={clsx(
        "group flex gap-2 px-6",
        startsGroup ? "mt-4" : "mt-1",
        own ? "justify-end" : "justify-start",
      )}
    >
      {!own ? (
        <div className="w-8 pt-5">{startsGroup ? <Avatar user={sender} size="sm" /> : null}</div>
      ) : null}

      <div className={clsx("flex max-w-[70%] flex-col", own ? "items-end" : "items-start")}>
        {conversation.type === "GROUP" && !own && startsGroup ? (
          <div className="mb-1 px-1 text-[12px] font-semibold text-[var(--primary)]">{sender?.display_name || "Signal User"}</div>
        ) : null}

        {/* Reply preview block */}
        {reply ? (
          <a
            href={`#message-${reply.id}`}
            className={clsx(
              "mb-1 flex w-full items-center gap-2 rounded-t-[18px] rounded-b-[4px] px-4 py-2 text-[13px] no-underline",
              own ? "bg-[#2a5697] text-white/90" : "bg-[var(--hover)] text-[var(--text)]",
            )}
          >
            <div className={clsx("w-1 self-stretch rounded-full", own ? "bg-white/50" : "bg-[var(--primary)]")} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold">{reply.sender?.display_name || "Reply"}</div>
              <div className="truncate">{reply.content}</div>
            </div>
          </a>
        ) : null}

        <div
          className={clsx(
            "relative px-3 py-2 text-[15px] leading-[1.45] transition duration-150",
            reply ? "rounded-b-[18px] rounded-t-[4px]" : "rounded-[18px]",
            own ? "bg-[var(--own-message)] text-[var(--own-text)]" : "bg-[var(--received-bubble)] text-[var(--received-text)]",
            message.optimistic && "opacity-70",
          )}
        >
          {/* Image attachment */}
          {message.attachment_url && message.message_type === "IMAGE" ? (
            <img src={message.attachment_url} alt="" className="mb-2 max-h-[280px] rounded-[12px] object-cover" />
          ) : null}

          {/* File attachment */}
          {message.attachment_url && message.message_type === "FILE" ? (
            <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center gap-2 rounded-[8px] bg-white/10 p-2 text-[13px] underline">
              📎 {message.content}
            </a>
          ) : null}

          {/* Message text */}
          {message.message_type !== "FILE" && (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}

          {/* Timestamp + status */}
          <span className={clsx("ml-3 inline-flex translate-y-[3px] items-center gap-1 text-[11px]", own ? "text-white/70" : "text-[var(--muted)]")}>
            {formatClock(message.created_at)}
            {own ? <StatusIcon status={message.status} /> : null}
          </span>
        </div>

        {/* Reactions & actions */}
        <div className={clsx("mt-1 flex items-center gap-1", own ? "flex-row-reverse" : "flex-row")}>
          {message.reactions.length ? (
            <div className="rounded-full border border-[var(--border)] bg-[var(--sidebar)] px-2 py-0.5 text-[13px] shadow-sm">
              {message.reactions.map((reaction) => reaction.emoji).join(" ")}
            </div>
          ) : null}
          <div className="flex gap-1 opacity-0 transition duration-150 group-hover:opacity-100">
            <button
              onClick={() => onReply(message)}
              className="flex h-7 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--sidebar)] px-2 text-[12px] text-[var(--muted)] hover:bg-[var(--hover)]"
            >
              <ReplyIcon size={12} strokeWidth={2} /> Reply
            </button>
            {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--sidebar)] text-[14px] hover:bg-[var(--hover)] hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
