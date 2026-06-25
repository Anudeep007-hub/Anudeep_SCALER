"use client";

import { useEffect, useMemo, useRef } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { useChatStore } from "@/store/chat-store";

export function MessageList() {
  const user = useChatStore((state) => state.user);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const messagesByConversation = useChatStore((state) => state.messages);
  const typingUser = useChatStore((state) => state.typingUser);
  const react = useChatStore((state) => state.react);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const conversation = conversations.find((item) => item.id === activeConversationId);
  const messages = activeConversationId ? messagesByConversation[activeConversationId] || [] : [];
  const replies = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversationId, messages.length]);

  if (!user || !conversation) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--chat)] px-6 text-center text-[14px] text-[var(--muted)]">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--chat)] py-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          previous={messages[index - 1]}
          conversation={conversation}
          currentUser={user}
          replies={replies}
          onReact={react}
        />
      ))}
      {typingUser ? <div className="px-16 py-2 text-[14px] text-[var(--muted)]">{typingUser} is typing...</div> : null}
      <div ref={bottomRef} />
    </div>
  );
}
