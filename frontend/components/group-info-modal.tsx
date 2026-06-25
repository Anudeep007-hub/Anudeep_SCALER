import { useState, useEffect } from "react";
import { Search, UserMinus, Check } from "lucide-react";
import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { useChatStore } from "@/store/chat-store";
import type { User } from "@/types";

export function GroupInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const user = useChatStore((state) => state.user);
  const renameGroup = useChatStore((state) => state.renameGroup);
  const addGroupMember = useChatStore((state) => state.addGroupMember);
  const removeGroupMember = useChatStore((state) => state.removeGroupMember);
  const searchUsers = useChatStore((state) => state.searchUsers);

  const conversation = conversations.find((c) => c.id === activeConversationId);
  
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    if (conversation && isOpen) {
      setName(conversation.name || "");
      setQuery("");
      setResults([]);
    }
  }, [conversation, isOpen]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const users = await searchUsers(query.trim());
      setResults(users);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen, searchUsers]);

  if (!conversation || conversation.type !== "GROUP" || !user) return null;

  const isMember = (userId: number) => conversation.participants.some((p) => p.user_id === userId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Info">
      <div className="p-4 border-b border-[var(--border)]">
        <label className="text-[12px] font-semibold text-[var(--muted)] mb-1 block">Group Name</label>
        <div className="flex gap-2">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Group Name"
          />
          <Button 
            disabled={name.trim() === "" || name.trim() === conversation.name} 
            onClick={() => renameGroup(conversation.id, name.trim())}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-[var(--border)]">
        <label className="text-[12px] font-semibold text-[var(--muted)] mb-1 block">Add Members</label>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            placeholder="Search by name or phone"
          />
        </div>
        {results.length > 0 && (
          <div className="max-h-32 overflow-y-auto border border-[var(--border)] rounded-[12px] bg-[var(--background)]">
            {results.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2">
                  <Avatar user={u} size="sm" />
                  <span className="text-[14px] text-[var(--text)]">{u.display_name}</span>
                </div>
                {isMember(u.id) ? (
                  <Check size={16} className="text-[var(--primary)]" />
                ) : (
                  <Button onClick={() => addGroupMember(conversation.id, u.id)}>Add</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
        <label className="text-[12px] font-semibold text-[var(--muted)] mb-2 block">Members ({conversation.participants.length})</label>
        <div className="space-y-3">
          {conversation.participants.map((p) => (
            <div key={p.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar user={p.user} size="md" />
                <div>
                  <div className="text-[15px] text-[var(--text)] font-medium">
                    {p.user_id === user.id ? "You" : p.user?.display_name}
                  </div>
                </div>
              </div>
              {p.user_id !== user.id && (
                <button 
                  onClick={() => removeGroupMember(conversation.id, p.user_id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  title="Remove from group"
                >
                  <UserMinus size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
