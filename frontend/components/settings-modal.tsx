import { useState, useEffect } from "react";
import { Moon, Sun, Bell, Lock, Smartphone, Link2, Shield, Sparkles } from "lucide-react";
import { Modal } from "@/components/modal";

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] px-6 py-4">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--muted)]">{title}</h3>
      {children}
    </div>
  );
}

function SettingRow({ icon: Icon, label, trailing, onClick }: { icon: React.ElementType; label: string; trailing?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[12px] p-3 text-left transition-colors hover:bg-[var(--hover)]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--search)] text-[var(--muted)]">
        <Icon size={18} strokeWidth={2} />
      </div>
      <span className="flex-1 text-[15px] text-[var(--text)]">{label}</span>
      {trailing}
    </button>
  );
}

function ComingSoonBadge() {
  return (
    <span className="rounded-full bg-[var(--search)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
      Coming Soon
    </span>
  );
}

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
      <div className="max-h-[420px] overflow-y-auto">
        {/* Appearance — Functional */}
        <SettingSection title="Appearance">
          <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] p-4">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={18} className="text-[var(--primary)]" /> : <Sun size={18} className="text-yellow-500" />}
              <span className="text-[15px] font-medium text-[var(--text)]">Dark Mode</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </SettingSection>

        {/* Notifications — Coming Soon */}
        <SettingSection title="Notifications">
          <SettingRow icon={Bell} label="Notification Preferences" trailing={<ComingSoonBadge />} />
        </SettingSection>

        {/* Privacy — Coming Soon */}
        <SettingSection title="Privacy">
          <SettingRow icon={Lock} label="Privacy Settings" trailing={<ComingSoonBadge />} />
          <SettingRow icon={Shield} label="End-to-End Encryption" trailing={<ComingSoonBadge />} />
        </SettingSection>

        {/* Placeholder Sections */}
        <SettingSection title="Linked Devices">
          <SettingRow icon={Smartphone} label="Linked Devices" trailing={<ComingSoonBadge />} />
        </SettingSection>

        <SettingSection title="Stories">
          <SettingRow icon={Sparkles} label="Stories" trailing={<ComingSoonBadge />} />
        </SettingSection>

        <SettingSection title="Advanced">
          <SettingRow icon={Link2} label="Storage & Data" trailing={<ComingSoonBadge />} />
        </SettingSection>
      </div>
    </Modal>
  );
}
