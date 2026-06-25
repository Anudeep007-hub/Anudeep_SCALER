"use client";

import { useEffect, useMemo, useRef } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { useChatStore } from "@/store/chat-store";

function TypingBubble({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-6 py-2 animate-fade-in">
      <div className="flex h-10 items-center gap-1 rounded-[18px] bg-[var(--received-bubble)] px-4 py-3">
        <div className="flex items-center gap-[3px]">
          <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[var(--muted)] [animation-delay:0ms]" />
          <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[var(--muted)] [animation-delay:150ms]" />
          <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[var(--muted)] [animation-delay:300ms]" />
        </div>
      </div>
      <span className="text-[12px] text-[var(--muted)]">{name} is typing</span>
    </div>
  );
}

export function MessageList() {
  const user = useChatStore((state) => state.user);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const messagesByConversation = useChatStore((state) => state.messages);
  const typingUser = useChatStore((state) => state.typingUser);
  const react = useChatStore((state) => state.react);
  const setReplyToMessage = useChatStore((state) => state.setReplyToMessage);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const conversation = conversations.find((item) => item.id === activeConversationId);
  const messages = activeConversationId ? messagesByConversation[activeConversationId] || [] : [];
  const replies = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversationId, messages.length, typingUser]);

  if (!user || !conversation) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--chat)] px-6 text-center text-[14px] text-[var(--muted)]">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--chat)] py-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-[14px] text-[var(--muted)]">
          No messages yet. Say hi! 👋
        </div>
      ) : null}
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          previous={messages[index - 1]}
          conversation={conversation}
          currentUser={user}
          replies={replies}
          onReact={react}
          onReply={setReplyToMessage}
        />
      ))}
      {typingUser ? <TypingBubble name={typingUser} /> : null}
      <div ref={bottomRef} />
    </div>
  );
}
