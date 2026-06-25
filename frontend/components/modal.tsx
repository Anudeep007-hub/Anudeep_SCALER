import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/icon-button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[16px] bg-[var(--sidebar)] shadow-sm animate-slide-up">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-6">
          <h2 className="text-[20px] font-semibold leading-[1.3] text-[var(--text)]">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
