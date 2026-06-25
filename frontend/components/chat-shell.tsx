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

  const activeConversationId = useChatStore((state) => state.activeConversationId);

  useEffect(() => {
    void boot();
    
    // Initialize theme
    const saved = localStorage.getItem("signal_theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
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
        <div className={activeConversationId ? "hidden md:block" : "block"}>
          <Sidebar />
        </div>
        <section className={activeConversationId ? "flex min-h-0 min-w-0 flex-col bg-[var(--chat)]" : "hidden min-h-0 min-w-0 flex-col bg-[var(--chat)] md:flex"}>
          {activeConversationId ? (
            <>
              <ChatHeader />
              <MessageList />
              <MessageInput />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[14px] text-[var(--muted)]">Select a conversation</div>
          )}
        </section>
      </main>
      <ToastRegion />
    </>
  );
}
