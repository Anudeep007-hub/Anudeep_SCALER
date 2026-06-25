import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ className, label, children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition duration-150 hover:bg-[var(--hover)] hover:text-[var(--text)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
