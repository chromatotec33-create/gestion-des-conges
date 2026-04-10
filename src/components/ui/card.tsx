import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass-panel p-5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-foreground/85", className)} {...props} />;
}

export function CardMetric({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-2 text-3xl font-semibold tracking-tight", className)} {...props} />;
}
