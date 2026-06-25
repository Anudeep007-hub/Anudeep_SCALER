import { useState, useEffect } from "react";
import { Search, Users, Check } from "lucide-react";
import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { useChatStore } from "@/store/chat-store";
import type { User } from "@/types";

export function NewChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  const searchUsers = useChatStore((state) => state.searchUsers);
  const createDirectChat = useChatStore((state) => state.createDirectChat);
  const createGroup = useChatStore((state) => state.createGroup);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setMode("direct");
      setGroupName("");
      setSelectedUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        const users = await searchUsers(query.trim());
        setResults(users);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, searchUsers]);

  const [creating, setCreating] = useState(false);

  async function handleSelect(user: User) {
    if (mode === "direct") {
      await createDirectChat(user.id);
      onClose();
    } else {
      if (selectedUsers.some((u) => u.id === user.id)) {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim() || selectedUsers.length === 0 || creating) return;
    setCreating(true);
    try {
      await createGroup(
        groupName.trim(),
        selectedUsers.map((u) => u.id)
      );
      onClose();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "direct" ? "New Chat" : "New Group"}>
      {mode === "direct" && (
        <button
          onClick={() => setMode("group")}
          className="flex w-full items-center gap-4 border-b border-[var(--border)] px-6 py-4 transition hover:bg-[var(--hover)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--search)] text-[var(--text)]">
            <Users size={20} />
          </div>
          <span className="text-[16px] font-semibold text-[var(--text)]">New Group</span>
        </button>
      )}

      {mode === "group" && (
        <div className="border-b border-[var(--border)] p-4">
          <Input
            aria-label="Group name"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-2"
          />
        </div>
      )}

      <div className="border-b border-[var(--border)] p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} strokeWidth={2} />
          <Input
            aria-label="Search people"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-11"
            placeholder="Search by name or phone"
            autoFocus={mode === "direct"}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 h-[240px]">
        {results.length === 0 ? (
          <div className="p-6 text-center text-[14px] text-[var(--muted)]">
            {query.trim() ? "No results found" : "Type a name to search"}
          </div>
        ) : (
          results.map((user) => {
            const isSelected = selectedUsers.some((u) => u.id === user.id);
            return (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="flex w-full items-center justify-between px-6 py-3 text-left transition duration-150 hover:bg-[var(--hover)]"
              >
                <div className="flex items-center gap-3">
                  <Avatar user={user} size="md" />
                  <div>
                    <div className="text-[16px] font-semibold leading-[1.3] text-[var(--text)]">
                      {user.display_name}
                    </div>
                  </div>
                </div>
                {mode === "group" && (
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
      
      {mode === "group" && (
        <div className="border-t border-[var(--border)] p-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setMode("direct")}>Cancel</Button>
          <Button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0 || creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
