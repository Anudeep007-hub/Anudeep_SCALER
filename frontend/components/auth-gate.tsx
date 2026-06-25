"use client";

import { FormEvent, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useChatStore } from "@/store/chat-store";

export function AuthGate() {
  const signIn = useChatStore((state) => state.signIn);
  const loading = useChatStore((state) => state.loading);
  const [displayName, setDisplayName] = useState("Maya Chen");
  const [phone, setPhone] = useState("+15550000001");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await signIn({ displayName, phone });
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-[var(--background)] px-6">
      <form onSubmit={submit} className="w-full max-w-[360px] animate-slide-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <MessageCircle size={32} strokeWidth={2} />
          </div>
          <h1 className="text-[24px] font-semibold leading-[1.3] text-[var(--text)]">Signal</h1>
          <p className="mt-2 text-[14px] text-[var(--muted)]">Mock OTP 123456</p>
        </div>

        <div className="space-y-4">
          <Input aria-label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          <Input aria-label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Button className="w-full" disabled={loading || !displayName.trim() || !phone.trim()}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
