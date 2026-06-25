import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "quiet";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[12px] px-4 text-[14px] font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[var(--primary)] text-white hover:opacity-90",
        variant === "ghost" && "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]",
        variant === "quiet" && "text-[var(--muted)] hover:bg-[var(--hover)]",
        className,
      )}
      {...props}
    />
  );
}
