import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 text-primary-foreground shadow-sm shadow-primary/25 hover:translate-y-[-1px] hover:shadow-md hover:shadow-primary/35",
        outline:
          "border border-border/80 bg-background/70 px-4 py-2 backdrop-blur hover:bg-muted/70 hover:border-primary/30",
        ghost: "px-3 py-2 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
