"use client";

import clsx from "clsx";
import { useChatStore } from "@/store/chat-store";

export function ToastRegion() {
  const toasts = useChatStore((state) => state.toasts);
  const dismissToast = useChatStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-[min(420px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={clsx(
            "pointer-events-auto animate-slide-up rounded-[16px] px-4 py-3 text-left text-[14px] text-white shadow-sm",
            toast.tone === "error" && "bg-[var(--error)]",
            toast.tone === "success" && "bg-[var(--success)]",
            toast.tone === "neutral" && "bg-[#111111]",
          )}
        >
          {toast.text}
        </button>
      ))}
    </div>
  );
}
