import clsx from "clsx";
import type { User } from "@/types";

type AvatarProps = {
  user?: Pick<User, "display_name" | "avatar_url" | "is_online"> | null;
  label?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
};

const sizes = {
  sm: "h-9 w-9 text-[12px]",
  md: "h-10 w-10 text-[14px]",
  lg: "h-12 w-12 text-[16px]",
  xl: "h-[72px] w-[72px] text-[24px]",
};

export function Avatar({ user, label, src, size = "md", showStatus = false }: AvatarProps) {
  const name = user?.display_name || label || "Signal";
  const image = user?.avatar_url || src;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={clsx("relative shrink-0 overflow-hidden rounded-full bg-[var(--selection)]", sizes[size])} aria-label={name}>
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-[var(--primary)]">{initials}</div>
      )}
      {showStatus ? (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--sidebar)] bg-[var(--success)]" />
      ) : null}
    </div>
  );
}
