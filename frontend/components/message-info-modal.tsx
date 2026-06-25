import { Modal } from "@/components/modal";
import { formatClock, formatDate } from "@/lib/api";
import type { Message, User, Conversation } from "@/types";

type MessageInfoModalProps = {
  message: Message | null;
  conversation: Conversation;
  onClose: () => void;
  currentUser: User;
};

export function MessageInfoModal({ message, conversation, onClose, currentUser }: MessageInfoModalProps) {
  if (!message) return null;

  return (
    <Modal isOpen={!!message} onClose={onClose} title="Message Info">
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-[var(--received-bubble)] p-4 rounded-[12px] text-[15px] text-[var(--received-text)]">
          {message.message_type === "IMAGE" && message.attachment_url && (
             <img src={message.attachment_url} alt="" className="mb-2 max-h-[120px] rounded-[8px] object-cover" />
          )}
          {message.message_type === "FILE" && message.attachment_url && (
            <div className="mb-2 flex items-center gap-2 rounded-[8px] bg-white/10 p-2 text-[13px] underline">
              📎 {message.content}
            </div>
          )}
          {message.message_type !== "FILE" && (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <div>
            <div className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Sent</div>
            <div className="text-[14px]">{formatDate(message.created_at)} at {formatClock(message.created_at)}</div>
          </div>

          {message.sender_id === currentUser.id && (
            <>
              {message.receipts.filter(r => r.user_id !== currentUser.id).map(receipt => {
                const participant = conversation.participants.find(p => p.user_id === receipt.user_id);
                return (
                  <div key={receipt.user_id} className="border-t border-[var(--border)] pt-3">
                    <div className="text-[14px] font-medium mb-1">{participant?.user.display_name || "User"}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[var(--muted)]">Delivered</span>
                        <span>{receipt.delivered_at ? `${formatDate(receipt.delivered_at)} ${formatClock(receipt.delivered_at)}` : "—"}</span>
                      </div>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[var(--muted)]">Read</span>
                        <span>{receipt.read_at ? `${formatDate(receipt.read_at)} ${formatClock(receipt.read_at)}` : "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
