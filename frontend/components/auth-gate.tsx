"use client";

import { FormEvent, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useChatStore } from "@/store/chat-store";

export function AuthGate() {
  const signIn = useChatStore((state) => state.signIn);
  const loading = useChatStore((state) => state.loading);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    const cleanedPhone = phone.replace(/\s+/g, "");
    if (!phoneRegex.test(cleanedPhone)) {
      setError("Please enter a valid phone number (e.g., +1234567890).");
      return;
    }
    
    setError("");
    await signIn({ displayName, phone: cleanedPhone });
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-[var(--background)] px-6">
      <form onSubmit={submit} className="w-full max-w-[360px] animate-slide-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <MessageCircle size={32} strokeWidth={2} />
          </div>
          <h1 className="text-[24px] font-semibold leading-[1.3] text-[var(--text)]">Signal</h1>
          <p className="mt-2 text-[14px] text-[var(--muted)]">Sign in with phone number</p>
        </div>

        <div className="space-y-4">
          <div>
            <Input aria-label="Display name" placeholder="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>
          <div>
            <Input aria-label="Phone" placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <Button className="w-full" disabled={loading || !displayName.trim() || !phone.trim()}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
