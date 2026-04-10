import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}
