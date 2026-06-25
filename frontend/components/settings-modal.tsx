import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("signal_theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("signal_theme", next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="p-6 h-[300px]">
        <div className="mb-4">
          <h3 className="text-[16px] font-semibold text-[var(--text)]">Appearance</h3>
          <div className="mt-2 flex items-center justify-between rounded-[12px] border border-[var(--border)] p-4">
            <span className="text-[15px] font-medium text-[var(--text)]">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-[16px] font-semibold text-[var(--text)]">Privacy</h3>
          <p className="mt-1 text-[14px] text-[var(--muted)]">Privacy settings coming soon.</p>
        </div>
        <div className="mb-4">
          <h3 className="text-[16px] font-semibold text-[var(--text)]">Notifications</h3>
          <p className="mt-1 text-[14px] text-[var(--muted)]">Notification preferences coming soon.</p>
        </div>
      </div>
    </Modal>
  );
}
