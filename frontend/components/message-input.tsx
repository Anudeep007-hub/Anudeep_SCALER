"use client";

import { FormEvent, KeyboardEvent, useState, useRef, useEffect } from "react";
import { Send, Smile, X, Timer } from "lucide-react";
import { IconButton } from "@/components/icon-button";
import { useChatStore } from "@/store/chat-store";
import clsx from "clsx";

const EXPIRY_OPTIONS = [null, 10, 60 * 60, 60 * 60 * 24]; // Off, 10s, 1h, 1d
const EXPIRY_LABELS = ["Off", "10 sec", "1 hour", "1 day"];

export function MessageInput() {
  const [text, setText] = useState("");
  const [expiryIndex, setExpiryIndex] = useState(0);
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const sending = useChatStore((state) => state.sending);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const replyToMessage = useChatStore((state) => state.replyToMessage);
  const setReplyToMessage = useChatStore((state) => state.setReplyToMessage);
  const sendTyping = useChatStore((state) => state.sendTyping);

  // Focus textarea when reply is set
  useEffect(() => {
    if (replyToMessage) {
      textareaRef.current?.focus();
    }
  }, [replyToMessage]);

  function handleTextChange(value: string) {
    setText(value);
    // Send typing indicator
    sendTyping("started");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping("stopped"), 2000);
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || !activeConversationId) return;
    setText("");
    sendTyping("stopped");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await sendMessage(value, {
      expires_in_seconds: EXPIRY_OPTIONS[expiryIndex] || undefined
    });
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-[var(--border)] bg-[var(--sidebar)]">
      {/* Reply preview bar */}
      {replyToMessage ? (
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--search)] px-4 py-2 animate-fade-in">
          <div className="w-1 self-stretch rounded-full bg-[var(--primary)]" />
          <div className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold text-[var(--primary)]">
              Replying to {replyToMessage.sender?.display_name || "message"}
            </span>
            <span className="block truncate text-[13px] text-[var(--text)]">
              {replyToMessage.content}
            </span>
          </div>
          <IconButton label="Cancel reply" onClick={() => setReplyToMessage(null)}>
            <X size={16} strokeWidth={2} />
          </IconButton>
        </div>
      ) : null}

      {/* Disappearing message menu */}
      {showExpiryMenu && (
        <div className="absolute bottom-20 left-4 z-50 rounded-[12px] border border-[var(--border)] bg-[var(--sidebar)] p-2 shadow-lg animate-slide-up">
          <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Disappearing messages</div>
          {EXPIRY_OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setExpiryIndex(i); setShowExpiryMenu(false); }}
              className={clsx(
                "flex w-full items-center rounded-[8px] px-3 py-2 text-[14px] text-left transition-colors",
                expiryIndex === i ? "bg-[var(--primary)] text-white" : "text-[var(--text)] hover:bg-[var(--hover)]"
              )}
            >
              {EXPIRY_LABELS[i]}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex h-[72px] items-center gap-2 px-4">
        <button
          type="button"
          onClick={() => setShowExpiryMenu(!showExpiryMenu)}
          disabled={!activeConversationId}
          className={clsx(
            "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            EXPIRY_OPTIONS[expiryIndex] ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--hover)]"
          )}
          title={`Disappearing messages: ${EXPIRY_LABELS[expiryIndex]}`}
        >
          <Timer size={20} strokeWidth={2} />
        </button>
        <div className="flex h-12 min-w-0 flex-1 items-center rounded-[24px] border border-transparent bg-[var(--search)] px-3 focus-within:border-[var(--primary)] focus-within:bg-[var(--sidebar)]">
          <textarea
            ref={textareaRef}
            aria-label="Message"
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            onKeyDown={keyDown}
            disabled={!activeConversationId}
            rows={1}
            placeholder="Signal message"
            className="max-h-10 min-h-6 flex-1 resize-none bg-transparent text-[15px] leading-[1.45] text-[var(--text)] placeholder:text-[var(--muted)] outline-none"
          />
          <IconButton label="Emoji" className="h-9 w-9" disabled={!activeConversationId}>
            <Smile size={20} strokeWidth={2} />
          </IconButton>
        </div>
        <IconButton label="Send" type="submit" disabled={sending || !activeConversationId || !text.trim()} className={clsx(text.trim() ? "bg-[var(--primary)] text-white hover:opacity-90" : "text-[var(--muted)]")}>
          <Send size={20} strokeWidth={2} />
        </IconButton>
      </form>
    </div>
  );
}
