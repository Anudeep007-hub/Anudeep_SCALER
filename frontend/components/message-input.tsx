"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { ImagePlus, Mic, Plus, Send, Smile } from "lucide-react";
import { IconButton } from "@/components/icon-button";
import { useChatStore } from "@/store/chat-store";

export function MessageInput() {
  const [text, setText] = useState("");
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const sending = useChatStore((state) => state.sending);
  const sendMessage = useChatStore((state) => state.sendMessage);

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || !activeConversationId) return;
    setText("");
    await sendMessage(value);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <form onSubmit={submit} className="flex h-[72px] shrink-0 items-center gap-2 border-t border-[var(--border)] bg-[var(--sidebar)] px-4">
      <IconButton label="Add attachment" disabled={!activeConversationId}>
        <Plus size={20} strokeWidth={2} />
      </IconButton>
      <IconButton label="Image" disabled={!activeConversationId}>
        <ImagePlus size={20} strokeWidth={2} />
      </IconButton>
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-[14px] border border-transparent bg-[var(--search)] px-3 focus-within:border-[var(--primary)] focus-within:bg-[var(--sidebar)]">
        <textarea
          aria-label="Message"
          value={text}
          onChange={(event) => setText(event.target.value)}
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
      {text.trim() ? (
        <IconButton label="Send" type="submit" disabled={sending || !activeConversationId} className="bg-[var(--primary)] text-white hover:bg-[var(--primary)] hover:opacity-90">
          <Send size={20} strokeWidth={2} />
        </IconButton>
      ) : (
        <IconButton label="Voice message" disabled={!activeConversationId}>
          <Mic size={20} strokeWidth={2} />
        </IconButton>
      )}
    </form>
  );
}
