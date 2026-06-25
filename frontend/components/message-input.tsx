"use client";

import { FormEvent, KeyboardEvent, useState, useRef, ChangeEvent } from "react";
import { ImagePlus, Mic, Plus, Send, Smile, X, Timer } from "lucide-react";
import { IconButton } from "@/components/icon-button";
import { useChatStore } from "@/store/chat-store";
import clsx from "clsx";

const EXPIRY_OPTIONS = [null, 10, 60 * 60, 60 * 60 * 24]; // Off, 10s, 1h, 1d
const EXPIRY_LABELS = ["Off", "10s", "1h", "1d"];

export function MessageInput() {
  const [text, setText] = useState("");
  const [expiryIndex, setExpiryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const sending = useChatStore((state) => state.sending);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const replyToMessage = useChatStore((state) => state.replyToMessage);
  const setReplyToMessage = useChatStore((state) => state.setReplyToMessage);
  const uploadAttachment = useChatStore((state) => state.uploadAttachment);

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || !activeConversationId) return;
    setText("");
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

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activeConversationId) return;
    
    const isImage = file.type.startsWith("image/");
    const res = await uploadAttachment(file);
    if (res) {
      await sendMessage(isImage ? "Image" : file.name, {
        attachment_url: res.url,
        message_type: isImage ? "IMAGE" : "FILE",
        expires_in_seconds: EXPIRY_OPTIONS[expiryIndex] || undefined
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-[var(--border)] bg-[var(--sidebar)]">
      {replyToMessage ? (
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--search)] px-4 py-2">
          <div className="min-w-0 border-l-2 border-[var(--primary)] pl-2">
            <span className="block text-[12px] font-semibold text-[var(--primary)]">Replying to {replyToMessage.sender?.display_name || "Someone"}</span>
            <span className="block truncate text-[13px] text-[var(--text)]">{replyToMessage.content}</span>
          </div>
          <IconButton label="Cancel reply" onClick={() => setReplyToMessage(null)}>
            <X size={16} strokeWidth={2} />
          </IconButton>
        </div>
      ) : null}
      <form onSubmit={submit} className="flex h-[72px] items-center gap-2 px-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf,.doc,.docx" 
        />
        <IconButton label="Add attachment" disabled={!activeConversationId} onClick={() => fileInputRef.current?.click()}>
          <Plus size={20} strokeWidth={2} />
        </IconButton>
        <IconButton label="Image" disabled={!activeConversationId} onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.accept = "image/*";
            fileInputRef.current.click();
          }
        }}>
          <ImagePlus size={20} strokeWidth={2} />
        </IconButton>
        <button
          type="button"
          onClick={() => setExpiryIndex((i) => (i + 1) % EXPIRY_OPTIONS.length)}
          disabled={!activeConversationId}
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            EXPIRY_OPTIONS[expiryIndex] ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--hover)]"
          )}
          title={`Disappearing messages: ${EXPIRY_LABELS[expiryIndex]}`}
        >
          <Timer size={20} strokeWidth={2} />
          {EXPIRY_OPTIONS[expiryIndex] && <span className="absolute mt-6 text-[10px] font-bold">{EXPIRY_LABELS[expiryIndex]}</span>}
        </button>
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
    </div>
  );
}
