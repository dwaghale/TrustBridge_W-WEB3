import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
        secondary: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        destructive: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        outline: "border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
        success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
