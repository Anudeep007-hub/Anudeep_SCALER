import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "h-12 w-full rounded-[14px] border border-transparent bg-[var(--search)] px-4 text-[15px] text-[var(--text)] placeholder:text-[var(--muted)] transition duration-150 focus:border-[var(--primary)] focus:bg-[var(--sidebar)]",
        className,
      )}
      {...props}
    />
  );
}
