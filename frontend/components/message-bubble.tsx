import clsx from "clsx";
import { Check, CheckCheck } from "lucide-react";
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
};

function statusIcon(status: Message["status"]) {
  if (status === "SENDING") return <span className="text-[12px]">Sending</span>;
  if (status === "SENT") return <Check size={16} strokeWidth={2} />;
  return <CheckCheck size={16} strokeWidth={2} />;
}

export function MessageBubble({ message, previous, conversation, currentUser, replies, onReact }: MessageBubbleProps) {
  const own = message.sender_id === currentUser.id;
  const startsGroup = !previous || previous.sender_id !== message.sender_id;
  const sender = message.sender || conversation.participants.find((participant) => participant.user_id === message.sender_id)?.user;
  const reply = message.reply_to ? replies.get(message.reply_to) : null;

  return (
    <div
      id={`message-${message.id}`}
      className={clsx(
        "group flex gap-2 px-6",
        startsGroup ? "mt-4" : "mt-2",
        own ? "justify-end" : "justify-start",
      )}
    >
      {!own ? (
        <div className="w-9 pt-5">{startsGroup ? <Avatar user={sender} size="sm" /> : null}</div>
      ) : null}

      <div className={clsx("flex max-w-[70%] flex-col", own ? "items-end" : "items-start")}>
        {conversation.type === "GROUP" && !own && startsGroup ? (
          <div className="mb-1 px-1 text-[12px] font-semibold text-[var(--muted)]">{sender?.display_name || "Signal User"}</div>
        ) : null}

        <div
          className={clsx(
            "relative rounded-[18px] px-4 py-3 text-[15px] leading-[1.45] transition duration-150",
            own ? "bg-[var(--own-message)] text-[var(--own-text)]" : "bg-[var(--received-bubble)] text-[var(--received-text)]",
            message.optimistic && "opacity-80",
          )}
        >
          {reply ? (
            <a
              href={`#message-${reply.id}`}
              className={clsx(
                "mb-2 block rounded-[12px] border-l-2 px-3 py-2 text-[12px]",
                own ? "border-white/70 bg-white/10 text-white/90" : "border-[var(--primary)] bg-white/70 text-[var(--muted)]",
              )}
            >
              <span className="block truncate font-semibold">{reply.sender?.display_name || "Reply"}</span>
              <span className="block truncate">{reply.content}</span>
            </a>
          ) : null}

          {message.attachment_url && message.message_type === "IMAGE" ? (
            <img src={message.attachment_url} alt="" className="mb-2 max-h-[280px] rounded-[12px] object-cover" />
          ) : null}
          <span className="whitespace-pre-wrap break-words">{message.content}</span>
          <span className={clsx("ml-3 inline-flex translate-y-1 items-center gap-1 text-[12px]", own ? "text-white/80" : "text-[var(--muted)]")}>
            {formatClock(message.created_at)}
            {own ? statusIcon(message.status) : null}
          </span>
        </div>

        <div className={clsx("mt-1 flex min-h-6 items-center gap-1", own ? "flex-row-reverse" : "flex-row")}>
          {message.reactions.length ? (
            <div className="rounded-full border border-[var(--border)] bg-[var(--sidebar)] px-2 py-0.5 text-[12px] shadow-sm">
              {message.reactions.map((reaction) => reaction.emoji).join(" ")}
            </div>
          ) : null}
          <div className="hidden gap-1 opacity-0 transition duration-150 group-hover:flex group-hover:opacity-100">
            {["ok", "heart", "+1"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="h-6 rounded-full border border-[var(--border)] bg-[var(--sidebar)] px-2 text-[12px] text-[var(--muted)] hover:bg-[var(--hover)]"
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
