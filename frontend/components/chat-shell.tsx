"use client";

import { useEffect } from "react";
import { AuthGate } from "@/components/auth-gate";
import { ChatHeader } from "@/components/chat-header";
import { MessageInput } from "@/components/message-input";
import { MessageList } from "@/components/message-list";
import { Sidebar } from "@/components/sidebar";
import { ToastRegion } from "@/components/toast-region";
import { useChatStore } from "@/store/chat-store";

export function ChatShell() {
  const user = useChatStore((state) => state.user);
  const loading = useChatStore((state) => state.loading);
  const boot = useChatStore((state) => state.boot);

  useEffect(() => {
    void boot();
  }, [boot]);

  if (!user && !loading) {
    return (
      <>
        <AuthGate />
        <ToastRegion />
      </>
    );
  }

  return (
    <>
      <main className="grid h-dvh bg-[var(--background)] md:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <section className="hidden min-w-0 flex-col bg-[var(--chat)] md:flex">
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </section>
      </main>
      <ToastRegion />
    </>
  );
}
